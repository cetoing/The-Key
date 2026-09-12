'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';

const FREE_FEATURES = [
  { label: 'Internship browser with skill matching', included: true },
  { label: 'Manual CV builder', included: true },
  { label: 'AI CV generation (2 per day)', included: true },
  { label: 'Interview practice feedback (5 per day)', included: true },
  { label: 'Application tracker', included: true },
  { label: 'Accessibility & neurodiverse support modes', included: true },
  { label: 'Priority support', included: false },
];

const PRO_FEATURES = [
  { label: 'Internship browser with skill matching', included: true },
  { label: 'Manual CV builder', included: true },
  { label: 'AI CV generation (10 per day)', included: true },
  { label: 'Interview practice feedback (20 per day)', included: true },
  { label: 'Application tracker', included: true },
  { label: 'Accessibility & neurodiverse support modes', included: true },
  { label: 'Priority support', included: true },
];

export default function PricingPage() {
  const { user, session } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user || !session) {
      router.push('/?redirect=pricing');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        toast({
          title: 'Could not start checkout',
          description: data.error ?? 'Please try again.',
          variant: 'destructive',
        });
        return;
      }

      window.location.href = data.url;
    } catch {
      toast({
        title: 'Something went wrong',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <h1 className="text-3xl font-bold text-foreground">Simple, transparent pricing</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed max-w-xl">
            Start free. Upgrade when you need more AI capacity. No hidden fees.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Free tier */}
          <div className="rounded-2xl border border-border bg-card p-7 flex flex-col">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Free</p>
              <p className="mt-2 text-4xl font-bold text-foreground">£0</p>
              <p className="text-sm text-muted-foreground mt-1">Forever free</p>
            </div>

            <ul className="mt-7 space-y-3 flex-1">
              {FREE_FEATURES.map(({ label, included }) => (
                <li key={label} className="flex items-start gap-2.5">
                  {included ? (
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`text-sm ${included ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {user ? (
                <Button variant="outline" className="w-full h-11 rounded-2xl" asChild>
                  <Link href="/dashboard">Go to dashboard</Link>
                </Button>
              ) : (
                <Button variant="outline" className="w-full h-11 rounded-2xl" asChild>
                  <Link href="/">Get started free</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Pro tier */}
          <div className="rounded-2xl border-2 border-primary bg-card p-7 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <Sparkles className="w-3 h-3" />
                Most popular
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">Pro</p>
              <p className="mt-2 text-4xl font-bold text-foreground">
                £12.99<span className="text-xl font-normal text-muted-foreground">/mo</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">Billed monthly · cancel anytime</p>
            </div>

            <ul className="mt-7 space-y-3 flex-1">
              {PRO_FEATURES.map(({ label, included }) => (
                <li key={label} className="flex items-start gap-2.5">
                  {included ? (
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`text-sm ${included ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button
                className="w-full h-11 rounded-2xl gap-2"
                onClick={handleUpgrade}
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Redirecting to checkout…' : 'Upgrade to Pro'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border/60 bg-muted/30 px-6 py-5">
          <p className="text-sm font-medium text-foreground mb-2">Need access for your university or careers service?</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We offer institutional licensing for universities and careers services. Get in touch at{' '}
            <a href="mailto:support@[yourdomain]" className="text-primary hover:underline">support@[yourdomain]</a>.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/ethics" className="hover:text-foreground transition-colors">Ethics & Transparency</Link>
        </div>
      </div>
    </div>
  );
}
