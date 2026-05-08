/*
  # Fix handle_new_user trigger to use auth user ID

  ## Problem
  The `profiles` table has a foreign key `profiles_id_fkey` requiring `profiles.id`
  to reference `auth.users.id`. The trigger was inserting a random UUID instead,
  violating the FK constraint and causing "Database error saving new user".

  The RLS INSERT policy also checks `auth.uid() = id`, so `id` must equal the
  authenticated user's UUID.

  ## Fix
  Update `handle_new_user` to set `id = NEW.id` (the auth user's ID).
  Update the column default to also use the auth UID where possible.
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
