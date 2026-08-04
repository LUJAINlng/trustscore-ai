from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Event, User
from app.models.schemas import EventRequest
from app.services.ml_service import predict_identity_risk
from app.services.ai_engine import (
    generate_awareness_recommendation,
    generate_privilege_recommendation,
    generate_profile_assessment,
    generate_recommendations,
)
from app.services.risk_engine import calculate_risk
from app.services.user_service import (
    get_or_create_user,
    update_trust_score,
)

router = APIRouter()


def normalize_username(username: str) -> str:
    return username.strip().lower()


@router.post("/events")
def receive_event(
    event: EventRequest,
    db: Session = Depends(get_db),
):
    normalized_username = normalize_username(event.user)

    user = get_or_create_user(
        db,
        normalized_username,
    )

    risk, reasons = calculate_risk(
        event.model_dump()
    )

    ml_result = predict_identity_risk({
        "failed_login_count": event.failed_login_count,
        "impossible_travel": 0,
        "new_device": int(event.device == "new"),
        "vpn_detected": int(event.vpn),
        "tor_network": 0,
        "privileged_account": int(
            event.privileged_account
        ),
        "mfa_enabled": 1,
        "login_hour": event.hour,
        "geo_risk": int(
            event.location == "new_country"
        ),
        "device_reputation": int(
            event.device == "new"
        ),
    })

    current_score = user.trust_score

    trust_score = max(
        0,
        min(100, current_score - risk),
    )

    if trust_score >= 80:
        decision = "Allow"
    elif trust_score >= 50:
        decision = "Require MFA"
    else:
        decision = "Block"

    ml_prediction = ml_result["prediction"]
    ml_confidence = ml_result["confidence"]

    if decision == ml_prediction:
        hybrid_decision = decision
        review_required = False
    else:
        hybrid_decision = "Manual Review"
        review_required = True

    recommendations = generate_recommendations(
        risk,
        decision,
        reasons,
    )

    update_trust_score(
        db,
        user,
        trust_score,
    )

    user.status = decision

    db.commit()
    db.refresh(user)

    new_event = Event(
        user=normalized_username,
        event=event.event,
        risk_score=risk,
        trust_score=trust_score,
        decision=decision,
        reasons=", ".join(reasons),
        created_at=datetime.utcnow(),
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return {
        "user": normalized_username,
        "risk_score": risk,
        "trust_score": trust_score,
        "rule_decision": decision,
        "ml_prediction": ml_prediction,
        "ml_confidence": ml_confidence,
        "hybrid_decision": hybrid_decision,
        "review_required": review_required,
        "reasons": reasons,
        "recommendations": recommendations,
    }


@router.get("/events")
def get_events(
    db: Session = Depends(get_db),
):
    events = (
        db.query(Event)
        .order_by(Event.created_at.desc())
        .all()
    )

    return [
        {
            "id": event.id,
            "user": normalize_username(event.user),
            "event": event.event,
            "risk_score": event.risk_score,
            "trust_score": event.trust_score,
            "decision": event.decision,
            "created_at": event.created_at,
            "reasons": (
                event.reasons.split(", ")
                if event.reasons
                else []
            ),
        }
        for event in events
    ]


@router.get("/users/{username}")
def get_user(
    username: str,
    db: Session = Depends(get_db),
):
    normalized_username = normalize_username(
        username
    )

    user = get_or_create_user(
        db,
        normalized_username,
    )

    return {
        "name": user.name,
        "trust_score": user.trust_score,
        "status": user.status,
    }


@router.get("/profile/{username}")
def get_profile(
    username: str,
    db: Session = Depends(get_db),
):
    normalized_username = normalize_username(
        username
    )

    user = get_or_create_user(
        db,
        normalized_username,
    )

    events = (
        db.query(Event)
        .filter(
            func.lower(Event.user)
            == normalized_username
        )
        .all()
    )

    total_events = len(events)

    failed = len([
        stored_event
        for stored_event in events
        if stored_event.event == "failed_login"
    ])

    blocked = len([
        stored_event
        for stored_event in events
        if stored_event.decision == "Block"
    ])

    known_device_events = len([
        stored_event
        for stored_event in events
        if "New Device (+30)" not in (
            stored_event.reasons.split(", ")
            if stored_event.reasons
            else []
        )
    ])

    new_country_events = len([
        stored_event
        for stored_event in events
        if "New Country (+25)" in (
            stored_event.reasons.split(", ")
            if stored_event.reasons
            else []
        )
    ])

    vpn_events = len([
        stored_event
        for stored_event in events
        if "VPN Detected (+20)" in (
            stored_event.reasons.split(", ")
            if stored_event.reasons
            else []
        )
    ])

    failed_login_rate = (
        round(
            (failed / total_events) * 100,
            1,
        )
        if total_events > 0
        else 0
    )

    known_device_rate = (
        round(
            (
                known_device_events
                / total_events
            ) * 100,
            1,
        )
        if total_events > 0
        else 0
    )

    assessment = generate_profile_assessment(
        user.trust_score,
        failed,
        blocked,
    )

    privilege_recommendation = (
        generate_privilege_recommendation(
            user.trust_score,
            failed,
            blocked,
        )
    )

    awareness_recommendation = (
        generate_awareness_recommendation(
            user.trust_score,
            failed,
            vpn_events,
            new_country_events,
        )
    )

    return {
        "name": user.name,
        "trust_score": user.trust_score,
        "status": user.status,
        "total_events": total_events,
        "failed_logins": failed,
        "blocked_events": blocked,
        "assessment": assessment,
        "privilege_recommendation": (
            privilege_recommendation
        ),
        "awareness_recommendation": (
            awareness_recommendation
        ),
        "behavior": {
            "known_device_rate": (
                known_device_rate
            ),
            "failed_login_rate": (
                failed_login_rate
            ),
            "new_country_events": (
                new_country_events
            ),
            "vpn_events": vpn_events,
        },
    }


@router.get("/employees")
def get_employees(
    db: Session = Depends(get_db),
):
    users = db.query(User).all()
    employees = []
    processed_usernames = set()

    for user in users:
        normalized_username = normalize_username(
            user.name
        )

        if normalized_username in processed_usernames:
            continue

        processed_usernames.add(
            normalized_username
        )

        events = (
            db.query(Event)
            .filter(
                func.lower(Event.user)
                == normalized_username
            )
            .all()
        )

        total_events = len(events)

        blocked_events = len([
            stored_event
            for stored_event in events
            if stored_event.decision == "Block"
        ])

        failed_logins = len([
            stored_event
            for stored_event in events
            if stored_event.event
            == "failed_login"
        ])

        if user.trust_score >= 80:
            risk_level = "Low"
        elif user.trust_score >= 50:
            risk_level = "Medium"
        else:
            risk_level = "High"

        employees.append({
            "name": normalized_username,
            "trust_score": user.trust_score,
            "status": user.status,
            "risk_level": risk_level,
            "total_events": total_events,
            "failed_logins": failed_logins,
            "blocked_events": blocked_events,
        })

    return employees


@router.get("/profile/{username}/history")
def get_profile_history(
    username: str,
    db: Session = Depends(get_db),
):
    normalized_username = normalize_username(
        username
    )

    events = (
        db.query(Event)
        .filter(
            func.lower(Event.user)
            == normalized_username
        )
        .order_by(Event.created_at.asc())
        .all()
    )

    return [
        {
            "id": event.id,
            "trust_score": event.trust_score,
            "risk_score": event.risk_score,
            "decision": event.decision,
            "created_at": event.created_at,
        }
        for event in events
    ]