/*
  # Create Wishlist Table

  ## Summary
  Restores the `wishlist` table used for saving internship opportunities.
*/

CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  internship_id text NOT NULL,
  internship_title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  match_percentage integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wishlist_user_internship_unique UNIQUE (user_id, internship_id)
);

CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON wishlist(user_id);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'wishlist'
      AND policyname = 'Users can view own wishlist'
  ) THEN
    CREATE POLICY "Users can view own wishlist"
      ON wishlist
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
      AND tablename = 'wishlist'
      AND policyname = 'Users can insert own wishlist'
  ) THEN
    CREATE POLICY "Users can insert own wishlist"
      ON wishlist
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
      AND tablename = 'wishlist'
      AND policyname = 'Users can delete own wishlist'
  ) THEN
    CREATE POLICY "Users can delete own wishlist"
      ON wishlist
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
