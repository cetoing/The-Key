import type { SupabaseClient } from '@supabase/supabase-js';

type Plan = 'free' | 'pro' | 'enterprise';
type EventType = 'cv_generation' | 'interview_feedback';

const DAILY_LIMITS: Record<EventType, Record<Plan, number>> = {
  cv_generation: { free: 2, pro: 10, enterprise: 100 },
  interview_feedback: { free: 5, pro: 20, enterprise: 200 },
};

// Input cost per million tokens in USD, output cost per million tokens in USD
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
};

const USD_TO_GBP = 0.79;

export interface RateLimitResult {
  allowed: boolean;
  used: number;
  limit: number;
  plan: Plan;
  upgradeUrl: string | null;
}

export async function checkAiRateLimit(
  adminClient: SupabaseClient,
  userId: string,
  eventType: EventType,
  plan: Plan,
): Promise<RateLimitResult> {
  const limit = DAILY_LIMITS[eventType][plan];

  const { count, error } = await adminClient
    .from('usage_metrics')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', eventType)
    .eq('event_date', new Date().toISOString().slice(0, 10));

  const used = error ? 0 : (count ?? 0);
  const allowed = used < limit;

  return {
    allowed,
    used,
    limit,
    plan,
    upgradeUrl: !allowed && plan === 'free' ? '/pricing' : null,
  };
}

export async function logAiUsage(
  adminClient: SupabaseClient,
  userId: string,
  eventType: EventType,
  metadata: {
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  },
): Promise<void> {
  try {
    const costs = MODEL_COSTS[metadata.model] ?? { input: 0, output: 0 };
    const estimated_cost_gbp =
      ((metadata.prompt_tokens / 1_000_000) * costs.input +
        (metadata.completion_tokens / 1_000_000) * costs.output) *
      USD_TO_GBP;

    await adminClient.from('usage_metrics').insert({
      user_id: userId,
      event_type: eventType,
      event_date: new Date().toISOString().slice(0, 10),
      metadata: {
        model: metadata.model,
        prompt_tokens: metadata.prompt_tokens,
        completion_tokens: metadata.completion_tokens,
        total_tokens: metadata.total_tokens,
        estimated_cost_gbp: parseFloat(estimated_cost_gbp.toFixed(6)),
      },
    });
  } catch {
    // Logging failure must never block the response
  }
}
