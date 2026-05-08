export type FontSize = 'small' | 'medium' | 'large';
export type Theme = 'light' | 'dark' | 'high-contrast';
export type ColorPalette = 'warm' | 'cool';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  course: string;
  university: string;
  skills: string[];
  bio: string;
  font_size: FontSize;
  high_contrast: boolean;
  reduced_motion: boolean;
  theme: Theme;
  color_palette: ColorPalette;
  created_at: string;
  updated_at: string;
}

export type CVItemType = 'work' | 'education' | 'achievement' | 'skill';

export interface CVItem {
  id: string;
  user_id: string;
  type: CVItemType;
  title: string;
  organisation: string;
  start_date: string;
  end_date: string;
  description: string;
  is_current: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface GeneratedCV {
  id: string;
  user_id: string;
  content: string;
  status: 'draft' | 'accepted';
  prompt_used: string;
  model_used: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  internship_id: string;
  internship_title: string;
  company: string;
  match_percentage: number;
  created_at: string;
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  skills_required: string[];
  description: string;
  duration: string;
  salary?: string;
}

export interface InternshipWithMatch extends Internship {
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  bonus_points: string[];
}

export type ApplicationStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface Application {
  id: string;
  user_id: string;
  internship_id: string;
  internship_title: string;
  company: string;
  status: ApplicationStatus;
  notes: string;
  reminder_date: string | null;
  match_percentage: number;
  created_at: string;
  updated_at: string;
}

export type QuestionType = 'behavioural' | 'technical' | 'situational' | 'motivational';

export interface InterviewSession {
  id: string;
  user_id: string;
  role_title: string;
  company: string;
  internship_id: string;
  status: 'in_progress' | 'completed';
  total_questions: number;
  average_score: number;
  created_at: string;
  updated_at: string;
}

export interface InterviewQAPair {
  id: string;
  session_id: string;
  user_id: string;
  question: string;
  question_type: QuestionType;
  user_answer: string;
  ai_feedback: string;
  ai_score: number;
  strengths: string[];
  improvements: string[];
  order_index: number;
  created_at: string;
}

// Neurodiverse support presets.
// Each preset adjusts how the interface presents information:
// - low_cognitive_load: fewer choices per screen, reduced visual noise
// - step_by_step: one task at a time with progress indicators
// - minimal_text: concise labels, icons-first approach
export type NeurodiversePreset = 'none' | 'low_cognitive_load' | 'step_by_step' | 'minimal_text';

export interface AccessibilitySettings {
  font_size: FontSize;
  high_contrast: boolean;
  reduced_motion: boolean;
  theme: Theme;
  color_palette: ColorPalette;
  // Neurodiverse mode: governs cognitive load adaptations across the platform
  neurodiverse_preset: NeurodiversePreset;
  // Show contextual "Next best action" guidance prompts on key pages
  show_guidance_prompts: boolean;
  // Expand progressive disclosure steps one at a time
  step_by_step_mode: boolean;
}
