import type { ExplainabilityData, ConfidenceLevel } from '@/components/ai/AIExplainabilityPanel';
import type { Profile, CVItem } from './types';

function cvGenerationConfidence(profile: Profile | null, cvItems: CVItem[]): { level: ConfidenceLevel; reason: string } {
  const hasName = !!profile?.full_name;
  const hasCourse = !!profile?.course;
  const hasUniversity = !!profile?.university;
  const hasSkills = (profile?.skills?.length ?? 0) > 0;
  const hasBio = !!profile?.bio;
  const hasItems = cvItems.length > 0;

  const score = [hasName, hasCourse, hasUniversity, hasSkills, hasBio, hasItems].filter(Boolean).length;

  if (score >= 5) {
    return {
      level: 'high',
      reason: 'All key profile fields and CV entries are present. The model has sufficient context to produce a well-structured, personalised CV draft.',
    };
  }
  if (score >= 3) {
    return {
      level: 'medium',
      reason: 'Some profile fields or CV entries are missing. The output will be generated but may contain generic sections where specific information is absent.',
    };
  }
  return {
    level: 'low',
    reason: 'Very little profile data is available. The AI will produce a basic template with many placeholder sections. Complete your profile for better results.',
  };
}

export function buildCVExplainability(profile: Profile | null, cvItems: CVItem[]): ExplainabilityData {
  const { level, reason } = cvGenerationConfidence(profile, cvItems);
  return {
    featureName: 'AI CV Generator',
    model: 'OpenAI GPT-4o Mini',
    inputs: [
      { label: 'Full name', value: profile?.full_name || '', present: !!profile?.full_name },
      { label: 'Course / degree', value: profile?.course || '', present: !!profile?.course },
      { label: 'University', value: profile?.university || '', present: !!profile?.university },
      { label: 'Skills', value: `${profile?.skills?.length ?? 0} added`, present: (profile?.skills?.length ?? 0) > 0 },
      { label: 'Bio / personal statement', value: '', present: !!profile?.bio },
      { label: 'CV entries', value: `${cvItems.length} entries`, present: cvItems.length > 0 },
      { label: 'Career interests', value: '', present: false },
    ],
    optimisedFor: [
      'Professional UK CV format with clear section headings',
      'Matching language from your stated skills and experience',
      'Concise, action-verb led bullet points',
      'Appropriate tone for entry-level / internship applications',
    ],
    limitations: [
      'The model cannot verify if your CV entries are accurate - always review before submitting',
      'Generated content reflects training data patterns, which may favour certain writing styles',
      'Does not tailor the CV to a specific job description unless prompted',
      'May repeat information if profile and CV entries overlap significantly',
    ],
    biasRisks: [
      'Large language models may exhibit stylistic biases towards certain cultural or institutional norms',
      'Skills and experience phrasing may be influenced by over-represented industries in training data (e.g. tech)',
      'The model has no awareness of disability, neurodiversity, or accessibility needs unless explicitly stated',
      'Personal names or universities may trigger unintentional tonal differences - review critically',
    ],
    confidence: level,
    confidenceReason: reason,
  };
}

function matchingConfidence(userSkills: string[]): { level: ConfidenceLevel; reason: string } {
  if (userSkills.length >= 5) {
    return {
      level: 'high',
      reason: `${userSkills.length} skills found in your profile. Match percentages are calculated against all required skills for each role.`,
    };
  }
  if (userSkills.length >= 2) {
    return {
      level: 'medium',
      reason: `${userSkills.length} skills found. Matches may be incomplete - add more skills to your profile for more accurate ranking.`,
    };
  }
  return {
    level: 'low',
    reason: 'No skills or very few skills found in your profile. All roles will show 0% match. Visit your Profile to add skills.',
  };
}

export function buildMatchingExplainability(userSkills: string[]): ExplainabilityData {
  const { level, reason } = matchingConfidence(userSkills);
  return {
    featureName: 'Internship Matching',
    model: 'Rule-based keyword matching (no AI model)',
    inputs: [
      { label: 'Your skills', value: `${userSkills.length} skill${userSkills.length !== 1 ? 's' : ''}`, present: userSkills.length > 0 },
      { label: 'Profile career interests', value: '', present: false },
      { label: 'Internship required skills', value: 'from internship dataset', present: true },
      { label: 'Internship type filter', value: 'user-selected', present: true },
    ],
    optimisedFor: [
      'Maximising overlap between your listed skills and each role\'s required skills',
      'Ranking roles by descending match percentage so most relevant appear first',
      'Showing explicitly which required skills you already have vs. gaps',
    ],
    limitations: [
      'Matching is keyword-based - "React" and "ReactJS" may not always be treated as identical',
      'Soft skills and experience quality are not considered, only listed skill names',
      'Roles requiring skills you have not listed will score 0% even if you are capable',
      'The internship dataset is curated and does not represent the full live job market',
    ],
    biasRisks: [
      'Skills listed in profiles may over-represent technical skills, disadvantaging candidates with strong soft skills',
      'The curated dataset may over-represent certain industries or company sizes',
      'Normalisation is case-insensitive substring matching - unusual skill spellings may be missed',
      'Users who are better at self-promotion (listing more skills) will appear better matched, regardless of actual ability',
    ],
    confidence: level,
    confidenceReason: reason,
  };
}

function interviewConfidence(role: string, company: string, questionType: string): { level: ConfidenceLevel; reason: string } {
  const hasRole = !!role;
  const hasCompany = !!company;
  if (hasRole && hasCompany) {
    return {
      level: 'high',
      reason: `Feedback is contextualised to the role "${role}" at "${company}". The model has specific context to assess relevance of your answer.`,
    };
  }
  if (hasRole) {
    return {
      level: 'medium',
      reason: `Feedback is contextualised to the role "${role}" but no company was specified. Responses may be less tailored to specific organisational culture.`,
    };
  }
  return {
    level: 'low',
    reason: 'No role or company was specified for this session. Feedback is generic and not tailored to a specific position.',
  };
}

export function buildInterviewExplainability(
  role: string,
  company: string,
  questionType: string,
): ExplainabilityData {
  const { level, reason } = interviewConfidence(role, company, questionType);
  return {
    featureName: 'AI Interview Feedback',
    model: 'OpenAI GPT-4o Mini',
    inputs: [
      { label: 'Your written answer', value: '', present: true },
      { label: 'Interview question text', value: '', present: true },
      { label: 'Question type', value: questionType, present: !!questionType },
      { label: 'Target role', value: role, present: !!role },
      { label: 'Target company', value: company, present: !!company },
    ],
    optimisedFor: [
      'Identifying use of structured frameworks (e.g. STAR - Situation, Task, Action, Result)',
      'Assessing relevance of the answer to the specific question asked',
      'Flagging vague or unsupported claims that interviewers may probe further',
      'Offering concrete, actionable improvement suggestions',
    ],
    limitations: [
      'The model cannot know what a specific interviewer values - feedback is based on general best practice',
      'Very short answers may receive disproportionately low scores regardless of quality',
      'Technical knowledge accuracy cannot be verified by the model',
      'Scores (1-10) are estimates, not calibrated against real interview outcomes',
      'The model may occasionally hallucinate specific strengths or improvements',
    ],
    biasRisks: [
      'Formal, structured writing styles may score higher than equally valid conversational responses',
      'Training data may reflect interview norms that favour neurotypical communication styles',
      'Answers using non-native English phrasing may be evaluated less favourably',
      'Industry-specific jargon unfamiliar to the model may be flagged incorrectly as a weakness',
      'The model has no knowledge of the user\'s disability or accessibility needs',
    ],
    confidence: level,
    confidenceReason: reason,
  };
}
