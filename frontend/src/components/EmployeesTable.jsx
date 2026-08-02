import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function EmployeesTable() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortType, setSortType] = useState("trust-desc");

  const loadEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Employees Error:", error);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    if (search.trim()) {
      result = result.filter((employee) =>
        employee.name
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (employee) => employee.status === statusFilter
      );
    }

    if (sortType === "trust-desc") {
      result.sort((a, b) => b.trust_score - a.trust_score);
    }

    if (sortType === "trust-asc") {
      result.sort((a, b) => a.trust_score - b.trust_score);
    }

    if (sortType === "risk") {
      const riskOrder = {
        High: 3,
        Medium: 2,
        Low: 1,
      };

      result.sort(
        (a, b) =>
          riskOrder[b.risk_level] - riskOrder[a.risk_level]
      );
    }

    return result;
  }, [employees, search, statusFilter, sortType]);

  const statusStyle = (status) => {
    if (status === "Allow") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "Require MFA") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  };

  const riskStyle = (riskLevel) => {
    if (riskLevel === "Low") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (riskLevel === "Medium") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  };

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            👥 Organization Employees ({employees.length})
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#6b7280",
            }}
          >
            Monitor employee trust and organizational risk.
          </p>
        </div>

        <button
          onClick={loadEmployees}
          style={{
            padding: "10px 16px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={controlStyle}
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          style={controlStyle}
        >
          <option value="All">All Statuses</option>
          <option value="Allow">Allow</option>
          <option value="Require MFA">Require MFA</option>
          <option value="Block">Block</option>
        </select>

        <select
          value={sortType}
          onChange={(event) => setSortType(event.target.value)}
          style={controlStyle}
        >
          <option value="trust-desc">
            Highest Trust First
          </option>
          <option value="trust-asc">
            Lowest Trust First
          </option>
          <option value="risk">
            Highest Risk First
          </option>
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "850px",
          }}
        >
          <thead
            style={{
              backgroundColor: "#111827",
              color: "white",
            }}
          >
            <tr>
              <th style={th}>Employee</th>
              <th style={th}>Trust Score</th>
              <th style={th}>Status</th>
              <th style={th}>Risk Level</th>
              <th style={th}>Total Events</th>
              <th style={th}>Failed Logins</th>
              <th style={th}>Blocked Events</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.name}>
                <td style={td}>
                  <strong>{employee.name}</strong>
                </td>

                <td style={td}>
                  <strong>{employee.trust_score}</strong>
                </td>

                <td style={td}>
                  <span
                    style={{
                      ...badgeStyle,
                      ...statusStyle(employee.status),
                    }}
                  >
                    {employee.status}
                  </span>
                </td>

                <td style={td}>
                  <span
                    style={{
                      ...badgeStyle,
                      ...riskStyle(employee.risk_level),
                    }}
                  >
                    {employee.risk_level}
                  </span>
                </td>

                <td style={td}>{employee.total_events}</td>
                <td style={td}>{employee.failed_logins}</td>
                <td style={td}>{employee.blocked_events}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEmployees.length === 0 && (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          No employees match the selected filters.
        </div>
      )}
    </div>
  );
}

const controlStyle = {
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "white",
  width: "100%",
  boxSizing: "border-box",
};

const badgeStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  fontWeight: "bold",
  fontSize: "13px",
};

const th = {
  padding: "13px",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const td = {
  padding: "13px",
  borderBottom: "1px solid #e5e7eb",
};