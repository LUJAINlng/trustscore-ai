def generate_recommendations(risk, decision, reasons):
    recommendations = []

    if decision == "Block":
        recommendations.append("Immediately block the login attempt.")
        recommendations.append("Force password reset.")
        recommendations.append("Notify Security Operations Center.")
        recommendations.append("Temporarily reduce user privileges.")

    elif decision == "Require MFA":
        recommendations.append("Require Multi-Factor Authentication.")
        recommendations.append("Verify user identity.")
        recommendations.append("Monitor upcoming login attempts.")

    else:
        recommendations.append("Allow access.")
        recommendations.append("Continue monitoring user activity.")

    if "VPN Detected (+20)" in reasons:
        recommendations.append("Investigate VPN usage.")

    if "New Country (+25)" in reasons:
        recommendations.append("Verify travel or possible account compromise.")

    if "Failed Login (+40)" in reasons:
        recommendations.append("Check for brute-force attack.")

    return recommendations
def generate_profile_assessment(
    trust_score: int,
    failed_logins: int,
    blocked_events: int,
) -> list[str]:
    assessment = []

    if trust_score >= 80:
        assessment.append("User behavior is normal.")
        assessment.append("No suspicious activity detected.")
        assessment.append("Continue normal monitoring.")

    elif trust_score >= 50:
        assessment.append("Medium security risk detected.")
        assessment.append("Require Multi-Factor Authentication.")
        assessment.append("Monitor upcoming login attempts.")

    else:
        assessment.append("High security risk detected.")
        assessment.append("Keep access blocked.")
        assessment.append("Notify the Security Operations Center.")
        assessment.append("Recommend a password reset.")

    if failed_logins >= 3:
        assessment.append(
            "Repeated failed logins may indicate a brute-force attempt."
        )

    if blocked_events >= 3:
        assessment.append(
            "Review the employee's access privileges."
        )

    return assessment
def generate_privilege_recommendation(
    trust_score: int,
    failed_logins: int,
    blocked_events: int,
):
    recommendation = []

    if trust_score < 50:
        recommendation.append("Disable VPN access.")
        recommendation.append("Require password reset.")
        recommendation.append("Temporarily reduce privileged access.")

    elif trust_score < 80:
        recommendation.append("Require Multi-Factor Authentication.")
        recommendation.append("Increase login monitoring.")
        recommendation.append("Review recent login activity.")

    else:
        recommendation.append("Maintain current access privileges.")
        recommendation.append("Continue normal monitoring.")

    if blocked_events >= 3:
        recommendation.append(
            "Security team should review user permissions."
        )

    return recommendation
def generate_awareness_recommendation(
    trust_score: int,
    failed_logins: int,
    vpn_events: int,
    new_country_events: int,
) -> dict:
    training = []
    priority = "Low"

    if failed_logins > 0:
        training.append("Password Security")
        training.append("Phishing Awareness")

    if vpn_events > 0:
        training.append("Secure VPN Usage")

    if new_country_events > 0:
        training.append("Travel and Location Security")

    if trust_score < 50:
        training.append("Multi-Factor Authentication Awareness")
        priority = "High"
    elif trust_score < 80:
        priority = "Medium"

    if not training:
        training.append("General Cybersecurity Awareness")

    return {
        "priority": priority,
        "training": list(dict.fromkeys(training)),
    }