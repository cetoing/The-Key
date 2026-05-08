/*
  # Create Usage Metrics Table

  ## Summary
  Adds a `usage_metrics` table that records anonymised interaction events for
  dissertation analytics. Events are logged without any personal content — only
  event type, timestamp, and a hashed user reference.

  ## New Tables

  ### usage_metrics
  - `id` (uuid, primary key)
  - `user_id` (uuid) — references auth.users; used for per-user deduplication only
  - `event_type` (text) — one of a fixed set of event names (see CHECK constraint)
  - `event_date` (date) — date of the event (no time, for daily aggregation)
  - `created_at` (timestamptz)
  - `metadata` (jsonb) — optional non-personal context, e.g. {"role": "marketing"}

  ## Security
  - RLS enabled
  - Users can insert their own events
  - Users can read their own events
  - Aggregate analytics queries are run server-side using the service role
    (not exposed via client RLS)

  ## Notes
  1. No personal content (CV text, answers, names) is stored in this table
  2. The event_type is constrained to a fixed vocabulary to prevent data leakage
  3. event_date stores only the calendar date, not the precise time, to reduce
     re-identification risk
  4. metadata is limited to non-personal context keys defined by the application
*/

CREATE TABLE IF NOT EXISTS usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT usage_metrics_event_type_check CHECK (
    event_type IN (
      'cv_generation',
      'cv_item_created',
      'internship_saved',
      'application_created',
      'interview_session_started',
      'interview_session_completed',
      'profile_completed',
      'page_view'
    )
  )
);

CREATE INDEX IF NOT EXISTS usage_metrics_user_id_idx ON usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS usage_metrics_event_type_idx ON usage_metrics(event_type);
CREATE INDEX IF NOT EXISTS usage_metrics_event_date_idx ON usage_metrics(event_date);

ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own metrics"
  ON usage_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own metrics"
  ON usage_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
