import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ZodError } from 'zod';
import {
  interviewFeedbackRequestSchema,
  interviewFeedbackResponseSchema,
} from '@/lib/validations';
import { createSupabaseRouteClient, createSupabaseAdminClient } from '@/lib/supabase-admin';
import { checkAiRateLimit, logAiUsage } from '@/lib/ai-rate-limit';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error !== null && 'status' in error
    ? Number(error.status)
    : undefined;
}

function extractBearerToken(header: string | null) {
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
    }

    const routeClient = createSupabaseRouteClient(token);
    const { data: { user }, error: userError } = await routeClient.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Could not verify your session.' }, { status: 401 });
    }

    const adminClient = createSupabaseAdminClient();

    const { data: profileData } = await adminClient
      .from('profiles')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    const plan = (profileData?.plan ?? 'free') as 'free' | 'pro' | 'enterprise';

    const rateLimit = await checkAiRateLimit(adminClient, user.id, 'interview_feedback', plan);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Interview feedback limit reached (${rateLimit.used}/${rateLimit.limit} today). Try again tomorrow.`,
          upgradeUrl: rateLimit.upgradeUrl,
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { question, question_type, user_answer, role_title, company } =
      interviewFeedbackRequestSchema.parse(body);

    const roleContext = [role_title, company].filter(Boolean).join(' at ');

    const prompt = `You are an experienced careers coach helping a university student prepare for internship interviews in the UK. You are reviewing their answer to an interview question.

Role context: ${roleContext || 'a UK internship'}
Question type: ${question_type}
Question: "${question}"

Student's answer:
"${user_answer}"

Please evaluate this answer and respond with ONLY valid JSON in exactly this format (no markdown, no code blocks, just raw JSON):
{
  "score": <integer 1-10>,
  "feedback": "<2-3 sentence overall feedback paragraph>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}

Scoring guide:
1-3: Answer is very weak - vague, off-topic, or very short
4-5: Partial answer - some relevant content but lacks structure or specifics
6-7: Good answer - relevant, reasonably structured, could use more depth or examples
8-9: Strong answer - clear structure (STAR or similar), specific examples, confident tone
10: Excellent - compelling, specific, well-structured, shows self-awareness and role fit

Be encouraging but honest. Focus on actionable, specific feedback. Keep strengths and improvements to 1-2 items each. Do not be overly harsh. Remember this is a student, not a professional.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a supportive UK careers coach helping university students practise interview skills. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.6,
    });

    await logAiUsage(adminClient, user.id, 'interview_feedback', {
      model: 'gpt-4o-mini',
      prompt_tokens: completion.usage?.prompt_tokens ?? 0,
      completion_tokens: completion.usage?.completion_tokens ?? 0,
      total_tokens: completion.usage?.total_tokens ?? 0,
    });

    const raw = completion.choices[0]?.message?.content || '';

    let parsed: {
      score: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
    };

    try {
      parsed = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI returned invalid JSON');
      }
      parsed = JSON.parse(jsonMatch[0]);
    }

    const response = interviewFeedbackResponseSchema.parse({
      score: Math.max(1, Math.min(10, Math.round(parsed.score))),
      feedback: parsed.feedback || '',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : [],
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid interview feedback request.' },
        { status: 400 },
      );
    }

    console.error('[interview/feedback] Unexpected error', {
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    if (getErrorStatus(error) === 401) {
      return NextResponse.json(
        { error: 'AI service is not configured correctly.' },
        { status: 401 },
      );
    }

    return NextResponse.json({ error: 'Failed to generate feedback. Please try again.' }, { status: 500 });
  }
}
