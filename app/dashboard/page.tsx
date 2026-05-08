'use client';

// Dashboard page with Neurodiverse Support Mode adaptations.
//
// Cognitive load adaptations applied here:
// - isLowCognitiveLoad: Quick Actions grid reduced from 4 to 2 items (the
//   most commonly used). The remaining actions are still accessible via the
//   sidebar. Hick's Law: reducing choices reduces decision time/anxiety.
// - isStepByStep: ProfileCompletionCard is replaced by a StepChecklist that
//   reveals one task at a time. Progress bar provides positive reinforcement.
// - show_guidance_prompts: GuidancePrompt banner surfaces the single most
//   relevant next action based on profile completeness. Eliminates the need
//   for the user to scan and decide themselves.
// - isMinimalText: Stat card labels are shortened to single words; action
//   card descriptions are hidden to reduce reading load.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { supabase } from '@/lib/supabase';
import type { Application, Profile } from '@/lib/types';
import { fetchProfile } from '@/lib/profiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GuidancePrompt } from '@/components/neurodiverse/GuidancePrompt';
import { StepChecklist } from '@/components/neurodiverse/StepChecklist';
import type { ChecklistStep } from '@/components/neurodiverse/StepChecklist';
import {
  User,
  FileText,
  Sparkles,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Circle,
  TrendingUp,
  Heart,
  Clock,
  ListChecks,
  Calendar,
  Bell,
  Building2,
  ArrowRight,
  Compass,
  GraduationCap,
  Wand2,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Saved: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  Applied: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Interview: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Offer: 'bg-green-500/10 text-green-600 dark:text-green-400',
  Rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

// ProfileCompletionCard: standard view shows all steps simultaneously.
// In step-by-step mode this component is swapped for a StepChecklist.
// Design note: keeping both components separate (rather than one with a flag)
// avoids the component becoming a hard-to-read conditional tangle.
function ProfileCompletionCard({ profile }: { profile: Profile | null }) {
  const steps = [
    { label: 'Add your name', done: !!profile?.full_name },
    { label: 'Add your course', done: !!profile?.course },
    { label: 'Add your university', done: !!profile?.university },
    { label: 'Add at least one skill', done: (profile?.skills?.length ?? 0) > 0 },
    { label: 'Write a short bio', done: !!profile?.bio },
  ];
  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Profile Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{completed} of {steps.length} complete</span>
            <span className="font-semibold text-primary">{pct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <ul className="space-y-2">
          {steps.map(({ label, done }) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              {done
                ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                : <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              }
              <span className={done ? 'text-muted-foreground line-through' : 'text-foreground'}>
                {label}
              </span>
            </li>
          ))}
        </ul>
        {pct < 100 && (
          <Button asChild size="sm" className="w-full">
            <Link href="/dashboard/profile">Complete Profile</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingRemindersCard({ applications }: { applications: Application[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inTwoWeeks = new Date(today);
  inTwoWeeks.setDate(today.getDate() + 14);

  const upcoming = applications
    .filter((a) => {
      if (!a.reminder_date) return false;
      const d = new Date(a.reminder_date);
      return d >= today && d <= inTwoWeeks;
    })
    .sort((a, b) => new Date(a.reminder_date!).getTime() - new Date(b.reminder_date!).getTime());

  const overdue = applications.filter((a) => {
    if (!a.reminder_date) return false;
    return new Date(a.reminder_date) < today;
  });

  if (upcoming.length === 0 && overdue.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No reminders in the next 14 days.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Set reminder dates on your tracked applications.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Upcoming Reminders
          {overdue.length > 0 && (
            <Badge className="ml-auto text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
              {overdue.length} overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {overdue.map((app) => (
          <div key={app.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/5 border border-red-500/15">
            <Calendar className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">{app.internship_title}</p>
              <p className="text-[11px] text-red-500">
                Overdue - {new Date(app.reminder_date!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[app.status] || 'bg-muted text-muted-foreground'}`}>
              {app.status}
            </span>
          </div>
        ))}
        {upcoming.map((app) => {
          const daysUntil = Math.round((new Date(app.reminder_date!).getTime() - today.getTime()) / 86400000);
          return (
            <div key={app.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border">
              <Calendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{app.internship_title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`} -{' '}
                  {new Date(app.reminder_date!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[app.status] || 'bg-muted text-muted-foreground'}`}>
                {app.status}
              </span>
            </div>
          );
        })}
        <Link href="/dashboard/applications" className="block pt-1">
          <Button variant="ghost" size="sm" className="w-full text-xs gap-1.5">
            View all applications
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function RecentApplicationsCard({ applications }: { applications: Application[] }) {
  const recent = [...applications]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            Recent Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">No applications tracked yet.</p>
          <Button asChild size="sm" variant="outline" className="w-full gap-2">
            <Link href="/dashboard/internships">
              <Briefcase className="w-4 h-4" />
              Browse Internships
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            Recent Applications
          </CardTitle>
          <Link href="/dashboard/applications">
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {recent.map((app) => (
          <div key={app.id} className="flex items-center gap-3 py-1.5">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">{app.internship_title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{app.company}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[app.status] || 'bg-muted text-muted-foreground'}`}>
              {app.status}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface QuickAction {
  href: string;
  icon: React.ElementType;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  // priority = true marks the action to show in low cognitive load mode
  priority: boolean;
}

const quickActions: QuickAction[] = [
  { href: '/dashboard/cv', icon: FileText, label: 'CV Builder', shortLabel: 'CV', description: 'Manually build your CV', color: 'bg-blue-500/10 text-blue-600', priority: false },
  { href: '/dashboard/cv/generate', icon: Sparkles, label: 'AI CV Generator', shortLabel: 'AI CV', description: 'Let AI draft your CV', color: 'bg-primary/10 text-primary', priority: true },
  { href: '/dashboard/internships', icon: Briefcase, label: 'Find Internships', shortLabel: 'Internships', description: 'Browse matched roles', color: 'bg-green-500/10 text-green-600', priority: true },
  { href: '/dashboard/applications', icon: ListChecks, label: 'Applications', shortLabel: 'Track Apps', description: 'Track your progress', color: 'bg-amber-500/10 text-amber-600', priority: false },
];

// Derive the best guidance prompt based on profile completeness.
// Returns the most relevant "next best action" for the current user state.
// Complexity is kept deterministic (no AI) — it's a simple priority chain.
function getGuidancePrompt(profile: Profile | null, applicationCount: number) {
  const profileComplete = !!(profile?.full_name && profile?.course && profile?.university && (profile?.skills?.length ?? 0) > 0);
  const hasApplications = applicationCount > 0;

  if (!profile?.full_name) {
    return {
      id: 'dashboard-complete-profile',
      headline: 'Start by completing your profile',
      reason: 'Your name and course help the AI generate a more accurate CV and find better-matching internships for you.',
      action: { label: 'Go to Profile', href: '/dashboard/profile' },
    };
  }
  if (!profile?.course || !profile?.university) {
    return {
      id: 'dashboard-add-course',
      headline: 'Add your course and university',
      reason: 'Internship matching uses your course to filter relevant roles - this is the next step to getting useful matches.',
      action: { label: 'Update Profile', href: '/dashboard/profile' },
    };
  }
  if ((profile?.skills?.length ?? 0) === 0) {
    return {
      id: 'dashboard-add-skills',
      headline: 'Add your skills to get matches',
      reason: 'Internship matching compares your skills to what each role requires. Without skills, all roles will show 0% match.',
      action: { label: 'Add Skills', href: '/dashboard/profile' },
    };
  }
  if (!profileComplete) {
    return {
      id: 'dashboard-add-bio',
      headline: 'Write a short personal statement',
      reason: 'A bio gives the AI more context when generating your CV, producing a more personalised result.',
      action: { label: 'Update Profile', href: '/dashboard/profile' },
    };
  }
  if (!hasApplications) {
    return {
      id: 'dashboard-browse-internships',
      headline: 'Browse your matched internships',
      reason: 'Your profile is complete - you can now see how well your skills match available roles.',
      action: { label: 'Find Internships', href: '/dashboard/internships' },
      secondaryAction: { label: 'Generate AI CV', href: '/dashboard/cv/generate' },
    };
  }
  return {
    id: 'dashboard-practice-interview',
    headline: 'Practise for your interviews',
    reason: 'You have applications in progress. Practising common interview questions now can help build confidence.',
    action: { label: 'Interview Practice', href: '/dashboard/interview' },
  };
}

function getProfileCompletion(profile: Profile | null) {
  const checks = [
    !!profile?.full_name,
    !!profile?.course,
    !!profile?.university,
    (profile?.skills?.length ?? 0) > 0,
    !!profile?.bio,
  ];

  const completed = checks.filter(Boolean).length;

  return {
    completed,
    total: checks.length,
    percent: Math.round((completed / checks.length) * 100),
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { show_guidance_prompts, isStepByStep, isLowCognitiveLoad, isMinimalText } = useAccessibility();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cvCount, setCvCount] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const profileProgress = getProfileCompletion(profile);
  const overviewBackground = 'linear-gradient(135deg, hsl(var(--hero-glow-a) / 0.08), hsl(var(--hero-surface-mid) / 0.95) 42%, hsl(var(--hero-surface-end) / 0.85) 100%)';

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, cvRes, generatedRes, wishlistRes, appsRes] = await Promise.all([
        fetchProfile(user.id),
        supabase.from('cv_items').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('generated_cvs').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('wishlist').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('applications').select('*').eq('user_id', user.id),
      ]);
      setProfile(profileRes as Profile | null);
      setCvCount(cvRes.count ?? 0);
      setGeneratedCount(generatedRes.count ?? 0);
      setWishlistCount(wishlistRes.count ?? 0);
      setApplications((appsRes.data as Application[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  // isMinimalText: use single-word labels to reduce reading burden.
  // isLowCognitiveLoad: hide secondary stat cards (AI CVs, Wishlist)
  // to reduce the number of numbers the user must process at once.
  const stats = [
    { label: isMinimalText ? 'CV' : 'CV Entries', value: cvCount, icon: FileText, secondary: false },
    { label: isMinimalText ? 'AI CVs' : 'AI CVs Generated', value: generatedCount, icon: Sparkles, secondary: true },
    { label: isMinimalText ? 'Saved' : 'Wishlist', value: wishlistCount, icon: Heart, secondary: true },
    { label: isMinimalText ? 'Applied' : 'Tracked Apps', value: applications.length, icon: ListChecks, secondary: false },
  ].filter((s) => !isLowCognitiveLoad || !s.secondary);

  // isLowCognitiveLoad: show only the 2 priority quick actions.
  // Reducing choice count follows Hick's Law — fewer options = faster decisions.
  const visibleActions = isLowCognitiveLoad
    ? quickActions.filter((a) => a.priority)
    : quickActions;

  // Build step-by-step checklist steps from profile state.
  // Each step includes a "why" explanation so users with executive dysfunction
  // understand the purpose before attempting the task.
  const checklistSteps: ChecklistStep[] = [
    {
      id: 'name',
      label: 'Add your name',
      why: 'Your name appears on your CV and helps personalise AI-generated content.',
      done: !!profile?.full_name,
      href: '/dashboard/profile',
      actionLabel: 'Go to Profile',
    },
    {
      id: 'course',
      label: 'Add your course and university',
      why: 'Internship matching filters roles by subject area - this improves your match scores.',
      done: !!profile?.course && !!profile?.university,
      href: '/dashboard/profile',
      actionLabel: 'Update Profile',
    },
    {
      id: 'skills',
      label: 'Add at least one skill',
      why: 'Skills are the core input for internship matching. Without them, all roles show 0% match.',
      done: (profile?.skills?.length ?? 0) > 0,
      href: '/dashboard/profile',
      actionLabel: 'Add Skills',
    },
    {
      id: 'bio',
      label: 'Write a short personal statement',
      why: 'A bio gives the AI more context and produces a more personalised CV draft.',
      done: !!profile?.bio,
      href: '/dashboard/profile',
      actionLabel: 'Write Bio',
    },
    {
      id: 'internships',
      label: 'Browse matched internships',
      why: 'Now your profile is set up, see which roles match your skills.',
      done: wishlistCount > 0,
      href: '/dashboard/internships',
      actionLabel: 'Find Internships',
    },
    {
      id: 'apply',
      label: 'Track your first application',
      why: 'Tracking applications helps you stay organised and avoid missing deadlines.',
      done: applications.length > 0,
      href: '/dashboard/applications',
      actionLabel: 'Track Applications',
    },
  ];

  const guidanceProps = getGuidancePrompt(profile, applications.length);
  const overviewChips = [
    {
      icon: GraduationCap,
      label: profile?.course && profile?.university ? `${profile.course} at ${profile.university}` : 'Add your course and university',
    },
    {
      icon: Wand2,
      label: generatedCount > 0 ? `${generatedCount} AI CV draft${generatedCount === 1 ? '' : 's'} generated` : 'No AI CV drafts yet',
    },
    {
      icon: Compass,
      label: applications.length > 0 ? `${applications.length} tracked application${applications.length === 1 ? '' : 's'}` : 'No tracked applications yet',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Greeting banner — simplified in minimal text mode (drop the subtitle) */}
      <div
        className="overflow-hidden rounded-[28px] border border-border/80 p-6 shadow-[0_26px_80px_-58px_rgba(15,23,42,0.45)]"
        style={{ backgroundImage: overviewBackground }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-medium text-primary dark:bg-background/20">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {greeting}, {displayName.split(' ')[0]}
            </h1>
            {!isMinimalText && (
              <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Your dashboard keeps profile progress, matched opportunities, and application tasks in one calmer workspace.
              </p>
            )}
            {!isMinimalText && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {overviewChips.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-2 text-xs text-muted-foreground dark:bg-background/20"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="min-w-[220px] rounded-3xl border border-border/70 bg-background/80 p-4 dark:bg-background/20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Profile readiness
            </p>
            <p className="mt-3 text-3xl font-bold text-foreground">{loading ? '-' : `${profileProgress.percent}%`}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {loading ? 'Checking your profile' : `${profileProgress.completed} of ${profileProgress.total} core details completed`}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${loading ? 0 : profileProgress.percent}%` }}
              />
            </div>
            <Link href="/dashboard/profile" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
              Review profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Guidance prompt — shown when show_guidance_prompts is enabled.
          Placed prominently below the greeting so it's the first thing seen
          after orientation. Not inside a card to reduce visual nesting depth. */}
      {show_guidance_prompts && !loading && (
        <GuidancePrompt
          id={guidanceProps.id}
          headline={guidanceProps.headline}
          reason={guidanceProps.reason}
          action={guidanceProps.action}
          secondaryAction={'secondaryAction' in guidanceProps ? guidanceProps.secondaryAction : undefined}
        />
      )}

      {/* Stats bar — filtered/relabelled based on active preset */}
      <div className={`grid gap-4 ${stats.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border/70 shadow-[0_18px_50px_-46px_rgba(15,23,42,0.45)]">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-foreground">{loading ? '-' : value}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {/* Step-by-step mode: swap the all-at-once checklist for a
              progressive one-item-at-a-time StepChecklist.
              Standard mode: show the standard ProfileCompletionCard. */}
          {isStepByStep
            ? <StepChecklist
                title="Your career journey"
                steps={checklistSteps}
                stepByStepMode={true}
              />
            : <ProfileCompletionCard profile={profile} />
          }
          <UpcomingRemindersCard applications={applications} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {isLowCognitiveLoad ? 'Key Actions' : 'Quick Actions'}
            </h2>
            {/* Low cognitive load: 1-column layout with 2 items instead of a
                2x2 grid of 4 — halves the number of choices presented. */}
            <div className={`grid gap-3 ${isLowCognitiveLoad ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {visibleActions.map(({ href, icon: Icon, label, shortLabel, description, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-accent/30 transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* Minimal text mode: use shortened labels */}
                    <p className="text-sm font-semibold text-foreground">{isMinimalText ? shortLabel : label}</p>
                    {/* Minimal text mode: hide description to reduce word count */}
                    {!isMinimalText && (
                      <p className="text-xs text-muted-foreground truncate">{description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>

            {/* Low cognitive load: show a discreet "more options" link instead
                of overwhelming the user with all 4 actions upfront. */}
            {isLowCognitiveLoad && (
              <p className="text-xs text-muted-foreground mt-2 pl-1">
                More options available in the sidebar navigation.
              </p>
            )}
          </div>

          <RecentApplicationsCard applications={applications} />

          {/* Research card — hidden in minimal text mode to reduce noise */}
          {!isMinimalText && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground mb-1">Research Participation</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      Help improve this platform by completing a short survey as part of our university research study.
                    </p>
                    <Button asChild size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
                      <Link href="/survey-info">Learn More</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
