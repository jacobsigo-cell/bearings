import type { ObservationRevision } from '../schema';

export function SourceDrawer({ observation }: { observation: ObservationRevision }) {
  return <section className="drawer" aria-labelledby="drawer-title">
    <h2 id="drawer-title">Finding basis</h2>
    <p>{observation.findingBasis}</p>
    <div className="evidence-list">
      {observation.evidence.map((e) => <article className="evidence" key={e.evidenceId}>
        <blockquote>“{e.claim}”</blockquote>
        <strong>{e.sourceName}</strong>
        <div className="audit-line">{e.tier.replace('_',' ')} · {e.scope} · {e.verifiedDate}</div>
        {e.sourceUrl ? <a href={e.sourceUrl}>View official source</a> : <span className="muted">Source link unavailable</span>}
      </article>)}
    </div>
    <div className="audit-footer">OBSERVATION ID: {observation.observationId} · REVISION: {observation.revisionNumber}</div>
  </section>;
}
