
/*
  # Add model_used column to generated_cvs table

  1. Changes
    - Adds `model_used` column to `generated_cvs` table (text, nullable)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generated_cvs' AND column_name = 'model_used'
  ) THEN
    ALTER TABLE generated_cvs ADD COLUMN model_used text;
  END IF;
END $$;
