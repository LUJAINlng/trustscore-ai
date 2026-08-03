import "./SecurityEventForm.css";

export default function SecurityEventForm({
  form,
  setForm,
  submitEvent,
}) {
  const updateField = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  return (
    <section className="panel security-event-panel">
      <div className="security-event-header">
        <div>
          <p className="security-event-kicker">
            Hybrid Identity Risk Evaluation
          </p>

          <h2 className="panel-title">
            Security Event Analysis
          </h2>

          <p className="panel-description">
            Analyze an identity event using security rules and
            a Random Forest risk model.
          </p>
        </div>

        <div className="engine-status">
          <span className="engine-status-dot" />
          Hybrid engine ready
        </div>
      </div>

      <div className="security-event-grid">
        <label className="security-field">
          <span className="security-field-label">
            Username
          </span>

          <input
            className="security-control"
            type="text"
            placeholder="e.g. ahmed"
            value={form.user ?? ""}
            onChange={(event) =>
              updateField("user", event.target.value)
            }
          />
        </label>

        <label className="security-field">
          <span className="security-field-label">
            Event Type
          </span>

          <select
            className="security-control"
            value={form.event ?? "login"}
            onChange={(event) =>
              updateField("event", event.target.value)
            }
          >
            <option value="login">Login</option>
            <option value="failed_login">
              Failed Login
            </option>
          </select>
        </label>

        <label className="security-field">
          <span className="security-field-label">
            Failed Login Count
          </span>

          <input
            className="security-control"
            type="number"
            min="0"
            max="50"
            value={form.failed_login_count ?? 0}
            onChange={(event) =>
              updateField(
                "failed_login_count",
                Number(event.target.value)
              )
            }
          />
        </label>

        <label className="security-field">
          <span className="security-field-label">
            Device
          </span>

          <select
            className="security-control"
            value={form.device ?? "known"}
            onChange={(event) =>
              updateField("device", event.target.value)
            }
          >
            <option value="known">Known Device</option>
            <option value="new">New Device</option>
          </select>
        </label>

        <label className="security-field">
          <span className="security-field-label">
            Location
          </span>

          <select
            className="security-control"
            value={form.location ?? "known"}
            onChange={(event) =>
              updateField("location", event.target.value)
            }
          >
            <option value="known">Known Country</option>
            <option value="new_country">New Country</option>
          </select>
        </label>

        <label className="security-field">
          <span className="security-field-label">
            Login Hour
          </span>

          <input
            className="security-control"
            type="number"
            min="0"
            max="23"
            value={form.hour ?? 12}
            onChange={(event) =>
              updateField(
                "hour",
                Number(event.target.value)
              )
            }
          />
        </label>

        <ToggleField
          label="VPN Connection"
          checked={form.vpn ?? false}
          onChange={(value) =>
            updateField("vpn", value)
          }
        />

        <ToggleField
          label="Privileged Account"
          checked={form.privileged_account ?? false}
          onChange={(value) =>
            updateField("privileged_account", value)
          }
        />
      </div>

      <div className="security-action-row">
        <div className="security-action-note">
          The event will be evaluated by the rule engine and
          the Random Forest model.
        </div>

        <button
          className="security-analyze-button"
          type="button"
          onClick={submitEvent}
        >
          <span className="security-button-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 3 5 6v5c0 4.8 2.9 8.3 7 10 4.1-1.7 7-5.2 7-10V6l-7-3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />

              <path
                d="m9 12 2 2 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span>Run Hybrid Analysis</span>

          <span className="security-button-arrow">
            →
          </span>
        </button>
      </div>
    </section>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}) {
  return (
    <div className="security-field">
      <span className="security-field-label">
        {label}
      </span>

      <label className="vpn-field">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(event.target.checked)
          }
        />

        <span className="vpn-track">
          <span className="vpn-thumb" />
        </span>

        <span className="vpn-text">
          {checked ? "Enabled" : "Disabled"}
        </span>
      </label>
    </div>
  );
}