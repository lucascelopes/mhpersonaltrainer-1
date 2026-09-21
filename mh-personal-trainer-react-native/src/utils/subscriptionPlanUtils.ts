type SubscriptionPlanLike = {
  id?: string;
  name?: string;
  priceId?: string;
};

const TERMINAL_SUBSCRIPTION_STATUSES = new Set([
  'canceled',
  'cancelled',
  'deleted',
  'ended',
  'expired',
  'inactive',
  'incomplete_expired',
  'not_found',
  'unpaid',
]);

function normalizeCandidate(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return normalizeCandidate(
      record.id ||
        record.priceId ||
        record.price_id ||
        record.nickname ||
        record.name ||
        record.planName ||
        record.planId
    );
  }
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s]+/g, '-');
}

function getPlanKeys(plan: SubscriptionPlanLike): Set<string> {
  return new Set(
    [plan.id, plan.priceId, plan.name]
      .map(normalizeCandidate)
      .filter(Boolean)
  );
}

export function isTerminalSubscriptionStatus(status?: unknown): boolean {
  const normalized = normalizeCandidate(status).replace(/-/g, '_');
  return TERMINAL_SUBSCRIPTION_STATUSES.has(normalized);
}

export function resolveSubscribedPlan<T extends SubscriptionPlanLike>(
  plans: T[],
  candidates: unknown[]
): T | null {
  const normalizedCandidates = candidates
    .map(normalizeCandidate)
    .filter(Boolean);

  if (!normalizedCandidates.length) return null;

  for (const plan of plans) {
    const planKeys = getPlanKeys(plan);
    if (normalizedCandidates.some((candidate) => planKeys.has(candidate))) {
      return plan;
    }
  }

  for (const plan of plans) {
    const planKeys = getPlanKeys(plan);
    if (
      normalizedCandidates.some((candidate) =>
        Array.from(planKeys).some(
          (key) => key && (candidate.includes(key) || key.includes(candidate))
        )
      )
    ) {
      return plan;
    }
  }

  return null;
}

export function resolveReadablePlanLabel<T extends SubscriptionPlanLike>(
  plans: T[],
  candidates: unknown[],
  fallback = 'Premium'
): string {
  const plan = resolveSubscribedPlan(plans, candidates);
  if (plan?.name) return plan.name;

  const readableCandidate = candidates.find((candidate) => {
    const normalized = normalizeCandidate(candidate);
    return normalized && !normalized.startsWith('price-');
  });

  if (!readableCandidate) return fallback;
  if (typeof readableCandidate === 'object') return fallback;

  return String(readableCandidate).trim() || fallback;
}
