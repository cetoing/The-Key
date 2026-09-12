'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { fetchAggregateAnalytics, EVENT_LABELS } from '@/lib/analytics';
import type { AggregateStats } from '@/lib/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  BarChart2,
  TrendingUp,
  Sparkles,
  Briefcase,
  ListChecks,
  Mic,
  User,
  Info,
  RefreshCw,
  Shield,
  ChevronRight,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Loader2,
} from 'lucide-react';

const PRESET_RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'All', days: 365 },
];

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtext?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">{label}</p>
            {subtext && <p className="text-[11px] text-muted-foreground mt-1">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const BAR_COLORS = [
  'hsl(var(--primary))',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-muted-foreground">
          <span style={{ color: p.fill ?? p.stroke }}>{p.name}: </span>
          <span className="font-medium text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const evaluationItems = [
  {
    metric: 'CV Generations',
    icon: Sparkles,
    interpretation:
      'Measures engagement with the core AI feature. A high count relative to users indicates the AI CV generator is discoverable and perceived as useful — a key usability indicator.',
    source: 'generated_cvs table (cumulative count)',
    caveat: 'High counts alone do not confirm quality; qualitative survey data is needed to assess satisfaction.',
  },
  {
    metric: 'Internship Saves',
    icon: Briefcase,
    interpretation:
      'Indicates that users found the internship matching results relevant enough to act on. Each save suggests the matching algorithm surfaced an opportunity that resonated with the user.',
    source: 'wishlist table (cumulative count)',
    caveat: 'Saving does not equal applying; conversion from save to application is a stronger signal.',
  },
  {
    metric: 'Applications Created',
    icon: ListChecks,
    interpretation:
      'Demonstrates that users moved from passive browsing to active career-seeking behaviour. This is a direct indicator of platform effectiveness.',
    source: 'applications table (cumulative count)',
    caveat: 'Only tracks applications logged within the platform — external applications are not captured.',
  },
  {
    metric: 'Interview Sessions',
    icon: Mic,
    interpretation:
      'Reflects engagement with the AI interview practice feature. Session completions (vs. starts) indicate sustained engagement rather than abandonment.',
    source: 'interview_sessions table (status = completed)',
    caveat: 'AI feedback quality is not captured here; pair with survey feedback on perceived accuracy.',
  },
  {
    metric: 'Profile Completion Rate',
    icon: User,
    interpretation:
      'Profiles with name, course, university, skills, and bio filled in unlock better matching. A high completion rate suggests onboarding is effective and users understand the value.',
    source: 'profiles table (% of 5 key fields present)',
    caveat: 'Self-reported data — accuracy depends on users providing truthful profile information.',
  },
  {
    metric: 'Daily Activity',
    icon: TrendingUp,
    interpretation:
      'A steady or growing daily event count indicates sustained user engagement. Spikes may correspond to academic deadlines or internship application seasons.',
    source: 'usage_metrics table (all logged events by date)',
    caveat: 'Not all interactions are currently instrumented. This is a lower-bound estimate of activity.',
  },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [preset, setPreset] = useState(30);
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dateRange = useCallback(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - preset);
    return { start: toDateString(start), end: toDateString(end) };
  }, [preset]);

  const loadStats = useCallback(
    async (showRefresh = false) => {
      if (!user) return;
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      const { start, end } = dateRange();
      const data = await fetchAggregateAnalytics(user.id, start, end);
      setStats(data);
      setLoading(false);
      setRefreshing(false);
    },
    [user, dateRange],
  );

  useEffect(() => { loadStats(); }, [loadStats]);

  const completionPct = stats?.completionRate ?? 0;
  const completionColor =
    completionPct >= 80 ? 'text-green-600 dark:text-green-400' :
    completionPct >= 40 ? 'text-amber-600 dark:text-amber-400' :
    'text-red-500';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary" />
            Evaluation & Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your activity overview — interactions are anonymised and never shared.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1" role="group" aria-label="Date range">
            {PRESET_RANGES.map(({ label, days }) => (
              <button
                key={label}
                onClick={() => setPreset(days)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  preset === days
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-pressed={preset === days}
              >
                {label}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadStats(true)}
            disabled={refreshing}
            className="gap-1.5"
            aria-label="Refresh analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-xs">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 px-4 py-3 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800/80 dark:text-blue-200/80 leading-relaxed">
          <span className="font-semibold">Privacy notice: </span>
          This dashboard shows only your own interaction data. No other users&apos; data is visible here.
          Metrics record event types and dates only — no personal content is logged.
          {' '}<Link href="/ethics#data-usage" className="underline hover:no-underline">Ethics statement</Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Activity Summary
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                icon={Sparkles}
                label="CV Generations (total)"
                value={stats?.cvGenerations ?? 0}
                color="bg-primary/10 text-primary"
              />
              <StatCard
                icon={Briefcase}
                label="Internships Saved (total)"
                value={stats?.internshipSaves ?? 0}
                color="bg-green-500/10 text-green-600 dark:text-green-400"
              />
              <StatCard
                icon={ListChecks}
                label="Applications Created (total)"
                value={stats?.applicationsCreated ?? 0}
                color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
              />
              <StatCard
                icon={Mic}
                label="Interview Sessions Started"
                value={stats?.interviewSessionsStarted ?? 0}
                subtext={`${stats?.interviewSessionsCompleted ?? 0} completed`}
                color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              />
              <StatCard
                icon={User}
                label="Profile Completion"
                value={`${completionPct}%`}
                color={`bg-muted ${completionColor}`}
              />
              <StatCard
                icon={TrendingUp}
                label="Logged Events (period)"
                value={stats?.totalEvents ?? 0}
                subtext={`Last ${preset === 365 ? '365' : preset} days`}
                color="bg-muted text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Daily Platform Activity
                </CardTitle>
                <CardDescription>
                  Total logged events per day over the selected period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(stats?.dailyActivity?.length ?? 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart2 className="w-8 h-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No activity logged in this period.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Events are logged as you use the platform features.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={stats!.dailyActivity.map((d) => ({
                        date: formatDateLabel(d.date),
                        Events: d.count,
                      }))}
                      margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="Events"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  Event Type Breakdown
                </CardTitle>
                <CardDescription>
                  Distribution of interaction types in the selected period.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(stats?.eventBreakdown?.length ?? 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart2 className="w-8 h-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No events logged in this period.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={stats!.eventBreakdown.map((e) => ({
                        name: EVENT_LABELS[e.event_type].replace(' ', '\n'),
                        shortName: EVENT_LABELS[e.event_type].split(' ').slice(0, 2).join(' '),
                        Count: e.total,
                      }))}
                      margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="shortName"
                        tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Count" radius={[4, 4, 0, 0]}>
                        {stats!.eventBreakdown.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Profile Completion Breakdown
              </CardTitle>
              <CardDescription>
                How complete your profile is across the five key fields required for optimal matching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Overall completion</span>
                  <span className={`font-bold ${completionColor}`}>{completionPct}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      completionPct >= 80 ? 'bg-green-500' :
                      completionPct >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {completionPct < 100
                    ? 'Complete your profile to improve internship matching accuracy and unlock all features.'
                    : 'Profile is fully completed.'}
                </p>
                {completionPct < 100 && (
                  <Link href="/dashboard/profile">
                    <Button size="sm" variant="outline" className="mt-2 gap-1.5 text-xs">
                      Complete Profile <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <section aria-labelledby="eval-heading">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 id="eval-heading" className="text-xl font-bold text-foreground">Evaluation Summary</h2>
                <p className="text-sm text-muted-foreground">
                  What these metrics indicate about platform usability and effectiveness for the dissertation.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3 flex items-start gap-2.5 mb-5">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
                <span className="font-semibold">Academic note: </span>
                Quantitative interaction metrics are proxies for usability and engagement — they do not
                directly measure learning outcomes or job success. These figures should be triangulated with
                qualitative survey data and think-aloud observations for a complete picture.
              </p>
            </div>

            <div className="space-y-3">
              {evaluationItems.map(({ metric, icon: Icon, interpretation, source, caveat }) => (
                <div key={metric} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{metric}</span>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground/80 leading-relaxed">{interpretation}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        <span className="font-medium">Data source: </span>{source}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        <span className="font-medium">Caveat: </span>{caveat}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                Methodological Notes for Examiners
              </h3>
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>
                  This analytics dashboard is part of a dissertation prototype exploring AI-assisted career support
                  for neurodiverse university students. The metrics logged here are <strong className="text-foreground">privacy-preserving by design</strong>:
                  no personal content (CV text, interview answers, names) is stored in the <code className="font-mono bg-muted px-1 rounded">usage_metrics</code> table.
                </p>
                <p>
                  Events are recorded with <strong className="text-foreground">date-level granularity only</strong> (no precise timestamps)
                  to reduce re-identification risk. The schema enforces a fixed event vocabulary via
                  a <code className="font-mono bg-muted px-1 rounded">CHECK</code> constraint, preventing
                  accidental leakage of personal data through free-form event names.
                </p>
                <p>
                  All data is protected by <strong className="text-foreground">Row Level Security</strong> in Supabase:
                  each user can only read and write their own records. The aggregate stats shown here
                  are derived from this user&apos;s own data — no cross-user comparison is implemented at the
                  client level to protect participant privacy.
                </p>
                <p>
                  Your usage data helps us improve The Key. You control whether your anonymised
                  activity contributes to platform analytics. You can withdraw consent at any time
                  in your Data &amp; Privacy settings.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href="/ethics" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Ethics statement <ChevronRight className="w-3 h-3" />
                </Link>
                <Link href="/dashboard/data" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Manage data & consent <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
