/*
  # Create Generated CVs Table

  ## Summary
  Restores the `generated_cvs` table used by the AI CV generator.

  ## Notes
  This base table already includes the later `status`, `prompt_used`, and
  `model_used` columns so the app can run immediately on a restored project.
*/

CREATE TABLE IF NOT EXISTS generated_cvs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  prompt_used text NOT NULL DEFAULT '',
  model_used text NOT NULL DEFAULT 'gpt-4o-mini',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT generated_cvs_status_check CHECK (status IN ('draft', 'accepted'))
);

CREATE INDEX IF NOT EXISTS generated_cvs_user_id_idx ON generated_cvs(user_id);

ALTER TABLE generated_cvs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'generated_cvs'
      AND policyname = 'Users can view own generated_cvs'
  ) THEN
    CREATE POLICY "Users can view own generated_cvs"
      ON generated_cvs
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'generated_cvs'
      AND policyname = 'Users can insert own generated_cvs'
  ) THEN
    CREATE POLICY "Users can insert own generated_cvs"
      ON generated_cvs
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'generated_cvs'
      AND policyname = 'Users can update own generated_cvs'
  ) THEN
    CREATE POLICY "Users can update own generated_cvs"
      ON generated_cvs
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'generated_cvs'
      AND policyname = 'Users can delete own generated_cvs'
  ) THEN
    CREATE POLICY "Users can delete own generated_cvs"
      ON generated_cvs
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
