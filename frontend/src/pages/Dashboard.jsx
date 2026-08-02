import { useEffect, useState } from "react";
import api from "../services/api";

import ExecutiveOverview from "../components/ExecutiveOverview";
import EmployeesTable from "../components/EmployeesTable";
import UserProfile from "../components/UserProfile";
import SummaryCards from "../components/SummaryCards";
import AIExplanation from "../components/AIExplanation";
import AIRecommendations from "../components/AIRecommendations";
import SecurityEventForm from "../components/SecurityEventForm";
import IdentityTimeline from "../components/IdentityTimeline";
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
          <div>
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

    <IdentityTimeline
      events={events}
      username={latest.user}
    />
  </>
)}

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                Trust and Risk Timeline
              </h2>

              <p className="panel-description">
                Historical relationship between identity trust
                and security risk.
              </p>
            </div>
          </div>

          {events.length > 0 ? (
            <div className="chart-container">
              <Line
                data={chartData}
                options={chartOptions}
              />
            </div>
          ) : (
            <div className="empty-state">
              No event history is currently available.
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                Recent Security Events
              </h2>

              <p className="panel-description">
                Latest identity and access events processed by
                the platform.
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Event</th>
                  <th>Risk</th>
                  <th>Trust</th>
                  <th>Decision</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {[...events].reverse().map((event) => (
                  <tr key={event.id}>
                    <td className="employee-name">
                      {event.user}
                    </td>

                    <td>{event.event}</td>
                    <td>{event.risk_score}</td>
                    <td>{event.trust_score}</td>

                    <td>
                      <span
                        className={decisionClass(
                          event.decision
                        )}
                      >
                        {event.decision}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        event.created_at
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {events.length === 0 && (
            <div className="empty-state">
              No security events are currently available.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}