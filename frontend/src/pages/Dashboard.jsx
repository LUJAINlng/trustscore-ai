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
    device: "known",
    vpn: false,
    hour: 12,
    location: "known",
  });

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
      await api.post("/events", {
        ...form,
        user: form.user.trim(),
      });

      await loadEvents();

      setForm({
        user: "",
        event: "login",
        device: "known",
        vpn: false,
        hour: 12,
        location: "known",
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

        <EmployeesTable />

        <UserProfile />

        <SecurityEventForm
          form={form}
          setForm={setForm}
          submitEvent={submitEvent}
        />

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

      <div className="analysis-grid">
        <AIExplanation latest={latest} />
        <AIRecommendations latest={latest} />
      </div>
    </section>

    <RiskBreakdown latest={latest} />

    
  </>
)}

        

        
      </div>
    </main>
  );
}