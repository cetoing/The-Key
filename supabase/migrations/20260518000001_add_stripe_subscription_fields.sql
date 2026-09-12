/*
  # Add Stripe subscription fields to profiles

  Adds plan tier, Stripe customer/subscription IDs, and subscription status
  to support monthly/yearly subscriptions. The 'enterprise' plan value is
  reserved for future B2B/university licensing without requiring a schema change.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'pro', 'enterprise')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'
    CONSTRAINT profiles_subscription_status_check CHECK (
      subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'inactive')
    );
