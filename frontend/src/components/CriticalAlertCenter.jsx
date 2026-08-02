import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function CriticalAlertCenter({
  refreshKey,
}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);

        const response = await api.get("/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Critical Alerts Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [refreshKey]);

  const criticalEmployees = useMemo(() => {
    return employees
      .filter(
        (employee) =>
          employee.status === "Block" ||
          employee.risk_level === "High"
      )
      .sort((firstEmployee, secondEmployee) => {
        if (
          firstEmployee.status === "Block" &&
          secondEmployee.status !== "Block"
        ) {
          return -1;
        }

        if (
          secondEmployee.status === "Block" &&
          firstEmployee.status !== "Block"
        ) {
          return 1;
        }

        return (
          firstEmployee.trust_score -
          secondEmployee.trust_score
        );
      });
  }, [employees]);

  const mostCriticalEmployee = criticalEmployees[0];

  const createAlertMessage = (employee) => {
    const messages = [];

    if (employee.blocked_events > 0) {
      messages.push(
        `${employee.blocked_events} blocked security event${
          employee.blocked_events === 1 ? "" : "s"
        } detected.`
      );
    }

    if (employee.failed_logins > 0) {
      messages.push(
        `${employee.failed_logins} failed login attempt${
          employee.failed_logins === 1 ? "" : "s"
        } recorded.`
      );
    }

    if (employee.trust_score < 50) {
      messages.push(
        "The employee trust score is below the secure access threshold."
      );
    }

    return messages;
  };

  const createRecommendations = (employee) => {
    const recommendations = [
      "Review the employee's recent authentication activity.",
      "Verify active sessions and privileged access.",
    ];

    if (employee.status === "Block") {
      recommendations.push(
        "Keep access blocked until the investigation is complete."
      );
    }

    if (employee.failed_logins > 0) {
      recommendations.push(
        "Require a password reset and multi-factor authentication."
      );
    }

    if (employee.blocked_events >= 3) {
      recommendations.push(
        "Escalate the identity to the Security Operations Center."
      );
    }

    return recommendations;
  };

  if (loading) {
    return (
      <section className="critical-alert critical-alert-loading">
        Loading security alerts...
      </section>
    );
  }

  if (!mostCriticalEmployee) {
    return (
      <section className="critical-alert critical-alert-clear">
        <div className="critical-alert-clear-indicator" />

        <div>
          <span className="critical-alert-label">
            Security Alert Center
          </span>

          <h2>No critical identity alerts</h2>

          <p>
            No blocked or high-risk employee identities are
            currently detected.
          </p>
        </div>
      </section>
    );
  }

  const alertMessages = createAlertMessage(
    mostCriticalEmployee
  );

  const recommendations = createRecommendations(
    mostCriticalEmployee
  );

  return (
    <section className="critical-alert critical-alert-danger">
      <div className="critical-alert-header">
        <div className="critical-alert-heading">
          <span className="critical-alert-icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 3 2.8 19h18.4L12 3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />

              <path
                d="M12 9v4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <circle
                cx="12"
                cy="16"
                r="1"
                fill="currentColor"
              />
            </svg>
          </span>

          <div>
            <span className="critical-alert-label">
              Critical Security Alert
            </span>

            <h2>
              High-risk identity requires investigation
            </h2>

            <p>
              Suspicious authentication behavior has triggered
              an immediate identity security review.
            </p>
          </div>
        </div>

        <span className="critical-alert-severity">
          Critical
        </span>
      </div>

      <div className="critical-alert-content">
        <div className="critical-identity-card">
          <span className="critical-card-label">
            Affected Identity
          </span>

          <strong className="critical-employee-name">
            {mostCriticalEmployee.name}
          </strong>

          <div className="critical-identity-metrics">
            <div>
              <span>Status</span>
              <strong className="critical-status">
                {mostCriticalEmployee.status}
              </strong>
            </div>

            <div>
              <span>Trust Score</span>
              <strong>
                {mostCriticalEmployee.trust_score}
              </strong>
            </div>

            <div>
              <span>Risk Level</span>
              <strong className="critical-status">
                {mostCriticalEmployee.risk_level}
              </strong>
            </div>
          </div>
        </div>

        <div className="critical-alert-details">
          <div className="critical-alert-column">
            <h3>Detection Summary</h3>

            <ul>
              {alertMessages.map((message, index) => (
                <li key={index}>
                  {message}
                </li>
              ))}
            </ul>
          </div>

          <div className="critical-alert-column">
            <h3>Recommended Response</h3>

            <ul>
              {recommendations.map(
                (recommendation, index) => (
                  <li key={index}>
                    {recommendation}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>

      {criticalEmployees.length > 1 && (
        <div className="critical-alert-footer">
          {criticalEmployees.length - 1} additional high-risk
          identity
          {criticalEmployees.length - 1 === 1 ? "" : "ies"}{" "}
          require review.
        </div>
      )}
    </section>
  );
}