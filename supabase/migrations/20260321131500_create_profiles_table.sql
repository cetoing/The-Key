/*
  # Create Profiles Table

  ## Summary
  Restores the core `profiles` table used across onboarding, CV generation,
  internship matching, accessibility preferences, and analytics summaries.

  ## Why this is needed
  The restored Supabase project is missing `profiles`, while the application
  and later migrations already assume it exists.

  ## Includes
  - Core profile columns
  - Accessibility preference columns
  - Colour palette preference
  - Row Level Security
  - Policies so each authenticated user can manage only their own profile
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  course text NOT NULL DEFAULT '',
  university text NOT NULL DEFAULT '',
  skills text[] NOT NULL DEFAULT '{}',
  bio text NOT NULL DEFAULT '',
  font_size text NOT NULL DEFAULT 'medium',
  high_contrast boolean NOT NULL DEFAULT false,
  reduced_motion boolean NOT NULL DEFAULT false,
  theme text NOT NULL DEFAULT 'light',
  color_palette text NOT NULL DEFAULT 'warm',
  neurodiverse_preset text NOT NULL DEFAULT 'none',
  show_guidance_prompts boolean NOT NULL DEFAULT false,
  step_by_step_mode boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_font_size_check CHECK (font_size IN ('small', 'medium', 'large')),
  CONSTRAINT profiles_theme_check CHECK (theme IN ('light', 'dark', 'high-contrast')),
  CONSTRAINT profiles_color_palette_check CHECK (color_palette IN ('warm', 'cool')),
  CONSTRAINT profiles_neurodiverse_preset_check CHECK (
    neurodiverse_preset IN ('none', 'low_cognitive_load', 'step_by_step', 'minimal_text')
  )
);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id OR auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id OR auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id OR auth.uid() = user_id)
      WITH CHECK (auth.uid() = id OR auth.uid() = user_id);
  END IF;
END $$;
