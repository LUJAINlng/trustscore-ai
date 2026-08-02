import { useMemo } from "react";

export default function IdentityTimeline({
  events,
  username,
}) {
  const userEvents = useMemo(() => {
    if (!username || !Array.isArray(events)) {
      return [];
    }

    return events
      .filter((event) => event.user === username)
      .sort(
        (firstEvent, secondEvent) =>
          new Date(firstEvent.created_at) -
          new Date(secondEvent.created_at)
      );
  }, [events, username]);

  const formatEventName = (eventName) => {
    if (!eventName) return "Security Event";

    return eventName
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const decisionClass = (decision) => {
    if (decision === "Allow") {
      return "timeline-decision timeline-allow";
    }

    if (decision === "Require MFA") {
      return "timeline-decision timeline-mfa";
    }

    return "timeline-decision timeline-block";
  };

  const eventClass = (event) => {
    if (event.decision === "Block") {
      return "timeline-node timeline-node-critical";
    }

    if (event.decision === "Require MFA") {
      return "timeline-node timeline-node-warning";
    }

    return "timeline-node timeline-node-normal";
  };

  if (!username || userEvents.length === 0) {
    return null;
  }

  return (
    <section className="panel identity-timeline-panel">
      <div className="identity-timeline-header">
        <div>
          <p className="identity-timeline-kicker">
            Investigation Sequence
          </p>

          <h2 className="panel-title">
            Identity Investigation Timeline
          </h2>

          <p className="panel-description">
            Chronological security activity associated with{" "}
            <strong>{username}</strong>.
          </p>
        </div>

        <div className="timeline-event-count">
          <span>Recorded Events</span>
          <strong>{userEvents.length}</strong>
        </div>
      </div>

      <div className="identity-timeline">
        {userEvents.map((event, index) => {
          const reasons = Array.isArray(event.reasons)
            ? event.reasons
            : [];

          return (
            <article
              className="timeline-entry"
              key={event.id}
            >
              <div className="timeline-rail">
                <span className={eventClass(event)}>
                  {index + 1}
                </span>

                {index < userEvents.length - 1 && (
                  <span className="timeline-line" />
                )}
              </div>

              <div className="timeline-entry-content">
                <div className="timeline-entry-header">
                  <div>
                    <span className="timeline-time">
                      {new Date(
                        event.created_at
                      ).toLocaleString()}
                    </span>

                    <h3>
                      {formatEventName(event.event)}
                    </h3>
                  </div>

                  <span
                    className={decisionClass(
                      event.decision
                    )}
                  >
                    {event.decision}
                  </span>
                </div>

                <div className="timeline-scores">
                  <div>
                    <span>Risk Score</span>
                    <strong className="timeline-risk-score">
                      {event.risk_score}
                    </strong>
                  </div>

                  <div>
                    <span>Trust Score</span>
                    <strong className="timeline-trust-score">
                      {event.trust_score}
                    </strong>
                  </div>
                </div>

                {reasons.length > 0 && (
                  <div className="timeline-reasons">
                    <span className="timeline-reasons-label">
                      Detected Indicators
                    </span>

                    <div className="timeline-reason-list">
                      {reasons.map((reason, reasonIndex) => (
                        <span
                          className="timeline-reason"
                          key={`${reason}-${reasonIndex}`}
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="timeline-summary">
        <div>
          <span>Initial Trust</span>
          <strong>
            {userEvents[0].trust_score}
          </strong>
        </div>

        <span className="timeline-summary-arrow">
          →
        </span>

        <div>
          <span>Current Trust</span>
          <strong>
            {
              userEvents[userEvents.length - 1]
                .trust_score
            }
          </strong>
        </div>

        <div className="timeline-summary-decision">
          <span>Latest Decision</span>

          <strong>
            {
              userEvents[userEvents.length - 1]
                .decision
            }
          </strong>
        </div>
      </div>
    </section>
  );
}