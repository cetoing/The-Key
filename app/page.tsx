'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { AuthForm } from '@/components/auth/AuthForm';
import {
  BookOpen,
  Briefcase,
  Sparkles,
  Shield,
  Brain,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const principles = [
  {
    icon: Sparkles,
    title: 'Explainable AI support',
    description: 'CV generation and interview feedback stay narrow, transparent, and easy to justify academically.',
  },
  {
    icon: Brain,
    title: 'Neurodiverse-friendly design',
    description: 'Low cognitive load, step-by-step support, and calmer interfaces reduce overwhelm during job search tasks.',
  },
  {
    icon: Briefcase,
    title: 'Transparent internship matching',
    description: 'Rule-based matching shows strengths and missing skills instead of hiding recommendations inside a black box.',
  },
];

const workflow = [
  'Build a profile that reflects your course, skills, and strengths',
  'Generate a CV draft or refine one manually with live structure',
  'Track applications, reminders, and interview practice in one place',
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const landingBackground = 'linear-gradient(180deg, hsl(var(--hero-surface-start)) 0%, hsl(var(--hero-surface-mid)) 45%, hsl(var(--hero-surface-end)) 100%)';
  const heroGlow = 'radial-gradient(circle at top left, hsl(var(--hero-glow-a) / 0.18), transparent 38%), radial-gradient(circle at 75% 18%, hsl(var(--hero-glow-b) / 0.12), transparent 28%)';
  const supportPanel = 'hsl(var(--hero-panel))';
  const supportPanelText = 'hsl(var(--hero-panel-foreground))';

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen text-foreground" style={{ backgroundImage: landingBackground }}>
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden border-b border-border/60 px-6 py-10 sm:px-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
          <div className="absolute inset-0" style={{ backgroundImage: heroGlow }} />
          <div className="relative mx-auto flex h-full max-w-2xl flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                  <span className="text-lg font-bold text-primary-foreground">K</span>
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight">The Key</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Accessible career support</p>
                </div>
              </div>
              <div className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
                <Link href="/ethics" className="transition-colors hover:text-foreground">
                  Ethics
                </Link>
                <Link href="/survey-info" className="transition-colors hover:text-foreground">
                  Survey
                </Link>
              </div>
            </div>

            <div className="mt-12 max-w-xl sm:mt-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Shield className="h-3.5 w-3.5" />
                Dissertation prototype for inclusive internship support
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                A calmer way for students to prepare for internships.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">
                The Key helps UK university students, especially neurodiverse learners, build stronger CVs,
                explore suitable internships, prepare for interviews, and stay organised without unnecessary clutter.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ethics"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-2 text-sm font-medium transition-colors hover:border-primary/30 hover:text-primary"
              >
                Read ethics statement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/survey-info"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                View research survey
              </Link>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {principles.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-border/70 bg-white/70 p-5 shadow-[0_18px_60px_-48px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:bg-card/70"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>

            <div
              className="mt-8 rounded-[28px] border border-border/20 p-6 text-white shadow-[0_30px_80px_-52px_rgba(15,23,42,0.55)]"
              style={{ backgroundColor: supportPanel }}
            >
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: supportPanelText }}>
                <BookOpen className="h-4 w-4 text-primary" />
                What the platform supports
              </div>
              <div className="mt-5 space-y-3">
                {workflow.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <p className="text-sm leading-6" style={{ color: supportPanelText }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
              Designed as a research prototype for a university dissertation on inclusive, explainable career technology.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
          <AuthForm />
        </section>
      </div>
    </main>
  );
}
