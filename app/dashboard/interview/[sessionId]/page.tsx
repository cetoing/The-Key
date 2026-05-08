'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { InterviewQAPair, InterviewSession } from '@/lib/types';
import { getSessionQuestions } from '@/lib/interview-questions';
import type { Question } from '@/lib/interview-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  Mic,
  RotateCcw,
  Send,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  X,
} from 'lucide-react';
import { AIExplainabilityPanel } from '@/components/ai/AIExplainabilityPanel';
import { buildInterviewExplainability } from '@/lib/explainability';

const TYPE_LABELS: Record<string, string> = {
  behavioural: 'Behavioural',
  situational: 'Situational',
  motivational: 'Motivational',
  technical: 'Technical',
};

const TYPE_COLORS: Record<string, string> = {
  behavioural: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  situational: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  motivational: 'bg-green-500/10 text-green-600 dark:text-green-400',
  technical: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
};

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 8 ? 'text-green-600 dark:text-green-400' :
    score >= 6 ? 'text-blue-600 dark:text-blue-400' :
    score >= 4 ? 'text-amber-600 dark:text-amber-400' :
    'text-red-600 dark:text-red-400';
  const bg =
    score >= 8 ? 'bg-green-500/10' :
    score >= 6 ? 'bg-blue-500/10' :
    score >= 4 ? 'bg-amber-500/10' :
    'bg-red-500/10';
  const label =
    score >= 8 ? 'Excellent' :
    score >= 6 ? 'Good' :
    score >= 4 ? 'Developing' :
    'Needs Work';

  return (
    <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl ${bg}`}>
      <span className={`text-3xl font-bold ${color}`}>{score}</span>
      <span className="text-[10px] font-semibold text-muted-foreground">/10</span>
      <span className={`text-[10px] font-semibold ${color}`}>{label}</span>
    </div>
  );
}

function FeedbackPanel({ pair, role, company }: { pair: InterviewQAPair; role: string; company: string }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI Feedback</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            pair.ai_score >= 8 ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
            pair.ai_score >= 6 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
            pair.ai_score >= 4 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
            'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>{pair.ai_score}/10</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="flex gap-4 items-start">
            <ScoreRing score={pair.ai_score} />
            <p className="text-sm text-foreground/80 leading-relaxed flex-1">{pair.ai_feedback}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pair.strengths.length > 0 && (
              <div className="rounded-xl bg-green-500/5 border border-green-500/15 p-3 space-y-2">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" />Strengths
                </p>
                <ul className="space-y-1.5">
                  {pair.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {pair.improvements.length > 0 && (
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />To Improve
                </p>
                <ul className="space-y-1.5">
                  {pair.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                      <ArrowRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-muted/40 border border-border p-3">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" />
              AI feedback is a guide only. Verify with careers advisors or mentors before relying on it.
            </p>
          </div>

          <AIExplainabilityPanel
            data={buildInterviewExplainability(role, company, pair.question_type)}
            defaultOpen={false}
          />
        </div>
      )}
    </div>
  );
}

function SessionSummary({ session, pairs }: { session: InterviewSession; pairs: InterviewQAPair[] }) {
  const avgScore = pairs.length > 0
    ? pairs.reduce((s, p) => s + p.ai_score, 0) / pairs.length
    : 0;

  const typeBreakdown = pairs.reduce<Record<string, { count: number; total: number }>>((acc, p) => {
    if (!acc[p.question_type]) acc[p.question_type] = { count: 0, total: 0 };
    acc[p.question_type].count++;
    acc[p.question_type].total += p.ai_score;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground">Session Complete</h3>
            <p className="text-sm text-muted-foreground">{session.role_title}{session.company ? ` at ${session.company}` : ''}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{avgScore.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">avg /10</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Object.entries(typeBreakdown).map(([type, { count, total }]) => (
            <div key={type} className="text-center rounded-xl bg-background/60 border border-border p-2.5">
              <p className="text-xs font-medium text-foreground">{(total / count).toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">{TYPE_LABELS[type] || type}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Link href="/dashboard/interview" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Hub
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function InterviewSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, session: authSession } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pairs, setPairs] = useState<InterviewQAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MIN_ANSWER_LENGTH = 20;

  const loadSession = useCallback(async () => {
    if (!user) return;
    const [sessRes, pairsRes] = await Promise.all([
      supabase.from('interview_sessions').select('*').eq('id', sessionId).eq('user_id', user.id).maybeSingle(),
      supabase.from('interview_qa_pairs').select('*').eq('session_id', sessionId).eq('user_id', user.id).order('order_index'),
    ]);

    if (!sessRes.data) { router.replace('/dashboard/interview'); return; }

    const sess = sessRes.data as InterviewSession;
    const existingPairs = (pairsRes.data as InterviewQAPair[]) || [];

    setSession(sess);
    setPairs(existingPairs);

    if (sess.status === 'completed') {
      setShowSummary(true);
    } else {
      const qs = getSessionQuestions(8);
      setQuestions(qs);
      setCurrentIdx(existingPairs.length);
    }
    setLoading(false);
  }, [sessionId, user, router]);

  useEffect(() => { loadSession(); }, [loadSession]);

  useEffect(() => {
    if (!loading) textareaRef.current?.focus();
  }, [currentIdx, loading]);

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx >= questions.length - 1;
  const hasAnsweredCurrent = pairs.some((p) => p.order_index === currentIdx);

  const submitAnswer = async () => {
    if (!user || !session || !currentQuestion || submitting) return;
    if (answer.trim().length < MIN_ANSWER_LENGTH) {
      toast({ title: 'Please write a longer answer', description: 'Aim for at least a sentence or two.' });
      return;
    }

    setSubmitting(true);

    let feedbackData = { score: 5, feedback: '', strengths: [] as string[], improvements: [] as string[] };

    try {
      if (!authSession?.access_token) {
        toast({ title: 'Sign in required', description: 'Please sign in again to receive AI feedback.', variant: 'destructive' });
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authSession.access_token}`,
        },
        body: JSON.stringify({
          question: currentQuestion.text,
          question_type: currentQuestion.type,
          user_answer: answer,
          role_title: session.role_title,
          company: session.company,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        feedbackData = {
          score: data.score || 5,
          feedback: data.feedback || '',
          strengths: data.strengths || [],
          improvements: data.improvements || [],
        };
      } else {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401) {
          toast({ title: 'AI not configured', description: 'OPENAI_API_KEY is not set. Saving your answer without feedback.', variant: 'destructive' });
        } else {
          toast({ title: 'Feedback unavailable', description: err.error || 'Could not generate feedback. Answer saved.', variant: 'destructive' });
        }
      }
    } catch {
      toast({ title: 'Network error', description: 'Could not reach AI service. Answer saved without feedback.' });
    }

    const newPair: Omit<InterviewQAPair, 'id' | 'created_at'> = {
      session_id: sessionId,
      user_id: user.id,
      question: currentQuestion.text,
      question_type: currentQuestion.type,
      user_answer: answer.trim(),
      ai_feedback: feedbackData.feedback,
      ai_score: feedbackData.score,
      strengths: feedbackData.strengths,
      improvements: feedbackData.improvements,
      order_index: currentIdx,
    };

    const { data: savedPair, error: pairError } = await supabase
      .from('interview_qa_pairs')
      .insert(newPair)
      .select()
      .single();

    if (pairError) {
      toast({ title: 'Failed to save answer', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    const updatedPairs = [...pairs, savedPair as InterviewQAPair];
    setPairs(updatedPairs);

    const newAvg = updatedPairs.reduce((s, p) => s + p.ai_score, 0) / updatedPairs.length;
    const isLast = currentIdx >= questions.length - 1;

    await supabase.from('interview_sessions').update({
      total_questions: updatedPairs.length,
      average_score: newAvg,
      status: isLast ? 'completed' : 'in_progress',
      updated_at: new Date().toISOString(),
    }).eq('id', sessionId);

    setSession((prev) => prev ? { ...prev, total_questions: updatedPairs.length, average_score: newAvg, status: isLast ? 'completed' : 'in_progress' } : prev);
    setAnswer('');

    if (isLast) {
      setShowSummary(true);
    }

    setSubmitting(false);
  };

  const goToNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setAnswer('');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const answeredCount = pairs.length;
  const totalQ = questions.length || session.total_questions || 8;
  const progress = Math.round((answeredCount / totalQ) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/interview">
          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground" aria-label="Back to Interview Hub">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold text-foreground truncate">
            {session.role_title || 'Practice Session'}
            {session.company ? <span className="text-muted-foreground font-normal"> at {session.company}</span> : null}
          </h1>
        </div>
        <Badge variant="outline" className="text-xs flex-shrink-0">
          {answeredCount}/{totalQ} answered
        </Badge>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {showSummary && session ? (
        <SessionSummary session={session} pairs={pairs} />
      ) : null}

      {!showSummary && pairs.map((pair, idx) => (
        <div key={pair.id} className="space-y-3">
          <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[pair.question_type] || 'bg-muted text-muted-foreground'}`}>
                {TYPE_LABELS[pair.question_type] || pair.question_type}
              </span>
              <span className="text-[11px] text-muted-foreground">Q{idx + 1}</span>
            </div>
            <p className="text-sm font-medium text-foreground leading-snug">{pair.question}</p>
            <div className="rounded-lg bg-background border border-border p-3">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1.5">Your answer</p>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{pair.user_answer}</p>
            </div>
          </div>
          {pair.ai_score > 0 && <FeedbackPanel pair={pair} role={session.role_title || ''} company={session.company || ''} />}
        </div>
      ))}

      {!showSummary && currentQuestion && !hasAnsweredCurrent && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[currentQuestion.type] || 'bg-muted text-muted-foreground'}`}>
                {TYPE_LABELS[currentQuestion.type]}
              </span>
              <span className="text-[11px] text-muted-foreground">Q{currentIdx + 1} of {totalQ}</span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug">{currentQuestion.text}</p>
            <p className="text-xs text-muted-foreground italic flex items-start gap-1.5">
              <span className="font-semibold not-italic">Tip:</span>
              {currentQuestion.hint}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="answer" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your Answer
            </label>
            <textarea
              id="answer"
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              placeholder="Type your answer here. Take your time — there's no rush. Aim for 2-4 sentences minimum."
              aria-label="Your answer to the interview question"
              className="w-full text-sm rounded-xl border border-border bg-background/80 px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/40 leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !submitting) {
                  e.preventDefault();
                  submitAnswer();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className={`text-[11px] ${answer.trim().length < MIN_ANSWER_LENGTH ? 'text-muted-foreground' : 'text-green-600 dark:text-green-400'}`}>
                {answer.trim().length} chars {answer.trim().length < MIN_ANSWER_LENGTH ? `(min ${MIN_ANSWER_LENGTH})` : '✓'}
              </span>
              <span className="text-[11px] text-muted-foreground">Ctrl+Enter to submit</span>
            </div>
          </div>

          <Button
            onClick={submitAnswer}
            disabled={submitting || answer.trim().length < MIN_ANSWER_LENGTH}
            className="w-full gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Getting AI feedback...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Answer
              </>
            )}
          </Button>
        </div>
      )}

      {!showSummary && hasAnsweredCurrent && !isLastQuestion && (
        <Button onClick={goToNext} className="w-full gap-2">
          Next Question
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}

      {!showSummary && hasAnsweredCurrent && isLastQuestion && (
        <Button onClick={() => setShowSummary(true)} className="w-full gap-2">
          <BarChart3 className="w-4 h-4" />
          View Session Summary
        </Button>
      )}

      <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 flex gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
          AI feedback is auto-generated and may not always be accurate. Use it alongside advice from careers professionals. There are no right or wrong answers — this is practice.
        </p>
      </div>
    </div>
  );
}
