/*
  # Add missing columns to profiles table

  1. Changes
    - Add `user_id` column (uuid, references auth.users) if not exists
    - Add `skills` column (text array) if not exists

  2. Notes
    - user_id is needed to link profiles to authenticated users
    - skills stores an array of skill tags entered on the profile page
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'skills'
  ) THEN
    ALTER TABLE profiles ADD COLUMN skills text[] DEFAULT '{}';
  END IF;
END $$;
