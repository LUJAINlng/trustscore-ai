import { useEffect, useState } from "react";
import api from "../services/api";

import ExecutiveOverview from "../components/ExecutiveOverview";
import EmployeesTable from "../components/EmployeesTable";
import UserProfile from "../components/UserProfile";
import SummaryCards from "../components/SummaryCards";
import AIExplanation from "../components/AIExplanation";
import AIRecommendations from "../components/AIRecommendations";
import SecurityEventForm from "../components/SecurityEventForm";
import RiskBreakdown from "../components/RiskBreakdown";
import CriticalAlertCenter from "../components/CriticalAlertCenter";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

import "../styles/dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [events, setEvents] = useState([]);

  const [form, setForm] = useState({
  user: "",
  event: "login",

  failed_login_count: 0,

  device: "known",
  location: "known",

  vpn: false,
  impossible_travel: false,
  tor_network: false,
  privileged_account: false,
  mfa_enabled: true,

  hour: 12,

  geo_risk: 0,
  device_reputation: 0,
});
const [hybridResult, setHybridResult] = useState(null);

  const loadEvents = async () => {
    try {
      const response = await api.get("/events");
      setEvents(response.data);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const submitEvent = async () => {
  if (!form.user.trim()) {
    alert("Please enter a username");
    return;
  }

  try {
    const response = await api.post("/events", {
      ...form,
      user: form.user.trim(),
    });

    setHybridResult(response.data);

    await loadEvents();
   

    setForm({
  user: "",
  event: "login",
  failed_login_count: 0,
  device: "known",
  location: "known",
  vpn: false,
  privileged_account: false,
  hour: 12,
});
  } catch (error) {
    console.error("Submit Event Error:", error);
    alert("Failed to analyze the event");
  }
};

  const latest =
    events.length > 0 ? events[events.length - 1] : null;

  const chartData = {
    labels: events.map((event) =>
      new Date(event.created_at).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "Trust Score",
        data: events.map((event) => event.trust_score),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.12)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Risk Score",
        data: events.map((event) => event.risk_score),
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.08)",
        fill: false,
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#eef2f6",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
      },
    },
  };

  const decisionClass = (decision) => {
    if (decision === "Allow") {
      return "badge badge-allow";
    }

    if (decision === "Require MFA") {
      return "badge badge-mfa";
    }

    return "badge badge-block";
  };

  return (
    <main className="app-shell">
  <div className="dashboard-container">
    <header className="app-header">
      <div className="header-brand">
        <img
          src="/favicon2.png"
          alt="TrustScore AI"
          className="header-logo"
        />

        <div className="header-copy">
          <p className="brand-kicker">
            Identity Security Platform
          </p>

          <h1 className="app-title">
            TrustScore AI
          </h1>

          <p className="app-subtitle">
            Identity trust scoring, behavioral analytics,
            security recommendations and adaptive access
            decisions for modern organizations.
          </p>
        </div>
      </div>

      <span className="version-badge">
        Version 1.0
      </span>
    </header>

        <ExecutiveOverview />
        <CriticalAlertCenter refreshKey={events.length} />

        <EmployeesTable refreshKey={events.length} />

        <UserProfile />

        <SecurityEventForm
          form={form}
          setForm={setForm}
          submitEvent={submitEvent}
        />
        {hybridResult && (
  <section className="panel hybrid-analysis-panel">
    <div className="panel-header">
      <div>
        <p className="hybrid-analysis-kicker">
          Hybrid Decision Intelligence
        </p>

        <h2 className="panel-title">
          Hybrid AI Analysis
        </h2>

        <p className="panel-description">
          Combined assessment from the rule engine and
          Random Forest model.
        </p>
      </div>

      <span
        className={
          hybridResult.review_required
            ? "hybrid-status hybrid-status-review"
            : "hybrid-status hybrid-status-ready"
        }
      >
        {hybridResult.review_required
          ? "Manual Review Required"
          : "Decision Confirmed"}
      </span>
    </div>

    <div className="hybrid-result-grid">
      <article className="hybrid-result-card">
        <span className="hybrid-result-label">
          Rule Engine
        </span>

        <strong className="hybrid-result-value">
          {hybridResult.rule_decision}
        </strong>

        <span className="hybrid-result-caption">
  {hybridResult.review_required
    ? "Rule Engine and Random Forest disagreed. Manual review is required."
    : "Rule Engine and Random Forest reached the same decision."}
</span>
      </article>

      <article className="hybrid-result-card">
        <span className="hybrid-result-label">
          Random Forest
        </span>

        <strong className="hybrid-result-value">
          {hybridResult.ml_prediction}
        </strong>

        <span className="hybrid-result-caption">
          Machine-learning prediction
        </span>
      </article>

      <article className="hybrid-result-card">
        <span className="hybrid-result-label">
          Model Confidence
        </span>

        <strong className="hybrid-result-value">
          {Math.round(
            hybridResult.ml_confidence * 100
          )}
          %
        </strong>

        <span className="hybrid-result-caption">
          Prediction probability
        </span>
      </article>

      <article
  className={`hybrid-result-card hybrid-final-card ${
    hybridResult.hybrid_decision === "Allow"
      ? "hybrid-allow"
      : hybridResult.hybrid_decision === "Require MFA"
      ? "hybrid-mfa"
      : hybridResult.hybrid_decision === "Block"
      ? "hybrid-block"
      : "hybrid-review"
  }`}
>
  <span className="hybrid-result-label">
    Final Hybrid Decision
  </span>

  <strong className="hybrid-result-value">
    {hybridResult.hybrid_decision}
  </strong>

  <span className="hybrid-result-caption">
    {hybridResult.review_required
      ? "Rule Engine and Random Forest disagreed. Manual review is required."
      : "Rule Engine and Random Forest reached the same decision."}
  </span>
</article>
    </div>
  </section>
)}

        {latest && (
  <>
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">
            Latest Security Analysis
          </h2>

          <p className="panel-description">
            Decision and AI analysis for the most recent
            identity event.
          </p>
        </div>
      </div>

      <SummaryCards latest={latest} />

      
    </section>

    <RiskBreakdown latest={latest} />

    
  </>
)}

        

        
      </div>
    </main>
  );
}