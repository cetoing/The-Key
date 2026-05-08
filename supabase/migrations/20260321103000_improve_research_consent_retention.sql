/*
  # Improve Research Consent Retention

  ## Summary
  Updates the `research_consent` table so a consent audit trail can survive
  server-side auth user deletion. This is important for dissertation ethics:
  consent withdrawal must be recorded rather than erased, while the account
  itself can still be deleted.

  ## Changes
  - Drops the `auth.users` foreign key on `user_id`
  - Makes `user_id` nullable so consent rows can be de-identified after deletion
  - Adds `withdrawn_at` to record when consent was withdrawn
  - Adds `withdrawal_method` to distinguish manual withdrawal from account deletion
  - Adds `account_deleted_at` to record when the account itself was removed
*/

ALTER TABLE research_consent
  DROP CONSTRAINT IF EXISTS research_consent_user_id_fkey;

ALTER TABLE research_consent
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE research_consent
  ADD COLUMN IF NOT EXISTS withdrawn_at timestamptz,
  ADD COLUMN IF NOT EXISTS withdrawal_method text,
  ADD COLUMN IF NOT EXISTS account_deleted_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'research_consent_withdrawal_method_check'
  ) THEN
    ALTER TABLE research_consent
      ADD CONSTRAINT research_consent_withdrawal_method_check
      CHECK (
        withdrawal_method IS NULL
        OR withdrawal_method IN ('toggle', 'account_deletion', 'admin')
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS research_consent_account_deleted_at_idx
  ON research_consent(account_deleted_at);
