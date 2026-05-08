
/*
  # Add missing columns to generated_cvs table

  1. Changes
    - Adds `status` column (text, default 'draft') to track whether a CV is a draft or accepted
    - Adds `prompt_used` column (text, nullable) to store the prompt sent to the AI
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generated_cvs' AND column_name = 'status'
  ) THEN
    ALTER TABLE generated_cvs ADD COLUMN status text NOT NULL DEFAULT 'draft';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generated_cvs' AND column_name = 'prompt_used'
  ) THEN
    ALTER TABLE generated_cvs ADD COLUMN prompt_used text;
  END IF;
END $$;
