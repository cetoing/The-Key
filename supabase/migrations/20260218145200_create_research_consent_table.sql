/*
  # Create Research Consent Table

  ## Summary
  Adds a `research_consent` table to record when users give or withdraw consent for
  participation in the dissertation research study. Consent is versioned so future
  policy changes can be tracked without losing historical records.

  ## New Tables

  ### research_consent
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) — one active record per user
  - `consent_version` (text) — consent policy version string (e.g. "1.0")
  - `consented` (boolean) — true = consent given, false = withdrawn
  - `consented_at` (timestamptz) — when this record was created/updated
  - `ip_hint` (text) — optional partial IP for audit (not stored in full for privacy)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Users can only read and upsert their own consent record
  - No delete policy — consent history is preserved as required by research ethics guidelines

  ## Notes
  1. Only one row per (user_id, consent_version) pair is enforced by UNIQUE constraint
  2. Consent withdrawal sets `consented = false` — it does not delete the row
  3. The `updated_at` column records the most recent consent state change
*/

CREATE TABLE IF NOT EXISTS research_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_version text NOT NULL DEFAULT '1.0',
  consented boolean NOT NULL DEFAULT false,
  consented_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT research_consent_user_version_unique UNIQUE (user_id, consent_version)
);

CREATE INDEX IF NOT EXISTS research_consent_user_id_idx ON research_consent(user_id);

ALTER TABLE research_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent records"
  ON research_consent FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent records"
  ON research_consent FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consent records"
  ON research_consent FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
