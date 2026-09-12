import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createSupabaseAdminClient, createSupabaseRouteClient } from '@/lib/supabase-admin';
import { accountDeletionRequestSchema } from '@/lib/validations';

const CONSENT_VERSION = '1.0';
const USER_DATA_TABLES = [
  'interview_qa_pairs',
  'interview_sessions',
  'applications',
  'generated_cvs',
  'cv_items',
  'wishlist',
  'usage_metrics',
  'profiles',
] as const;

function extractBearerToken(header: string | null) {
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

async function deleteUserData(admin: ReturnType<typeof createSupabaseAdminClient>, userId: string) {
  for (const table of USER_DATA_TABLES) {
    const { error } = await admin.from(table).delete().eq('user_id', userId);

    if (!error) {
      continue;
    }

    const isMissingOptionalTable = /Could not find the table|schema cache/i.test(error.message);

    if (isMissingOptionalTable) {
      console.warn(`Skipping missing table during account deletion: ${table}`);
      continue;
    }

    throw new Error(error.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Missing authentication token.' }, { status: 401 });
    }

    accountDeletionRequestSchema.parse(await req.json());

    const routeClient = createSupabaseRouteClient(token);
    const adminClient = createSupabaseAdminClient();

    const {
      data: { user },
      error: userError,
    } = await routeClient.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Could not verify your session.' }, { status: 401 });
    }

    const now = new Date().toISOString();

    const { error: consentError } = await adminClient
      .from('research_consent')
      .upsert(
        {
          user_id: user.id,
          consent_version: CONSENT_VERSION,
          consented: false,
          consented_at: now,
          withdrawn_at: now,
          withdrawal_method: 'account_deletion',
          updated_at: now,
        },
        { onConflict: 'user_id,consent_version' },
      );

    if (consentError) {
      throw new Error(consentError.message);
    }

    await deleteUserData(adminClient, user.id);

    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (authDeleteError) {
      throw new Error(authDeleteError.message);
    }

    const { error: deidentifyConsentError } = await adminClient
      .from('research_consent')
      .update({
        user_id: null,
        consented: false,
        account_deleted_at: now,
        updated_at: now,
      })
      .eq('user_id', user.id);

    if (deidentifyConsentError) {
      console.error('Consent de-identification warning:', deidentifyConsentError);
      return NextResponse.json({
        success: true,
        warning: 'Account deleted, but the consent audit row could not be fully de-identified automatically.',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid deletion request.' },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return NextResponse.json(
        { error: 'Account deletion is not configured on the server. Add SUPABASE_SERVICE_ROLE_KEY to enable this feature.' },
        { status: 503 },
      );
    }

    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again or contact support if the problem continues.' },
      { status: 500 },
    );
  }
}
