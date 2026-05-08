/*
  # Create Applications Table

  ## Summary
  Adds an `applications` table for tracking internship application progress through a Kanban workflow.

  ## New Tables
  - `applications`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `internship_id` (text) — references internship slug from JSON dataset
    - `internship_title` (text)
    - `company` (text)
    - `status` (text) — one of: Saved, Applied, Interview, Offer, Rejected
    - `notes` (text) — user notes about the application
    - `reminder_date` (date) — optional reminder date
    - `match_percentage` (integer) — stored match score at time of adding
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Users can only read, insert, update, and delete their own rows
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  internship_id text NOT NULL,
  internship_title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Saved',
  notes text NOT NULL DEFAULT '',
  reminder_date date,
  match_percentage integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications(user_id);
CREATE INDEX IF NOT EXISTS applications_reminder_date_idx ON applications(reminder_date);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON applications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
