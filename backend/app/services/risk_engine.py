def calculate_risk(event: dict):

    risk = 0
    reasons = []

    if event.get("device") == "new":
        risk += 30
        reasons.append("New Device (+30)")

    if event.get("event") == "failed_login":
        risk += 40
        reasons.append("Failed Login (+40)")

    if event.get("vpn") is True:
        risk += 20
        reasons.append("VPN Detected (+20)")

    if event.get("hour", 12) < 6:
        risk += 15
        reasons.append("Midnight Login (+15)")

    if event.get("location") == "new_country":
        risk += 25
        reasons.append("New Country (+25)")

    return risk, reasons