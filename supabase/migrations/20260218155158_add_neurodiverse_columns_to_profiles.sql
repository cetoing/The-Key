/*
  # Add neurodiverse support mode columns to profiles

  ## Summary
  Adds three new columns to the `profiles` table to persist neurodiverse
  support mode preferences across devices:

  1. `neurodiverse_preset` (text, default 'none')
     - Stores the active UI preset chosen by the user.
     - Allowed values: 'none', 'low_cognitive_load', 'step_by_step', 'minimal_text'
     - 'none' means no cognitive load adaptations are applied.

  2. `show_guidance_prompts` (boolean, default false)
     - When true, contextual "Suggested next step" banners are shown on
       the dashboard and internships pages.

  3. `step_by_step_mode` (boolean, default false)
     - When true, multi-step checklists reveal one item at a time.

  ## Security
  No changes to RLS policies needed — these columns fall under the existing
  per-user read/write policies on the profiles table.

  ## Notes
  - All columns are added with safe defaults so existing rows are unaffected.
  - Uses IF NOT EXISTS guards to make the migration idempotent.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'neurodiverse_preset'
  ) THEN
    ALTER TABLE profiles ADD COLUMN neurodiverse_preset text NOT NULL DEFAULT 'none';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'show_guidance_prompts'
  ) THEN
    ALTER TABLE profiles ADD COLUMN show_guidance_prompts boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'step_by_step_mode'
  ) THEN
    ALTER TABLE profiles ADD COLUMN step_by_step_mode boolean NOT NULL DEFAULT false;
  END IF;
END $$;
