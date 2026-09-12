'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Scale,
  Lock,
  RefreshCw,
  X,
  ChevronRight,
  Sparkles,
  CreditCard,
} from 'lucide-react';

const CONSENT_VERSION = '1.0';

interface ConsentRecord {
  id: string;
  consent_version: string;
  consented: boolean;
  consented_at: string;
  updated_at: string;
}

function isMissingTableError(message?: string) {
  return !!message && /Could not find the table|schema cache/i.test(message);
}

function DeleteConfirmModal({
  onConfirm,
  onClose,
  deleting,
}: {
  onConfirm: () => void;
  onClose: () => void;
  deleting: boolean;
}) {
  const [typed, setTyped] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 id="delete-dialog-title" className="font-semibold text-foreground">Remove Personal Data</h2>
                <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Cancel">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
            <p>
              This deletes your account on the server, removes the personal data stored by the prototype,
              and signs you out. Your research consent is retained only as a de-identified withdrawn
              audit trail so the dissertation remains ethically defensible.
            </p>
            <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3">
              <p className="text-xs text-red-700 dark:text-red-300 font-medium mb-1">Before you delete</p>
              <p className="text-xs text-red-600/80 dark:text-red-400/80">
                We recommend downloading your data first. Once deleted, this in-app data cannot be recovered.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-input" className="text-xs font-semibold text-muted-foreground">
              Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm
            </label>
            <input
              id="confirm-input"
              ref={inputRef}
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="DELETE"
              className="w-full text-sm rounded-lg border border-border bg-muted/30 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/30 font-mono"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onConfirm}
              disabled={typed !== 'DELETE' || deleting}
              variant="destructive"
              className="flex-1 gap-2"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Remove My Data
            </Button>
            <Button onClick={onClose} variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </>
  );
}

function DataSection({ title, rowCount }: { title: string; rowCount: number | null }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
        <span className="text-sm text-foreground">{title}</span>
      </div>
      <span className="text-xs text-muted-foreground font-medium tabular-nums">
        {rowCount === null ? '...' : `${rowCount} record${rowCount !== 1 ? 's' : ''}`}
      </span>
    </div>
  );
}

function SubscriptionCard() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [plan, setPlan] = useState<string>('free');
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('profiles')
      .select('plan')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => { if (data?.plan) setPlan(data.plan as string); });
  }, [session]);

  const handleUpgrade = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast({ title: 'Could not start checkout', description: data.error ?? 'Please try again.', variant: 'destructive' });
        return;
      }
      window.location.href = data.url;
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    if (!session) return;
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast({ title: 'Could not open portal', description: data.error ?? 'Please try again.', variant: 'destructive' });
        return;
      }
      window.location.href = data.url;
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <CardTitle className="text-base">Subscription</CardTitle>
        </div>
        <CardDescription>
          Manage your plan and billing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 py-1">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Current plan:{' '}
              <span className={`font-semibold ${plan === 'pro' ? 'text-primary' : 'text-foreground'}`}>
                {plan === 'pro' ? 'Pro' : plan === 'enterprise' ? 'Enterprise' : 'Free'}
              </span>
            </p>
            {plan === 'free' && (
              <p className="text-xs text-muted-foreground">
                Upgrade to Pro for more AI CV generations and interview feedback each day.
              </p>
            )}
          </div>
          {plan === 'pro' || plan === 'enterprise' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePortal}
              disabled={portalLoading}
              className="flex-shrink-0 gap-1.5"
            >
              {portalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Manage subscription
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleUpgrade}
              disabled={loading}
              className="flex-shrink-0 gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Upgrade to Pro
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DataPrivacyPage() {
  const { user, session, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [consentLoading, setConsentLoading] = useState(true);
  const [consentSaving, setConsentSaving] = useState(false);

  const [counts, setCounts] = useState<Record<string, number | null>>({
    profiles: null,
    cv_items: null,
    generated_cvs: null,
    applications: null,
    interview_sessions: null,
  });

  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;

    const [consentRes, ...countResults] = await Promise.all([
      supabase
        .from('research_consent')
        .select('*')
        .eq('user_id', user.id)
        .eq('consent_version', CONSENT_VERSION)
        .maybeSingle(),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('cv_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('generated_cvs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('applications').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('interview_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);

    if (consentRes.data) setConsent(consentRes.data as ConsentRecord);
    setConsentLoading(false);

    const tableNames = ['profiles', 'cv_items', 'generated_cvs', 'applications', 'interview_sessions'];
    const newCounts: Record<string, number | null> = {};
    countResults.forEach((res, i) => {
      newCounts[tableNames[i]] = res.count ?? 0;
    });
    setCounts(newCounts);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleConsentToggle = async (value: boolean) => {
    if (!user || consentSaving) return;
    setConsentSaving(true);
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('research_consent')
      .upsert(
        {
          user_id: user.id,
          consent_version: CONSENT_VERSION,
          consented: value,
          consented_at: now,
          withdrawn_at: value ? null : now,
          withdrawal_method: value ? null : 'toggle',
          account_deleted_at: null,
          updated_at: now,
        },
        { onConflict: 'user_id,consent_version' },
      )
      .select()
      .maybeSingle();

    if (error) {
      toast({ title: 'Failed to update consent', description: 'Please try again.', variant: 'destructive' });
    } else {
      setConsent(data as ConsentRecord);
      toast({
        title: value ? 'Research consent given' : 'Research consent withdrawn',
        description: value
          ? 'Thank you for supporting this research.'
          : 'Your consent has been withdrawn. Your data will not be used in research analysis.',
      });
    }
    setConsentSaving(false);
  };

  const handleExport = async () => {
    if (!user || exporting) return;
    setExporting(true);

    try {
      const readOptionalTable = async (table: string) => {
        const result = await supabase.from(table).select('*').eq('user_id', user.id);

        if (result.error && isMissingTableError(result.error.message)) {
          return { data: [] };
        }

        if (result.error) {
          throw result.error;
        }

        return { data: result.data ?? [] };
      };

      const readTable = async (table: string, optional = false) => {
        const result = await supabase.from(table).select('*').eq('user_id', user.id);

        if (result.error && optional && isMissingTableError(result.error.message)) {
          return { data: [] };
        }

        if (result.error && isMissingTableError(result.error.message)) {
          return { data: [] };
        }

        if (result.error) {
          throw result.error;
        }

        return { data: result.data ?? [] };
      };

      const [profileRes, cvItemsRes, generatedCVsRes, appsRes, sessionsRes, pairsRes, wishlistRes] =
        await Promise.all([
          readTable('profiles'),
          readTable('cv_items'),
          readTable('generated_cvs'),
          readTable('applications'),
          readTable('interview_sessions'),
          readTable('interview_qa_pairs', true),
          readTable('wishlist', true),
        ]);

      const exportPayload = {
        exported_at: new Date().toISOString(),
        export_version: '1.0',
        notice: 'This file contains personal data associated with your The Key account. Keep it safe.',
        data: {
          profile: profileRes.data?.[0] ?? null,
          cv_items: cvItemsRes.data ?? [],
          generated_cvs: generatedCVsRes.data ?? [],
          applications: appsRes.data ?? [],
          interview_sessions: sessionsRes.data ?? [],
          interview_qa_pairs: pairsRes.data ?? [],
          saved_internships: wishlistRes.data ?? [],
        },
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `the-key-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'Export downloaded', description: 'Your data has been saved as a JSON file.' });
    } catch {
      toast({ title: 'Export failed', description: 'Please try again.', variant: 'destructive' });
    }
    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (!user || !session?.access_token || deleting) return;
    setDeleting(true);

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account.');
      }

      try {
        await signOut();
      } catch {
        // Ignore local sign-out errors if the server-side account deletion already succeeded.
      }
      router.replace('/');
      toast({
        title: 'Account deleted',
        description: 'Your account, personal data, and active session have been removed.',
      });
    } catch (error) {
      toast({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'Please contact the researcher.',
        variant: 'destructive',
      });
    }
    setDeleting(false);
  };

  const consentDate = consent?.updated_at
    ? new Date(consent.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Data & Privacy
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your privacy preferences, export your data, and control your account.
        </p>
      </div>

      <SubscriptionCard />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Analytics Preferences</CardTitle>
          </div>
          <CardDescription>
            Control whether your anonymised usage data contributes to platform analytics.
            This does not affect your access to any features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="consent-toggle" className="text-sm font-medium">
                Allow anonymised analytics
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Allow anonymised, aggregated patterns from your activity to improve The Key.
                No personally identifiable data is ever shared or sold.
              </p>
              {consentDate && (
                <p className="text-[11px] text-muted-foreground">
                  Last updated: {consentDate} · Policy v{CONSENT_VERSION}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 pt-0.5">
              {consentLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <Switch
                  id="consent-toggle"
                  checked={consent?.consented ?? false}
                  onCheckedChange={handleConsentToggle}
                  disabled={consentSaving}
                  aria-label="Research consent toggle"
                />
              )}
            </div>
          </div>

          {!consentLoading && (
            <div className={`rounded-xl p-3 flex items-start gap-2.5 ${
              consent?.consented
                ? 'bg-green-500/5 border border-green-500/20'
                : 'bg-muted/40 border border-border'
            }`}>
              {consent?.consented ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
              <p className="text-xs leading-relaxed text-foreground/70">
                {consent?.consented
                  ? 'Analytics enabled. Thank you for helping us improve The Key. You can withdraw at any time by toggling this off.'
                  : 'Analytics disabled. Your data will not contribute to platform analytics. You can change this at any time.'}
              </p>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/ethics#consent" className="text-primary hover:underline flex items-center gap-1">
              Read the full ethics statement
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Export Your Data</CardTitle>
          </div>
          <CardDescription>
            Download a copy of all personal data we hold about you in JSON format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/40 px-4 py-2.5 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Included in export</p>
            </div>
            <div className="px-4 py-2">
              <DataSection title="Profile" rowCount={counts.profiles} />
              <DataSection title="CV Items" rowCount={counts.cv_items} />
              <DataSection title="Generated CVs" rowCount={counts.generated_cvs} />
              <DataSection title="Applications" rowCount={counts.applications} />
              <DataSection title="Interview Sessions" rowCount={counts.interview_sessions} />
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 border border-border p-3 flex gap-2.5">
            <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              The exported file will be saved to your device. It contains personal data - keep it safe and
              do not share it publicly.
            </p>
          </div>

          <Button onClick={handleExport} disabled={exporting} className="gap-2 w-full sm:w-auto">
            {exporting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Preparing export...</>
            ) : (
              <><Download className="w-4 h-4" />Download My Data</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-500" />
            <CardTitle className="text-base text-red-600 dark:text-red-400">Remove Personal Data</CardTitle>
          </div>
          <CardDescription>
            Permanently delete your account, remove your stored data, and sign out.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 space-y-2">
            <p className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />This cannot be undone
            </p>
            <ul className="space-y-1.5">
              {[
                'Your profile, CV items, and generated CVs will be deleted',
                'Your internship applications and interview sessions will be deleted',
                'Your accessibility preferences will be deleted',
                'Your research consent record will be retained only as a de-identified withdrawn audit trail',
                'Your authentication access to the platform will be removed on the server',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-red-600/80 dark:text-red-400/80">
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            We recommend downloading your data before deleting your account.
          </p>

          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Remove My Data
          </Button>
        </CardContent>
      </Card>

      <div className="rounded-xl bg-muted/40 border border-border p-4">
        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-primary" />Your rights under UK GDPR
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You have the right to access, rectify, and erase your personal data. For questions about how your
          data is used or to make a complaint, see the{' '}
          <Link href="/ethics" className="text-primary hover:underline">Ethics & Transparency</Link>{' '}
          page or contact the researcher through your university&apos;s student portal.
        </p>
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirm={handleDeleteAccount}
          onClose={() => setShowDeleteModal(false)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
