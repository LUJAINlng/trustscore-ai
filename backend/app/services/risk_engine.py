def calculate_risk(event: dict):
    risk = 0
    reasons = []

    failed_login_count = event.get("failed_login_count", 0)

    if event.get("device") == "new":
        risk += 30
        reasons.append("New Device (+30)")

    if event.get("event") == "failed_login":
        risk += 40
        reasons.append("Failed Login (+40)")
    elif failed_login_count >= 3:
        risk += 25
        reasons.append("Previous Failed Logins (+25)")

    if event.get("vpn") is True:
        risk += 20
        reasons.append("VPN Detected (+20)")

    if event.get("hour", 12) < 6:
        risk += 15
        reasons.append("Midnight Login (+15)")

    if event.get("location") == "new_country":
        risk += 25
        reasons.append("New Country (+25)")

    if event.get("privileged_account") is True:
        risk += 15
        reasons.append("Privileged Account (+15)")

    risk = min(risk, 100)
    return risk, reasons