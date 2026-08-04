from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import User


def get_or_create_user(db: Session, username: str):
    username = username.strip().lower()

    user = (
        db.query(User)
        .filter(func.lower(User.name) == username)
        .first()
    )

    if not user:
        user = User(
            name=username,
            trust_score=100,
            status="Active"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def update_trust_score(db: Session, user: User, new_score: int):
    user.trust_score = new_score
    return user