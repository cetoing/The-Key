/*
  # Create Interview Practice Tables

  ## Summary
  Adds two tables to support AI-powered interview practice sessions:
  - `interview_sessions`: one record per practice session, stores role context and a summary score
  - `interview_qa_pairs`: individual question/answer/feedback rounds linked to a session

  ## New Tables

  ### interview_sessions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `role_title` (text) — the role the user is practising for
  - `company` (text) — optional company name
  - `internship_id` (text) — optional link back to a tracked internship
  - `status` (text) — 'in_progress' | 'completed'
  - `total_questions` (integer) — count of answered questions in this session
  - `average_score` (numeric) — rolling average of AI scores (1–10)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### interview_qa_pairs
  - `id` (uuid, primary key)
  - `session_id` (uuid, references interview_sessions)
  - `user_id` (uuid, references auth.users)
  - `question` (text) — the interview question shown to the user
  - `question_type` (text) — 'behavioural' | 'technical' | 'situational' | 'motivational'
  - `user_answer` (text) — the user's typed answer
  - `ai_feedback` (text) — AI-generated feedback text
  - `ai_score` (integer) — AI score 1–10
  - `strengths` (text[]) — array of strength points identified by AI
  - `improvements` (text[]) — array of improvement suggestions from AI
  - `order_index` (integer) — question order within the session
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Users can only access their own data
*/

CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  internship_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'in_progress',
  total_questions integer NOT NULL DEFAULT 0,
  average_score numeric(4,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS interview_sessions_user_id_idx ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS interview_sessions_status_idx ON interview_sessions(status);

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interview sessions"
  ON interview_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview sessions"
  ON interview_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview sessions"
  ON interview_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interview sessions"
  ON interview_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS interview_qa_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL DEFAULT '',
  question_type text NOT NULL DEFAULT 'behavioural',
  user_answer text NOT NULL DEFAULT '',
  ai_feedback text NOT NULL DEFAULT '',
  ai_score integer NOT NULL DEFAULT 0,
  strengths text[] NOT NULL DEFAULT '{}',
  improvements text[] NOT NULL DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS interview_qa_pairs_session_id_idx ON interview_qa_pairs(session_id);
CREATE INDEX IF NOT EXISTS interview_qa_pairs_user_id_idx ON interview_qa_pairs(user_id);

ALTER TABLE interview_qa_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own qa pairs"
  ON interview_qa_pairs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own qa pairs"
  ON interview_qa_pairs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own qa pairs"
  ON interview_qa_pairs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own qa pairs"
  ON interview_qa_pairs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
