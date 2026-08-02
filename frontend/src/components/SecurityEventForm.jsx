import "./SecurityEventForm.css";

export default function SecurityEventForm({
  form,
  setForm,
  submitEvent,
}) {
  return (
    <section className="panel security-event-panel">
      <div className="security-event-header">
        <div>
          <p className="security-event-kicker">
            Identity Risk Evaluation
          </p>

          <h2 className="panel-title">
            Security Event Analysis
          </h2>

          <p className="panel-description">
            Simulate an identity event and calculate its trust,
            risk and access decision.
          </p>
        </div>

        <div className="engine-status">
          <span className="engine-status-dot" />
          Risk engine ready
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
            value={form.user}
            onChange={(event) =>
              setForm({
                ...form,
                user: event.target.value,
              })
            }
          />
        </label>

        <label className="security-field">
          <span className="security-field-label">
            Event Type
          </span>

          <select
            className="security-control"
            value={form.event}
            onChange={(event) =>
              setForm({
                ...form,
                event: event.target.value,
              })
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
            Device
          </span>

          <select
            className="security-control"
            value={form.device}
            onChange={(event) =>
              setForm({
                ...form,
                device: event.target.value,
              })
            }
          >
            <option value="known">
              Known Device
            </option>

            <option value="new">
              New Device
            </option>
          </select>
        </label>

        <label className="security-field">
          <span className="security-field-label">
            Location
          </span>

          <select
            className="security-control"
            value={form.location}
            onChange={(event) =>
              setForm({
                ...form,
                location: event.target.value,
              })
            }
          >
            <option value="known">
              Known Country
            </option>

            <option value="new_country">
              New Country
            </option>
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
            value={form.hour}
            onChange={(event) =>
              setForm({
                ...form,
                hour: Number(event.target.value),
              })
            }
          />
        </label>

        <div className="security-field">
          <span className="security-field-label">
            VPN Connection
          </span>

          <label className="vpn-field">
            <input
              type="checkbox"
              checked={form.vpn}
              onChange={(event) =>
                setForm({
                  ...form,
                  vpn: event.target.checked,
                })
              }
            />

            <span className="vpn-track">
              <span className="vpn-thumb" />
            </span>

            <span className="vpn-text">
              {form.vpn ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>
      </div>

      <div className="security-action-row">
        <div className="security-action-note">
          The event will be analyzed using the current
          trust and risk rules.
        </div>

        <button
          className="security-analyze-button"
          type="button"
          onClick={submitEvent}
        >
          <span className="security-button-icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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

          <span>
            Analyze Security Event
          </span>

          <span className="security-button-arrow">
            →
          </span>
        </button>
      </div>
    </section>
  );
}