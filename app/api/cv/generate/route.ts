import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ZodError } from 'zod';
import {
  aiCVGenerateRequestSchema,
  aiCVGenerateResponseSchema,
} from '@/lib/validations';
import { createSupabaseRouteClient, createSupabaseAdminClient } from '@/lib/supabase-admin';
import { checkAiRateLimit, logAiUsage } from '@/lib/ai-rate-limit';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildDesignProfile(targetApplication?: {
  role_title?: string;
  company?: string;
  category?: string;
}) {
  const text = `${targetApplication?.role_title || ''} ${targetApplication?.company || ''} ${targetApplication?.category || ''}`.toLowerCase();

  if (/design|ux|creative|brand|marketing/.test(text)) {
    return {
      template: 'creative-portfolio',
      fontFamily: 'Aptos, Calibri, Arial, sans-serif',
      accentColor: '#0f766e',
      secondaryColor: '#f0fdfa',
      layout: 'Portfolio-style header with compact project-led sections and visible impact bullets.',
      rationale: 'A more visual layout suits creative, UX, and communication-focused applications while remaining readable.',
    };
  }

  if (/finance|bank|risk|consult|business|analyst/.test(text)) {
    return {
      template: 'executive-structured',
      fontFamily: 'Georgia, Cambria, Times New Roman, serif',
      accentColor: '#1e3a8a',
      secondaryColor: '#eff6ff',
      layout: 'Formal two-column emphasis with strong section hierarchy and quantified outcomes.',
      rationale: 'A restrained corporate style suits finance, consulting, and business-facing applications.',
    };
  }

  if (/research|machine learning|ai|data|analytics|science|cyber|security|cloud|devops|software|technology|engineering/.test(text)) {
    return {
      template: 'technical-evidence',
      fontFamily: 'Inter, Aptos, Arial, sans-serif',
      accentColor: '#2563eb',
      secondaryColor: '#eff6ff',
      layout: 'Technical profile first, followed by skills, projects, education, and evidence-led experience.',
      rationale: 'A technical evidence layout helps recruiters quickly scan tools, projects, and role-relevant skills.',
    };
  }

  return {
    template: 'balanced-professional',
    fontFamily: 'Aptos, Calibri, Arial, sans-serif',
    accentColor: '#c2410c',
    secondaryColor: '#fff7ed',
    layout: 'Balanced one-page CV with clear summary, education, experience, skills, and achievements.',
    rationale: 'A balanced layout is suitable when the role does not strongly imply a specialist visual direction.',
  };
}

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

    const rateLimit = await checkAiRateLimit(adminClient, user.id, 'cv_generation', plan);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `CV generation limit reached (${rateLimit.used}/${rateLimit.limit} today). Try again tomorrow.`,
          upgradeUrl: rateLimit.upgradeUrl,
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { profile, cvItems, targetApplication } = aiCVGenerateRequestSchema.parse(body);
    const design = buildDesignProfile(targetApplication);

    const skillsList = profile.skills.join(', ') || 'Not specified';
    const targetSkills = targetApplication?.required_skills?.join(', ') || 'Not specified';
    const workItems = cvItems.filter((item) => item.type === 'work');
    const educationItems = cvItems.filter((item) => item.type === 'education');
    const achievements = cvItems.filter((item) => item.type === 'achievement');

    const prompt = `You are a professional CV writer and application strategist helping a UK university student create a distinctive, targeted, accessible CV.

Target application:
- Role: ${targetApplication?.role_title || 'General internship application'}
- Company: ${targetApplication?.company || 'Not specified'}
- Category/Sector: ${targetApplication?.category || 'Not specified'}
- Location: ${targetApplication?.location || 'Not specified'}
- Required skills: ${targetSkills}
- Role description: ${targetApplication?.description || 'Not specified'}

Visual direction to support the CV:
- Template: ${design.template}
- Font direction: ${design.fontFamily}
- Accent colour: ${design.accentColor}
- Layout style: ${design.layout}
- Reason: ${design.rationale}

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

Please generate a professional, well-structured, application-specific CV in plain text. The app will apply the visual styling separately, so do not output HTML, markdown tables, CSS, logos, or images.

Include the following sections where data is available:
1. TARGETED PROFILE - 3-4 sentences tailored to the role and company context
2. ROLE-RELEVANT SKILLS - prioritise skills that match the target application
3. EDUCATION - reverse chronological order
4. PROJECTS / EXPERIENCE - use the strongest evidence for this role first
5. ACHIEVEMENTS & ACTIVITIES - if relevant

Guidelines:
- Use clear, professional language suitable for UK internship applications
- Keep it to approximately 1 page worth of content
- Use action verbs (developed, collaborated, implemented, etc.)
- Be specific about impact and responsibilities where possible
- Reorder and reframe content for this exact application instead of producing a generic CV
- Emphasise the strongest matches between the student's profile and the target role
- Where the student lacks a required skill, do not invent it; frame adjacent experience honestly
- Reflect the selected visual direction through concise section names and content structure, not unsafe HTML
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

    await logAiUsage(adminClient, user.id, 'cv_generation', {
      model: 'gpt-4o-mini',
      prompt_tokens: completion.usage?.prompt_tokens ?? 0,
      completion_tokens: completion.usage?.completion_tokens ?? 0,
      total_tokens: completion.usage?.total_tokens ?? 0,
    });

    const response = aiCVGenerateResponseSchema.parse({
      content: completion.choices[0]?.message?.content || '',
      prompt_used: prompt,
      model_used: 'gpt-4o-mini',
      design,
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid CV generation request.' },
        { status: 400 },
      );
    }

    console.error('[cv/generate] Unexpected error', {
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    if (getErrorStatus(error) === 401) {
      return NextResponse.json(
        { error: 'AI service is not configured correctly.' },
        { status: 401 },
      );
    }

    return NextResponse.json({ error: 'Failed to generate CV. Please try again.' }, { status: 500 });
  }
}
