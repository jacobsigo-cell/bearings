import type { ObservationRevision } from '../schema';

const findingLabels: Record<ObservationRevision['finding'], string> = {
  VERIFIED_ACCOMMODATION: 'Verified accommodation',
  NO_ACCOMMODATION_VERIFIED: 'No accommodation verified',
  PENDING_VERIFICATION: 'Pending verification',
  CONFLICTING_EVIDENCE: 'Conflicting evidence',
};

const implicationLabels: Record<ObservationRevision['travelerImplication'], string> = {
  LOW: 'Low', MODERATE: 'Moderate', HIGH: 'High', VERY_HIGH: 'Very high',
  NOT_ASSESSED: 'Not assessed', NOT_APPLICABLE: 'Not applicable',
};

export function FindingBadge({ finding }: Pick<ObservationRevision,'finding'>) {
  return <div className={`finding finding--${finding.toLowerCase()}`}>{findingLabels[finding]}</div>;
}

export function Currency({ observation }: { observation: ObservationRevision }) {
  const label = observation.currencyState === 'CURRENT'
    ? `Verified ${observation.publishedDate}`
    : observation.currencyState === 'REVIEW_DUE' ? 'Review due' : 'Review overdue';
  return <div className={`meta currency currency--${observation.currencyState.toLowerCase()}`}>{label}</div>;
}

export function EntityState({ state }: { state: ObservationRevision['entityState'] }) {
  const label = state === 'OPERATING' ? 'Operating' : state === 'STATUS_UNCERTAIN' ? 'Status uncertain' : 'Closed / Redevelopment';
  return <div className={`meta entity entity--${state.toLowerCase()}`}>{label}</div>;
}

export function PlanningImpact({ value }: { value: ObservationRevision['travelerImplication'] }) {
  return <div className="meta implication">Planning impact · {implicationLabels[value]}</div>;
}
