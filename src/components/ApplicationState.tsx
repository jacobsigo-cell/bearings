export function ApplicationState({
  title = 'We couldn’t load this information',
  detail = 'The response could not be validated. Bearings has not changed or inferred any intelligence state from this failure.',
}: { title?: string; detail?: string }) {
  return (
    <main className="page-shell">
      <header className="topbar"><strong>BEARINGS</strong></header>
      <div className="content">
        <section className="system-state" role="status" aria-live="polite">
          <div className="eyebrow">APPLICATION STATE</div>
          <h1>{title}</h1>
          <p>{detail}</p>
          <button type="button">Try again</button>
        </section>
      </div>
    </main>
  );
}
