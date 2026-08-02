import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function ExecutiveOverview() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await api.get("/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Security Posture Error:", error);
      }
    };

    loadEmployees();
  }, []);

  const posture = useMemo(() => {
    const total = employees.length;

    const averageTrust =
      total > 0
        ? employees.reduce(
            (sum, employee) => sum + employee.trust_score,
            0
          ) / total
        : 0;

    const highRisk = employees.filter(
      (employee) => employee.risk_level === "High"
    ).length;

    const blocked = employees.filter(
      (employee) => employee.status === "Block"
    ).length;

    const requireMfa = employees.filter(
      (employee) => employee.status === "Require MFA"
    ).length;

    const safeUsers = employees.filter(
      (employee) => employee.status === "Allow"
    ).length;

    let overallRisk = "Low";
    let statusMessage =
      "The organization is currently operating within normal trust levels.";

    if (blocked > 0 || highRisk >= 2 || averageTrust < 50) {
      overallRisk = "High";
      statusMessage =
        "Immediate review is recommended for high-risk and blocked identities.";
    } else if (
      highRisk > 0 ||
      requireMfa > 0 ||
      averageTrust < 80
    ) {
      overallRisk = "Medium";
      statusMessage =
        "Some identities require additional verification and monitoring.";
    }

    return {
      total,
      averageTrust: averageTrust.toFixed(1),
      highRisk,
      blocked,
      requireMfa,
      safeUsers,
      overallRisk,
      statusMessage,
    };
  }, [employees]);

  const riskClass = {
    High: "posture-high",
    Medium: "posture-medium",
    Low: "posture-low",
  }[posture.overallRisk];

  return (
    <section className={`security-posture ${riskClass}`}>
      <div className="security-posture-header">
        <div>
          <p className="security-posture-kicker">
            Organization Security Posture
          </p>

          <h2 className="security-posture-title">
            Current Identity Risk Status
          </h2>

          <p className="security-posture-description">
            Executive assessment of employee trust, access
            decisions and identity risk.
          </p>
        </div>

        <div className="overall-risk">
          <span className="overall-risk-label">
            Overall Risk
          </span>

          <strong className="overall-risk-value">
            {posture.overallRisk}
          </strong>
        </div>
      </div>

      <div className="security-posture-grid">
        <article className="posture-metric">
          <span>Employees</span>
          <strong>{posture.total}</strong>
        </article>

        <article className="posture-metric">
          <span>Average Trust</span>
          <strong>{posture.averageTrust}</strong>
        </article>

        <article className="posture-metric posture-danger">
          <span>High Risk</span>
          <strong>{posture.highRisk}</strong>
        </article>

        <article className="posture-metric posture-danger">
          <span>Blocked</span>
          <strong>{posture.blocked}</strong>
        </article>

        <article className="posture-metric posture-warning">
          <span>Require MFA</span>
          <strong>{posture.requireMfa}</strong>
        </article>

        <article className="posture-metric posture-success">
          <span>Safe Users</span>
          <strong>{posture.safeUsers}</strong>
        </article>
      </div>

      <div className="security-posture-summary">
        <div className="posture-summary-indicator" />

        <div>
          <strong>Current Assessment</strong>
          <p>{posture.statusMessage}</p>
        </div>
      </div>
    </section>
  );
}