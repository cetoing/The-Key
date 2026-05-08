/*
  # Create CV Items Table

  ## Summary
  Restores the `cv_items` table used by the manual CV builder and AI CV
  generation flows.
*/

CREATE TABLE IF NOT EXISTS cv_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'work',
  title text NOT NULL DEFAULT '',
  organisation text NOT NULL DEFAULT '',
  start_date text NOT NULL DEFAULT '',
  end_date text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  is_current boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cv_items_type_check CHECK (type IN ('work', 'education', 'achievement', 'skill'))
);

CREATE INDEX IF NOT EXISTS cv_items_user_id_idx ON cv_items(user_id);

ALTER TABLE cv_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cv_items'
      AND policyname = 'Users can view own cv_items'
  ) THEN
    CREATE POLICY "Users can view own cv_items"
      ON cv_items
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
      AND tablename = 'cv_items'
      AND policyname = 'Users can insert own cv_items'
  ) THEN
    CREATE POLICY "Users can insert own cv_items"
      ON cv_items
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
      AND tablename = 'cv_items'
      AND policyname = 'Users can update own cv_items'
  ) THEN
    CREATE POLICY "Users can update own cv_items"
      ON cv_items
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
      AND tablename = 'cv_items'
      AND policyname = 'Users can delete own cv_items'
  ) THEN
    CREATE POLICY "Users can delete own cv_items"
      ON cv_items
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
