import { describe, expect, it } from 'vitest';
import { findRequiredMember, loadResearchSet, parseResearchSetPayload } from '../api/researchSetClient';
import { goldRecordsPayload } from '../data/goldRecords';

const clone = (value: unknown): any => JSON.parse(JSON.stringify(value));

describe('research-set API boundary', () => {
  it('returns validated data for a valid payload', () => {
    const result = parseResearchSetPayload(goldRecordsPayload);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(5);
  });

  it('maps invalid payloads to invalid_payload instead of an intelligence state', () => {
    const bad = clone(goldRecordsPayload);
    bad[0].property.observation.finding = 'NO_ACCOMMODATION_VERIFIED';
    bad[0].property.observation.evidence = [];

    const result = parseResearchSetPayload(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe('invalid_payload');
      if (result.kind === 'invalid_payload') {
        expect(result.issues.some((issue) => issue.message.includes('NO_ACCOMMODATION_VERIFIED'))).toBe(true);
      }
    }
  });

  it('maps thrown requests to transport_failure', async () => {
    const result = await loadResearchSet(async () => {
      throw new Error('503 Service Unavailable');
    });

    expect(result).toEqual({
      ok: false,
      kind: 'transport_failure',
      message: '503 Service Unavailable',
    });
  });

  it('does not treat a transport failure as PENDING_VERIFICATION', async () => {
    const result = await loadResearchSet(async () => {
      throw new Error('network down');
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(JSON.stringify(result)).not.toContain('PENDING_VERIFICATION');
      expect(JSON.stringify(result)).not.toContain('STATUS_UNCERTAIN');
      expect(JSON.stringify(result)).not.toContain('NOT_ASSESSED');
    }
  });

  it('does not treat malformed JSON-equivalent data as a valid research set', () => {
    const result = parseResearchSetPayload({ data: goldRecordsPayload });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe('invalid_payload');
  });

  it('finds an explicitly required member only after validation', () => {
    const result = parseResearchSetPayload(goldRecordsPayload);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(findRequiredMember(result, 'LB-HOTEL-001-CRESCENT-BAY')?.property.name).toBe('Crescent Bay Inn');
    expect(findRequiredMember(result, 'LB-HOTEL-001-NOT-A-REAL-ID')).toBeNull();
  });
});
