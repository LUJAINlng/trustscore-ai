import { useEffect, useState } from "react";
import api from "../services/api";
import { Line } from "react-chartjs-2";

export default function EmployeeTrustHistory({ username }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!username) {
      setHistory([]);
      return;
    }

    const loadHistory = async () => {
      try {
        const response = await api.get(
          `/profile/${username}/history`
        );

        setHistory(response.data);
      } catch (error) {
        console.error("History Error:", error);
        setHistory([]);
      }
    };

    loadHistory();
  }, [username]);

  if (!username || history.length === 0) return null;

  const chartData = {
    labels: history.map((item) =>
      new Date(item.created_at).toLocaleString()
    ),
    datasets: [
      {
        label: "Trust Score",
        data: history.map((item) => item.trust_score),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.15)",
        fill: true,
        tension: 0.35,
      },
      {
        label: "Risk Score",
        data: history.map((item) => item.risk_score),
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.10)",
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
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div
      style={{
        marginTop: "25px",
        padding: "18px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
      }}
    >
      <h3>📈 Employee Trust History</h3>

      <div style={{ height: "320px" }}>
        <Line
          data={chartData}
          options={chartOptions}
        />
      </div>
    </div>
  );
}