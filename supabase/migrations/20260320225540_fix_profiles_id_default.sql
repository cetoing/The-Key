/*
  # Fix profiles table id column

  ## Problem
  The `id` column on the `profiles` table has no default value, but the
  `handle_new_user` trigger only inserts `user_id` and `full_name`, leaving
  `id` unset and causing "Database error saving new user" on registration.

  ## Changes
  - Add `gen_random_uuid()` as the default for `profiles.id`
  - Update `handle_new_user` function to explicitly set `id` on insert
*/

ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
