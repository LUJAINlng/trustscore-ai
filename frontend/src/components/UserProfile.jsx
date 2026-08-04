import { useState } from "react";
import api from "../services/api";


export default function UserProfile() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);

  const loadProfile = async () => {
    if (!username.trim()) return;

    try {
      const response = await api.get(`/profile/${username.trim()}`);
      setProfile(response.data);
    } catch (error) {
      console.error("Profile Error:", error);
      setProfile(null);
      alert("User not found");
    }
  };

  const statusColor = (status) => {
    if (status === "Allow") return "#16a34a";
    if (status === "Require MFA") return "#f59e0b";
    return "#dc2626";
  };

  const priorityColor = (priority) => {
    if (priority === "Low") return "#16a34a";
    if (priority === "Medium") return "#f59e0b";
    return "#dc2626";
  };

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,.1)",
        marginBottom: "30px",
      }}
    >
      <h2>👤 Employee Trust Profile</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              loadProfile();
            }
          }}
          style={{
            padding: "10px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            minWidth: "220px",
          }}
        />

        <button
          onClick={loadProfile}
          style={{
            padding: "10px 18px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {profile && (
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "20px",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>
            👤 {profile.name}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
            }}
          >
            <div style={statBox}>
              <strong>Trust Score</strong>
              <h2 style={{ color: "#2563eb" }}>
                {profile.trust_score}
              </h2>
            </div>

            <div style={statBox}>
              <strong>Status</strong>
              <h2 style={{ color: statusColor(profile.status) }}>
                {profile.status}
              </h2>
            </div>

            <div style={statBox}>
              <strong>Total Events</strong>
              <h2>{profile.total_events}</h2>
            </div>

            <div style={statBox}>
              <strong>Failed Logins</strong>
              <h2>{profile.failed_logins}</h2>
            </div>

            <div style={statBox}>
              <strong>Blocked Events</strong>
              <h2>{profile.blocked_events}</h2>
            </div>
          </div>
                    <div
            style={{
              marginTop: "25px",
              padding: "18px",
              background: "#f8fafc",
              borderRadius: "10px",
              borderLeft: `5px solid ${statusColor(profile.status)}`,
            }}
          >
            <h3>AI Security Insights</h3>

            <h4>Assessment</h4>

            {profile.assessment?.length > 0 ? (
              <ul>
                {profile.assessment.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>No assessment available.</p>
            )}

            <h4 style={{ marginTop: "20px" }}>
              Privilege Recommendation
            </h4>

            {profile.privilege_recommendation?.length > 0 ? (
              <ul>
                {profile.privilege_recommendation.map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>
            ) : (
              <p>No recommendation available.</p>
            )}

            <h4 style={{ marginTop: "20px" }}>
              Security Awareness
            </h4>

            {profile.awareness_recommendation?.training?.length >
            0 ? (
              <ul>
                {profile.awareness_recommendation.training.map(
                  (course, index) => (
                    <li key={index}>{course}</li>
                  )
                )}
              </ul>
            ) : (
              <p>No training required.</p>
            )}
          </div>

          {profile.behavior && (
            <div
              style={{
                marginTop: "25px",
                padding: "18px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
              }}
            >
              <h3>Behavior Analytics</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "15px",
                  marginTop: "15px",
                }}
              >
                <div style={statBox}>
                  <strong>Failed Login Rate</strong>
                  <h2>{profile.behavior.failed_login_rate}%</h2>
                </div>

                <div style={statBox}>
                  <strong>New Country Events</strong>
                  <h2>{profile.behavior.new_country_events}</h2>
                </div>

                <div style={statBox}>
                  <strong>VPN Events</strong>
                  <h2>{profile.behavior.vpn_events}</h2>
                </div>
              </div>
            </div>
          )}

                  </div>
      )}
    </div>
  );
}

const statBox = {
  padding: "15px",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  background: "#ffffff",
};

