import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseRouteClient, createSupabaseAdminClient } from '@/lib/supabase-admin';

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

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Payments are not configured.' }, { status: 503 });
    }

    const adminClient = createSupabaseAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription found.' }, { status: 404 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = req.headers.get('origin') ?? 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id as string,
      return_url: `${origin}/dashboard/data`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('[stripe/portal] Unexpected error', {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to open subscription portal.' }, { status: 500 });
  }
}
