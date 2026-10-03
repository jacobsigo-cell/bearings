import { describe, expect, it } from 'vitest';
import { GoldRecordSetSchema, PropertySchema } from '../schema';
import { goldRecordsPayload } from '../data/goldRecords';

const clone = (value: unknown): any => JSON.parse(JSON.stringify(value));

describe('LB-HOTEL-001 gold records', () => {
  it('validates all five launch gold records', () => {
    const result = GoldRecordSetSchema.safeParse(goldRecordsPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(5);
      expect(result.data.map(x => x.triageQueue)).toEqual(['A','A','B','C','D']);
    }
  });

  it('accepts PENDING_VERIFICATION with zero evidence records', () => {
    const pending = goldRecordsPayload.find(x => x.entityId.includes('SURF-SAND'))!;
    const result = PropertySchema.safeParse(pending.property);
    expect(result.success).toBe(true);
  });

  it('rejects false certainty: NO_ACCOMMODATION_VERIFIED without Tier 1/2 evidence', () => {
    const bad = clone(goldRecordsPayload[0].property);
    bad.observation.evidence = [{
      evidenceId: 'EV-BAD-01',
      tier: 'TIER_4',
      sourceName: 'Third-party listing',
      claim: 'No smoking area listed.',
      scope: 'Listing page',
      verifiedDate: '2026-10-03',
    } as any];
    const result = PropertySchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some(i => i.message.includes('NO_ACCOMMODATION_VERIFIED'))).toBe(true);
  });

  it('rejects false certainty: VERIFIED_ACCOMMODATION without Tier 1/2 evidence', () => {
    const bad = clone(goldRecordsPayload[1].property);
    bad.observation.evidence = [{
      evidenceId: 'EV-BAD-02',
      tier: 'TIER_4',
      sourceName: 'OTA listing',
      claim: 'Smoking area available.',
      scope: 'Listing page',
      verifiedDate: '2026-10-03',
    } as any];
    const result = PropertySchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some(i => i.message.includes('VERIFIED_ACCOMMODATION'))).toBe(true);
  });

  it('rejects CLOSED_REDEVELOPMENT with an assessed traveler implication', () => {
    const bad = clone(goldRecordsPayload[4].property);
    bad.observation.travelerImplication = 'HIGH' as any;
    const result = PropertySchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some(i => i.path.includes('travelerImplication'))).toBe(true);
  });

  it('rejects CONFLICTING_EVIDENCE with fewer than two evidence records', () => {
    const bad = clone(goldRecordsPayload[2].property);
    bad.observation.evidence = bad.observation.evidence.slice(0, 1);
    const result = PropertySchema.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some(i => i.message.includes('CONFLICTING_EVIDENCE'))).toBe(true);
  });

  it('rejects a property assigned to the wrong research set', () => {
    const bad = clone(goldRecordsPayload[0].property);
    bad.researchSetId = 'OTHER-SET' as any;
    expect(PropertySchema.safeParse(bad).success).toBe(false);
  });
});
