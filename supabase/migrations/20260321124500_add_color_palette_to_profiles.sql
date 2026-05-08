/*
  # Add Colour Palette Preference To Profiles

  ## Summary
  Persists a user's preferred palette family so they can switch between the
  dissertation's warm default styling and the earlier cool blue styling across
  devices.

  ## Changes
  - Adds `color_palette` to `profiles`
  - Defaults existing and new rows to `warm`
  - Restricts the value to `warm` or `cool`
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS color_palette text NOT NULL DEFAULT 'warm';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_color_palette_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_color_palette_check
      CHECK (color_palette IN ('warm', 'cool'));
  END IF;
END $$;
