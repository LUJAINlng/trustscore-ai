export default function RiskBreakdown({ latest }) {
  if (!latest) return null;

  const parseRiskReason = (reason) => {
    const scoreMatch = reason.match(/\(\+(\d+)\)/);

    const score = scoreMatch
      ? Number(scoreMatch[1])
      : 0;

    const label = reason
      .replace(/\s*\(\+\d+\)\s*/, "")
      .trim();

    return {
      label,
      score,
    };
  };

  const contributors = Array.isArray(latest.reasons)
    ? latest.reasons.map(parseRiskReason)
    : [];

  const calculatedTotal = contributors.reduce(
    (sum, item) => sum + item.score,
    0
  );

  const totalRisk =
    latest.risk_score ?? calculatedTotal;

  const maximumRisk = Math.max(
    totalRisk,
    ...contributors.map((item) => item.score),
    100
  );

  const riskLevel = () => {
    if (totalRisk >= 80) {
      return {
        label: "High",
        className: "risk-level-high",
      };
    }

    if (totalRisk >= 40) {
      return {
        label: "Medium",
        className: "risk-level-medium",
      };
    }

    return {
      label: "Low",
      className: "risk-level-low",
    };
  };

  const currentRiskLevel = riskLevel();

  return (
    <section className="panel risk-breakdown-panel">
      <div className="risk-breakdown-header">
        <div>
          <p className="risk-breakdown-kicker">
            Explainable Risk Analysis
          </p>

          <h2 className="panel-title">
            Risk Breakdown
          </h2>

          <p className="panel-description">
            Security indicators that contributed to the latest
            event risk score.
          </p>
        </div>

        <div className="risk-score-summary">
          <span>Total Risk Score</span>

          <strong>{totalRisk}</strong>

          <small
            className={`risk-level-badge ${currentRiskLevel.className}`}
          >
            {currentRiskLevel.label} Risk
          </small>
        </div>
      </div>

      {contributors.length > 0 ? (
        <div className="risk-breakdown-content">
          <div className="risk-contributors-list">
            {contributors.map((contributor, index) => {
              const width =
                maximumRisk > 0
                  ? Math.min(
                      (contributor.score / maximumRisk) * 100,
                      100
                    )
                  : 0;

              return (
                <article
                  className="risk-contributor"
                  key={`${contributor.label}-${index}`}
                >
                  <div className="risk-contributor-top">
                    <div>
                      <span className="risk-contributor-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <strong>
                        {contributor.label}
                      </strong>
                    </div>

                    <span className="risk-contributor-score">
                      +{contributor.score}
                    </span>
                  </div>

                  <div className="risk-progress-track">
                    <div
                      className="risk-progress-value"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="risk-decision-card">
            <span className="risk-decision-label">
              Access Decision
            </span>

            <strong
              className={`risk-decision-value risk-decision-${latest.decision
                .toLowerCase()
                .replaceAll(" ", "-")}`}
            >
              {latest.decision}
            </strong>

            <div className="risk-decision-divider" />

            <div className="risk-decision-detail">
              <span>Trust Score</span>
              <strong>{latest.trust_score}</strong>
            </div>

            <div className="risk-decision-detail">
              <span>Risk Indicators</span>
              <strong>{contributors.length}</strong>
            </div>

            <p className="risk-decision-note">
              The access decision was generated from the
              accumulated risk indicators and the employee's
              current trust score.
            </p>
          </aside>
        </div>
      ) : (
        <div className="risk-breakdown-empty">
          No risk contributors were detected for the latest
          security event.
        </div>
      )}
    </section>
  );
}