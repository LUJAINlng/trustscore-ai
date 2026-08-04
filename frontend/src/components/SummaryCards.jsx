export default function SummaryCards({ latest }) {
  if (!latest) return null;

  const decisionClass = () => {
    if (latest.decision === "Allow") {
      return "badge badge-allow";
    }

    if (latest.decision === "Require MFA") {
      return "badge badge-mfa";
    }

    return "badge badge-block";
  };

  return (
    <div className="latest-grid">
      <article className="latest-card">
        <span className="latest-card-label">
          User
        </span>

        <h3 className="latest-card-value">
          {latest.user}
        </h3>
      </article>

      <article className="latest-card">
        <span className="latest-card-label">
          Trust Score
        </span>

        <h3 className="latest-card-value">
          {latest.trust_score}
        </h3>
      </article>

      <article className="latest-card">
        <span className="latest-card-label">
          Risk Score
        </span>

        <h3 className="latest-card-value">
          {latest.risk_score}
        </h3>
      </article>

      <article className="latest-card">
        <span className="latest-card-label">
          Access Decision
        </span>

        <div style={{ marginTop: "16px" }}>
          <span className={decisionClass()}>
            {latest.decision}
          </span>
        </div>
      </article>
    </div>
  );
}