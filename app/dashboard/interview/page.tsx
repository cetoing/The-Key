'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { InterviewSession, Application } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Mic,
  Plus,
  Briefcase,
  ChevronRight,
  Clock,
  Star,
  TrendingUp,
  X,
  Loader2,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
    score >= 6 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
    score >= 4 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
    'bg-red-500/10 text-red-600 dark:text-red-400';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
      <Star className="w-3 h-3" />{score.toFixed(1)}/10
    </span>
  );
}

function StartSessionModal({
  applications,
  onStart,
  onClose,
}: {
  applications: Application[];
  onStart: (roleTitle: string, company: string, internshipId: string) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'custom' | 'internship'>('custom');
  const [roleTitle, setRoleTitle] = useState('');
  const [company, setCompany] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleStart = () => {
    if (mode === 'internship' && selectedApp) {
      const app = applications.find((a) => a.id === selectedApp);
      if (app) {
        onStart(app.internship_title, app.company, app.internship_id);
        return;
      }
    }
    if (mode === 'custom' && roleTitle.trim()) {
      onStart(roleTitle.trim(), company.trim(), '');
    }
  };

  const canStart = mode === 'internship' ? !!selectedApp : !!roleTitle.trim();

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Start interview practice"
        tabIndex={-1}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Start Practice Session</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Choose a role to practise for</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMode('custom')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                mode === 'custom' ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              Custom Role
            </button>
            <button
              onClick={() => setMode('internship')}
              disabled={applications.length === 0}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                mode === 'internship' ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              From Tracker
            </button>
          </div>

          {mode === 'custom' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="role-title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Role Title *
                </label>
                <input
                  id="role-title"
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Software Engineering Intern"
                  className="w-full text-sm rounded-lg border border-border bg-muted/30 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="company" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Company (optional)
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. TechNova Solutions"
                  className="w-full text-sm rounded-lg border border-border bg-muted/30 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          )}

          {mode === 'internship' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Select from Applications Tracker
              </label>
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tracked applications yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {applications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedApp(app.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                        selectedApp === app.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{app.internship_title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{app.company}</p>
                      </div>
                      {selectedApp === app.id && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 flex gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
              AI feedback is generated by a language model and may not always be accurate. Use it as a starting point — always seek guidance from careers advisors or mentors.
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={handleStart} disabled={!canStart} className="flex-1 gap-2">
              <Mic className="w-4 h-4" />
              Start Session
            </Button>
            <Button onClick={onClose} variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </>
  );
}

function SessionCard({ session }: { session: InterviewSession }) {
  const date = new Date(session.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <Link
      href={`/dashboard/interview/${session.id}`}
      className="group flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-accent/20 transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <MessageSquare className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground truncate">{session.role_title || 'Practice Session'}</p>
          {session.company && (
            <span className="text-[11px] text-muted-foreground">@ {session.company}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />{date}
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />{session.total_questions} Q&A
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {session.total_questions > 0 && <ScoreBadge score={Number(session.average_score)} />}
        <Badge
          variant="outline"
          className={`text-[10px] ${session.status === 'completed' ? 'text-green-600 border-green-500/40 dark:text-green-400' : 'text-amber-600 border-amber-500/40 dark:text-amber-400'}`}
        >
          {session.status === 'completed' ? 'Completed' : 'In Progress'}
        </Badge>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}

function PerformanceSummary({ sessions }: { sessions: InterviewSession[] }) {
  const completed = sessions.filter((s) => s.total_questions > 0);
  if (completed.length === 0) return null;

  const totalQA = completed.reduce((s, ses) => s + ses.total_questions, 0);
  const avgScore = completed.reduce((s, ses) => s + Number(ses.average_score), 0) / completed.length;

  const trend = completed.length >= 2
    ? Number(completed[0].average_score) - Number(completed[completed.length - 1].average_score)
    : null;

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Sessions', value: completed.length, icon: Mic },
        { label: 'Total Q&As', value: totalQA, icon: MessageSquare },
        { label: 'Avg Score', value: `${avgScore.toFixed(1)}/10`, icon: BarChart3 },
      ].map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{value}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function InterviewHubPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('internship_title'),
    ]).then(([sessRes, appRes]) => {
      setSessions((sessRes.data as InterviewSession[]) || []);
      setApplications((appRes.data as Application[]) || []);
      setLoading(false);
    });
  }, [user]);

  const handleStartSession = async (roleTitle: string, company: string, internshipId: string) => {
    if (!user) return;
    setStarting(true);
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        role_title: roleTitle,
        company,
        internship_id: internshipId,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error || !data) {
      toast({ title: 'Failed to start session', variant: 'destructive' });
      setStarting(false);
      return;
    }
    router.push(`/dashboard/interview/${data.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary" />
            Interview Practice
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Practise common interview questions and get AI-powered feedback on your answers.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={starting} className="gap-2 flex-shrink-0">
          {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New Session
        </Button>
      </div>

      <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">AI Feedback Disclaimer</p>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1 leading-relaxed">
            Feedback is generated by an AI model and may occasionally be inaccurate, incomplete, or miss important context.
            Treat it as a helpful starting point — not a definitive assessment. For high-stakes preparation, also seek
            guidance from your university careers service or a trusted mentor.
          </p>
        </div>
      </div>

      {!loading && sessions.length > 0 && <PerformanceSummary sessions={sessions} />}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Session History
          </h2>
          {sessions.length > 0 && (
            <span className="text-xs text-muted-foreground">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Mic className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="font-medium text-sm">No sessions yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-5">
                Start your first session to practise interview questions with AI feedback.
              </p>
              <Button onClick={() => setShowModal(true)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Start Practising
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      {showModal && (
        <StartSessionModal
          applications={applications}
          onStart={(roleTitle, company, internshipId) => {
            setShowModal(false);
            handleStartSession(roleTitle, company, internshipId);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
