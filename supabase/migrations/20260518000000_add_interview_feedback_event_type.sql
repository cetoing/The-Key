/*
  # Add interview_feedback event type to usage_metrics

  Extends the event_type CHECK constraint to include 'interview_feedback'
  so per-answer AI feedback calls can be tracked separately from session-level events.
*/

ALTER TABLE usage_metrics
  DROP CONSTRAINT usage_metrics_event_type_check;

ALTER TABLE usage_metrics
  ADD CONSTRAINT usage_metrics_event_type_check CHECK (
    event_type IN (
      'cv_generation',
      'cv_item_created',
      'internship_saved',
      'application_created',
      'interview_session_started',
      'interview_session_completed',
      'interview_feedback',
      'profile_completed',
      'page_view'
    )
  );
