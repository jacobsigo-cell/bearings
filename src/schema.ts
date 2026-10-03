import { z } from 'zod';

export const Finding = z.enum([
  'VERIFIED_ACCOMMODATION',
  'NO_ACCOMMODATION_VERIFIED',
  'PENDING_VERIFICATION',
  'CONFLICTING_EVIDENCE',
]);

export const EntityState = z.enum([
  'OPERATING',
  'STATUS_UNCERTAIN',
  'CLOSED_REDEVELOPMENT',
]);

export const CurrencyState = z.enum([
  'CURRENT',
  'REVIEW_DUE',
  'REVIEW_OVERDUE',
]);

export const TravelerImplication = z.enum([
  'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'NOT_ASSESSED', 'NOT_APPLICABLE',
]);

export const EvidenceTier = z.enum(['TIER_1','TIER_2','TIER_3','TIER_4','TIER_5']);

export const EvidenceRecordSchema = z.object({
  evidenceId: z.string().min(1),
  tier: EvidenceTier,
  sourceName: z.string().min(1),
  claim: z.string().min(1),
  scope: z.string().min(1),
  verifiedDate: z.string().date(),
  sourceUrl: z.string().url().optional(),
});

export const ObservationRevisionSchema = z.object({
  observationId: z.string().min(1),
  revisionNumber: z.number().int().positive(),
  question: z.string().min(1),
  finding: Finding,
  entityState: EntityState,
  currencyState: CurrencyState,
  travelerImplication: TravelerImplication,
  publishedDate: z.string().date(),
  findingBasis: z.string().min(1),
  evidence: z.array(EvidenceRecordSchema),
}).superRefine((value, ctx) => {
  if (value.entityState === 'CLOSED_REDEVELOPMENT' && value.travelerImplication !== 'NOT_APPLICABLE') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['travelerImplication'],
      message: 'CLOSED_REDEVELOPMENT requires NOT_APPLICABLE traveler implication.',
    });
  }

  if (value.finding === 'NO_ACCOMMODATION_VERIFIED') {
    const hasQualifying = value.evidence.some(e => e.tier === 'TIER_1' || e.tier === 'TIER_2');
    if (!hasQualifying) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['evidence'],
        message: 'NO_ACCOMMODATION_VERIFIED requires qualifying Tier 1 or Tier 2 evidence.',
      });
    }
  }

  if (value.finding === 'VERIFIED_ACCOMMODATION') {
    const hasQualifying = value.evidence.some(e => e.tier === 'TIER_1' || e.tier === 'TIER_2');
    if (!hasQualifying) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['evidence'],
        message: 'VERIFIED_ACCOMMODATION requires qualifying Tier 1 or Tier 2 evidence.',
      });
    }
  }

  if (value.finding === 'CONFLICTING_EVIDENCE' && value.evidence.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['evidence'],
      message: 'CONFLICTING_EVIDENCE requires at least two evidence records.',
    });
  }

  if (value.finding === 'PENDING_VERIFICATION') {
    // Zero EvidenceRecords is explicitly valid. Pending may also retain non-qualifying
    // records or research inputs without manufacturing a yes/no Finding.
    return;
  }
});

export const PropertySchema = z.object({
  entityId: z.string().min(1),
  researchSetId: z.literal('LB-HOTEL-001'),
  name: z.string().min(1),
  location: z.string().min(1),
  propertyType: z.string().min(1),
  observation: ObservationRevisionSchema,
});

export const ResearchSetMemberSchema = z.object({
  entityId: z.string().min(1),
  researchSetId: z.literal('LB-HOTEL-001'),
  triageQueue: z.enum(['A','B','C','D']),
  outreachStatus: z.enum(['NOT_NEEDED','NOT_STARTED','SENT','RESPONDED','CLOSED']),
  property: PropertySchema,
});

export const GoldRecordSetSchema = z.array(ResearchSetMemberSchema).length(5).superRefine((members, ctx) => {
  const ids = new Set(members.map(m => m.entityId));
  if (ids.size !== members.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Gold-record entity IDs must be unique.' });
  }
});

export type Property = z.infer<typeof PropertySchema>;
export type ObservationRevision = z.infer<typeof ObservationRevisionSchema>;
export type ResearchSetMember = z.infer<typeof ResearchSetMemberSchema>;
