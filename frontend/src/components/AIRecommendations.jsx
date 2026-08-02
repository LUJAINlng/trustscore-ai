export default function AIRecommendations({ latest }) {
  if (!latest) return null;

  const recommendations = [];

  if (latest.decision === "Block") {
    recommendations.push(
      "Keep the login attempt blocked."
    );

    recommendations.push(
      "Require a password reset."
    );

    recommendations.push(
      "Notify the security operations team."
    );

    recommendations.push(
      "Require MFA before the next login."
    );
  }

  if (latest.decision === "Require MFA") {
    recommendations.push(
      "Verify the employee using MFA."
    );

    recommendations.push(
      "Review the device and login location."
    );

    recommendations.push(
      "Increase monitoring for this session."
    );
  }

  if (latest.decision === "Allow") {
    recommendations.push(
      "Allow access with normal monitoring."
    );
  }

  return (
    <article className="analysis-card">
      <h3>Security Recommendations</h3>

      <ul>
        {recommendations.map(
          (recommendation, index) => (
            <li key={index}>
              {recommendation}
            </li>
          )
        )}
      </ul>
    </article>
  );
}