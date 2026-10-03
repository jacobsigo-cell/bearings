import type { Property } from '../schema';
import { Currency, EntityState, FindingBadge, PlanningImpact } from './Intelligence';
import { SourceDrawer } from './SourceDrawer';

export function PropertyView({ property }: { property: Property }) {
  const o = property.observation;
  return <main className="page-shell">
    <header className="topbar"><strong>BEARINGS</strong><span>Trip context · Smoker</span></header>
    <div className="content">
      <aside className="context-card" aria-label="Demonstration data notice">
        <strong>Prototype · Demonstration data</strong>
        <p>This preview uses test records, including sample findings and source claims. Do not use it for trip planning.</p>
      </aside>
      <a className="back" href="#">← Laguna Beach</a>
      <section className="property-head">
        <div>
          <h1>{property.name}</h1>
          <p>{property.location} · {property.propertyType}</p>
        </div>
        <EntityState state={o.entityState} />
      </section>

      <section className="observation-card" aria-labelledby="obs-title">
        <div className="eyebrow">{o.question.toUpperCase()}</div>
        <FindingBadge finding={o.finding} />
        <p id="obs-title">We found qualifying evidence that this accommodation is not available within the defined scope.</p>
        <div className="meta-stack"><Currency observation={o}/><PlanningImpact value={o.travelerImplication}/></div>
        <button className="link-button" type="button">View sources & evidence</button>
      </section>

      <SourceDrawer observation={o} />

      <section className="context-card">
        <div className="eyebrow">WHAT THIS MEANS FOR YOUR STAY</div>
        <p>Because your trip context requires a smoking accommodation, this property does not currently provide a verified on-property option. You will need an alternative plan. See applicable destination rules before relying on an off-property location.</p>
        <a href="#">View destination smoking rules →</a>
      </section>

      <section className="commercial">
        <div className="eyebrow">COMMERCIAL</div>
        <button type="button">Check availability</button>
        <p>Bearings may earn a commission if you book through this link.</p>
      </section>
    </div>
  </main>;
}
