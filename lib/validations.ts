import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  course: z.string().min(2, 'Course must be at least 2 characters').max(100),
  university: z.string().min(2, 'University must be at least 2 characters').max(150),
  skills: z.array(z.string()).min(1, 'Add at least one skill'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

export const cvItemSchema = z.object({
  type: z.enum(['work', 'education', 'achievement', 'skill']),
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  organisation: z.string().max(150).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().max(1000).optional(),
  is_current: z.boolean().default(false),
  order_index: z.number().default(0),
});

export const authSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = authSchema.extend({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const aiProfileSchema = z.object({
  full_name: z.string().trim().max(100).optional().default(''),
  course: z.string().trim().max(100).optional().default(''),
  university: z.string().trim().max(150).optional().default(''),
  skills: z.array(z.string().trim().min(1)).optional().default([]),
  bio: z.string().trim().max(500).optional().default(''),
});

const aiCVItemSchema = z.object({
  type: z.enum(['work', 'education', 'achievement', 'skill']),
  title: z.string().trim().max(150).optional().default(''),
  organisation: z.string().trim().max(150).optional().default(''),
  start_date: z.string().trim().optional().default(''),
  end_date: z.string().trim().optional().default(''),
  description: z.string().trim().max(1000).optional().default(''),
  is_current: z.boolean().optional().default(false),
  order_index: z.number().optional().default(0),
});

const aiTargetApplicationSchema = z.object({
  role_title: z.string().trim().max(150).optional().default(''),
  company: z.string().trim().max(150).optional().default(''),
  category: z.string().trim().max(80).optional().default(''),
  location: z.string().trim().max(120).optional().default(''),
  required_skills: z.array(z.string().trim().min(1).max(80)).optional().default([]),
  description: z.string().trim().max(800).optional().default(''),
}).optional();

export const aiCVGenerateRequestSchema = z.object({
  profile: aiProfileSchema,
  cvItems: z.array(aiCVItemSchema).optional().default([]),
  targetApplication: aiTargetApplicationSchema,
});

export const aiCVGenerateResponseSchema = z.object({
  content: z.string().min(1),
  prompt_used: z.string().min(1),
  model_used: z.string().min(1),
  design: z.object({
    template: z.string(),
    fontFamily: z.string(),
    accentColor: z.string(),
    secondaryColor: z.string(),
    layout: z.string(),
    rationale: z.string(),
  }).optional(),
});

export const interviewFeedbackRequestSchema = z.object({
  question: z.string().trim().min(5, 'Question is required'),
  question_type: z.enum(['behavioural', 'technical', 'situational', 'motivational']).optional().default('behavioural'),
  user_answer: z.string().trim().min(10, 'Please provide a more detailed answer'),
  role_title: z.string().trim().max(150).optional().default(''),
  company: z.string().trim().max(150).optional().default(''),
});

export const interviewFeedbackResponseSchema = z.object({
  score: z.number().int().min(1).max(10),
  feedback: z.string().default(''),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
});

export const accountDeletionRequestSchema = z.object({
  confirmation: z.literal('DELETE'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type CVItemFormData = z.infer<typeof cvItemSchema>;
export type AuthFormData = z.infer<typeof authSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AICVGenerateRequest = z.infer<typeof aiCVGenerateRequestSchema>;
export type AICVGenerateResponse = z.infer<typeof aiCVGenerateResponseSchema>;
export type InterviewFeedbackRequest = z.infer<typeof interviewFeedbackRequestSchema>;
export type InterviewFeedbackResponse = z.infer<typeof interviewFeedbackResponseSchema>;
export type AccountDeletionRequest = z.infer<typeof accountDeletionRequestSchema>;
