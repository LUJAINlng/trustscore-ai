export default function AIExplanation({ latest }) {
  if (!latest?.reasons?.length) {
    return (
      <article className="analysis-card">
        <h3>Decision Explanation</h3>

        <p className="panel-description">
          No decision factors are available.
        </p>
      </article>
    );
  }

  return (
    <article className="analysis-card">
      <h3>Decision Explanation</h3>

      <ul>
        {latest.reasons.map((reason, index) => (
          <li key={index}>
            {reason}
          </li>
        ))}
      </ul>
    </article>
  );
}