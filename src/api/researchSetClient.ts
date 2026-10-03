import { GoldRecordSetSchema, type ResearchSetMember } from '../schema';

export type ResearchSetSuccess = {
  ok: true;
  data: ResearchSetMember[];
};

export type ResearchSetTransportFailure = {
  ok: false;
  kind: 'transport_failure';
  message: string;
};

export type ResearchSetInvalidPayload = {
  ok: false;
  kind: 'invalid_payload';
  message: string;
  issues: Array<{ path: string; message: string }>;
};

export type ResearchSetResult =
  | ResearchSetSuccess
  | ResearchSetTransportFailure
  | ResearchSetInvalidPayload;

export type ResearchSetRequest = () => Promise<unknown>;

export function parseResearchSetPayload(payload: unknown): ResearchSetResult {
  const parsed = GoldRecordSetSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      kind: 'invalid_payload',
      message: 'The research-set payload failed runtime validation.',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  return { ok: true, data: parsed.data };
}

export async function loadResearchSet(request: ResearchSetRequest): Promise<ResearchSetResult> {
  let payload: unknown;

  try {
    payload = await request();
  } catch (error) {
    return {
      ok: false,
      kind: 'transport_failure',
      message: error instanceof Error ? error.message : 'The research-set request failed.',
    };
  }

  return parseResearchSetPayload(payload);
}

export function findRequiredMember(
  result: ResearchSetSuccess,
  entityId: string,
): ResearchSetMember | null {
  return result.data.find((member) => member.entityId === entityId) ?? null;
}
