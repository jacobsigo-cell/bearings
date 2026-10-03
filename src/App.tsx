import { useEffect, useState } from 'react';
import { loadResearchSet, findRequiredMember, type ResearchSetResult } from './api/researchSetClient';
import { goldRecordsPayload } from './data/goldRecords';
import { PropertyView } from './components/PropertyView';
import { ApplicationState } from './components/ApplicationState';

const CRESCENT_BAY_ID = 'LB-HOTEL-001-CRESCENT-BAY';

// Vertical-slice transport. Replace only this function with the real API request.
// The rest of the application continues to receive runtime-validated data.
async function requestGoldResearchSet(): Promise<unknown> {
  return goldRecordsPayload;
}

export default function App() {
  const [result, setResult] = useState<ResearchSetResult | null>(null);

  useEffect(() => {
    let active = true;

    loadResearchSet(requestGoldResearchSet).then((next) => {
      if (active) setResult(next);
    });

    return () => {
      active = false;
    };
  }, []);

  if (result === null) {
    return (
      <ApplicationState
        title="Loading traveler intelligence"
        detail="Bearings is retrieving the published research set. No intelligence state is inferred while the request is in progress."
      />
    );
  }

  if (!result.ok) {
    if (result.kind === 'transport_failure') {
      return (
        <ApplicationState
          title="We couldn’t load this information"
          detail="The request failed before Bearings could retrieve the published intelligence. The underlying Finding, Currency, Entity State, and Planning impact remain unchanged."
        />
      );
    }

    return (
      <ApplicationState
        title="We couldn’t validate this information"
        detail="The API payload failed runtime validation. Bearings did not coerce the response into Pending verification, Status uncertain, Not assessed, or any other intelligence state."
      />
    );
  }

  const crescentBay = findRequiredMember(result, CRESCENT_BAY_ID);
  if (!crescentBay) {
    return (
      <ApplicationState
        title="Required property unavailable"
        detail="The validated research set does not contain the required Crescent Bay Inn member. Bearings has not inferred a substitute property or intelligence state."
      />
    );
  }

  return <PropertyView property={crescentBay.property} />;
}
