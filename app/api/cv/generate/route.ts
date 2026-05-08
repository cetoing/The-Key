import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ZodError } from 'zod';
import {
  aiCVGenerateRequestSchema,
  aiCVGenerateResponseSchema,
} from '@/lib/validations';
import { createSupabaseRouteClient } from '@/lib/supabase-admin';

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

    const body = await req.json();
    const { profile, cvItems } = aiCVGenerateRequestSchema.parse(body);

    const skillsList = profile.skills.join(', ') || 'Not specified';
    const workItems = cvItems.filter((item) => item.type === 'work');
    const educationItems = cvItems.filter((item) => item.type === 'education');
    const achievements = cvItems.filter((item) => item.type === 'achievement');

    const prompt = `You are a professional CV writer helping a university student create a compelling, concise, and accessible CV.

Student profile:
- Name: ${profile.full_name || 'Not provided'}
- Course: ${profile.course || 'Not provided'}
- University: ${profile.university || 'Not provided'}
- Skills: ${skillsList}
- Bio: ${profile.bio || 'Not provided'}

Work Experience:
${workItems.length > 0 ? workItems.map((item) => `- ${item.title} at ${item.organisation || 'N/A'} (${item.start_date || ''} - ${item.is_current ? 'Present' : item.end_date || 'N/A'}): ${item.description || 'No description'}`).join('\n') : 'None provided'}

Education:
${educationItems.length > 0 ? educationItems.map((item) => `- ${item.title} at ${item.organisation || 'N/A'} (${item.start_date || ''} - ${item.is_current ? 'Present' : item.end_date || 'N/A'}): ${item.description || ''}`).join('\n') : 'None provided'}

Achievements:
${achievements.length > 0 ? achievements.map((item) => `- ${item.title}: ${item.description || ''}`).join('\n') : 'None provided'}

Please generate a professional, well-structured CV in plain text format. Include the following sections where data is available:
1. PERSONAL SUMMARY - 3-4 sentences highlighting the student's strengths and goals
2. EDUCATION - reverse chronological order
3. WORK EXPERIENCE - reverse chronological order with bullet points using action verbs
4. SKILLS - organised by category if possible
5. ACHIEVEMENTS & ACTIVITIES - if relevant

Guidelines:
- Use clear, professional language suitable for UK internship applications
- Keep it to approximately 1 page worth of content
- Use action verbs (developed, collaborated, implemented, etc.)
- Be specific about impact and responsibilities where possible
- Format using clear section headers in UPPERCASE
- Do not include placeholder text like [Your Name] - use actual data provided
- If information is missing, omit that section gracefully`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert CV writer specialising in helping university students and neurodiverse learners create clear, professional, and accessible CVs for internship applications in the UK.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const response = aiCVGenerateResponseSchema.parse({
      content: completion.choices[0]?.message?.content || '',
      prompt_used: prompt,
      model_used: 'gpt-4o-mini',
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid CV generation request.' },
        { status: 400 },
      );
    }

    console.error('CV generation error:', error);
    if (getErrorStatus(error) === 401) {
      return NextResponse.json(
        { error: 'AI service is not configured correctly.' },
        { status: 401 },
      );
    }

    return NextResponse.json({ error: 'Failed to generate CV. Please try again.' }, { status: 500 });
  }
}
