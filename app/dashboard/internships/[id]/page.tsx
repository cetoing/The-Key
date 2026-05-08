'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { Application, InternshipWithMatch } from '@/lib/types';
import { fetchProfile } from '@/lib/profiles';
import { computeMatch, buildSkillGapPlan } from '@/lib/matching';
import type { SkillGapAction } from '@/lib/matching';
import internshipsData from '@/data/internships.json';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Briefcase,
  MapPin,
  Clock,
  Banknote,
  Heart,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  TrendingUp,
  Building2,
  Globe,
  Plus,
  ListChecks,
  Loader2,
  Send,
  FileCheck,
  ExternalLink,
} from 'lucide-react';

function MatchBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-muted-foreground/40';
  return (
    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function DifficultyBadge({ level }: { level: SkillGapAction['difficulty'] }) {
  const styles = {
    beginner: 'bg-green-500/10 text-green-700 dark:text-green-400',
    intermediate: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    advanced: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${styles[level]}`}>
      {level}
    </span>
  );
}

function SkeletonDetail() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-1/3" />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="h-7 bg-muted rounded w-2/3" />
          <div className="h-5 bg-muted rounded w-1/2" />
          <div className="flex gap-3">
            <div className="h-5 w-24 bg-muted rounded-full" />
            <div className="h-5 w-20 bg-muted rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InternshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [careerInterests, setCareerInterests] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [tracked, setTracked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [showApplyAssist, setShowApplyAssist] = useState(false);
  const [applying, setApplying] = useState(false);

  const internship = (internshipsData as InternshipWithMatch[]).find((i) => i.id === id);

  useEffect(() => {
    if (!user || !internship) return;
    Promise.all([
      fetchProfile(user.id),
      supabase.from('wishlist').select('id').eq('user_id', user.id).eq('internship_id', id).maybeSingle(),
      supabase.from('applications').select('id').eq('user_id', user.id).eq('internship_id', id).maybeSingle(),
    ]).then(([profileRes, wishlistRes, appRes]) => {
      const profile = profileRes as Record<string, unknown> | null;
      setUserSkills((profile?.skills as string[] | undefined) || []);
      setCareerInterests((profile?.career_interests as string[] | undefined) || []);
      setSaved(!!wishlistRes.data);
      setTracked(!!appRes.data);
    }).finally(() => setLoaded(true));
  }, [user, id, internship]);

  if (!internship) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Internship not found</h1>
        <p className="text-muted-foreground text-sm mb-6">This role may have been removed or the link is incorrect.</p>
        <Link href="/dashboard/internships">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Internships
          </Button>
        </Link>
      </div>
    );
  }

  if (!loaded) return <SkeletonDetail />;

  const { pct, matchedSkills, missingSkills, bonusPoints } = computeMatch(userSkills, careerInterests, internship);
  const plan = buildSkillGapPlan(missingSkills, 5);

  const matchColor =
    pct >= 70 ? 'text-green-700 dark:text-green-400' :
    pct >= 40 ? 'text-amber-700 dark:text-amber-400' :
    'text-muted-foreground';

  const toggleWishlist = async () => {
    if (!user) return;
    setSaving(true);
    if (saved) {
      const { error } = await supabase.from('wishlist').delete().eq('user_id', user.id).eq('internship_id', id);
      if (!error) { setSaved(false); toast({ title: 'Removed from wishlist' }); }
    } else {
      const { error } = await supabase.from('wishlist').insert({
        user_id: user.id,
        internship_id: internship.id,
        internship_title: internship.title,
        company: internship.company,
        match_percentage: pct,
        notes: '',
      });
      if (!error) { setSaved(true); toast({ title: 'Saved to wishlist', description: `${internship.title} added.` }); }
    }
    setSaving(false);
  };

  const addToTracker = async () => {
    if (!user || tracked) return;
    setTracking(true);
    const { error } = await supabase.from('applications').insert({
      user_id: user.id,
      internship_id: internship.id,
      internship_title: internship.title,
      company: internship.company,
      status: 'Saved',
      match_percentage: pct,
      notes: '',
    });
    if (!error) {
      setTracked(true);
      toast({ title: 'Added to tracker', description: 'View it in Applications Tracker.' });
    } else {
      toast({ title: 'Failed to add', variant: 'destructive' });
    }
    setTracking(false);
  };

  const applyNow = async () => {
    if (!user) return;
    setApplying(true);

    const guidedNotes = [
      `Application prepared for ${internship.title} at ${internship.company}.`,
      matchedSkills.length > 0 ? `Strengths highlighted: ${matchedSkills.slice(0, 3).join(', ')}.` : null,
      missingSkills.length > 0 ? `Growth areas to mention honestly: ${missingSkills.slice(0, 2).join(', ')}.` : null,
      'Prototype note: final published version will support guided external application submission.',
    ].filter(Boolean).join(' ');

    const payload = {
      user_id: user.id,
      internship_id: internship.id,
      internship_title: internship.title,
      company: internship.company,
      status: 'Applied' as const,
      match_percentage: pct,
      notes: guidedNotes,
      updated_at: new Date().toISOString(),
    };

    const { error } = tracked
      ? await supabase
          .from('applications')
          .update({
            status: 'Applied',
            notes: guidedNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('internship_id', internship.id)
      : await supabase.from('applications').insert(payload);

    if (error) {
      toast({
        title: 'Application preview failed',
        description: error.message,
        variant: 'destructive',
      });
      setApplying(false);
      return;
    }

    setTracked(true);
    setShowApplyAssist(false);
    setApplying(false);
    toast({
      title: 'Application marked as submitted',
      description: 'This role now appears in your Applications board as Applied.',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-muted-foreground">Back to Internships</span>
      </div>

      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-foreground leading-snug">{internship.title}</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">{internship.company}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button
                onClick={toggleWishlist}
                disabled={saving}
                variant={saved ? 'outline' : 'default'}
                size="sm"
                className="gap-2"
              >
                <Heart className={`w-4 h-4 ${saved ? 'fill-current text-red-500' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </Button>
              <Button
                onClick={addToTracker}
                disabled={tracking || tracked}
                variant="outline"
                size="sm"
                className={`gap-2 ${tracked ? 'text-green-600 border-green-500/40 dark:text-green-400' : ''}`}
              >
                {tracking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : tracked ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {tracked ? 'Tracked' : 'Add to Tracker'}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />{internship.location}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />{internship.duration}
            </span>
            {internship.salary && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Banknote className="w-4 h-4" />{internship.salary}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />{internship.type}
            </span>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed">{internship.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Your Match Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-3xl font-bold ${matchColor}`}>{pct}%</span>
            <span className="text-sm text-muted-foreground">
              {matchedSkills.length} of {internship.skills_required.length} required skills
            </span>
          </div>
          <MatchBar pct={pct} />

          {bonusPoints.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {bonusPoints.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />{b}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {matchedSkills.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  Skills You Have
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.map((s) => (
                    <Badge key={s} className="text-[10px] bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {missingSkills.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  Skills to Develop
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Required Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {internship.skills_required.map((skill) => {
              const isMatched = matchedSkills.some(
                (m) => m.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(m.toLowerCase()),
              );
              return (
                <Badge
                  key={skill}
                  variant={isMatched ? 'default' : 'outline'}
                  className={`text-xs py-1 px-3 ${isMatched ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20' : ''}`}
                >
                  {isMatched && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {skill}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {plan.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Your Skill Gap Plan
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Actionable steps to close the gap between your current skills and this role&apos;s requirements.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.map((action, idx) => (
              <div key={action.skill} className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-sm">{action.skill}</span>
                  </div>
                  <DifficultyBadge level={action.difficulty} />
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed pl-9">{action.suggestion}</p>
                <div className="flex flex-wrap gap-2 pl-9">
                  {action.resources.map((r) => (
                    <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showApplyAssist && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              Guided Application Preview
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              This demo shows how The Key will support students through an application. It prepares the role in your tracker as applied and highlights what to focus on.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-background/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Step 1</p>
                <p className="text-sm font-medium">Review match explanation</p>
                <p className="text-xs text-muted-foreground mt-1">Use the score, matched skills, and skill-gap plan before applying.</p>
              </div>
              <div className="rounded-xl border border-border bg-background/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Step 2</p>
                <p className="text-sm font-medium">Tailor your CV</p>
                <p className="text-xs text-muted-foreground mt-1">Bring forward {matchedSkills.slice(0, 2).join(' and ') || 'your strongest relevant skills'} for this role.</p>
              </div>
              <div className="rounded-xl border border-border bg-background/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Step 3</p>
                <p className="text-sm font-medium">Track the submission</p>
                <p className="text-xs text-muted-foreground mt-1">Mark the role as applied so reminders and interview prep can follow.</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/80 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Application readiness summary</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You currently match {matchedSkills.length} required skills for this role. The strongest points to highlight are{' '}
                    <span className="font-medium text-foreground">
                      {matchedSkills.slice(0, 3).join(', ') || 'your transferable strengths'}
                    </span>.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Publish-ready direction</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The published version will open the employer application link or a partner form. For the demo, The Key records this as an applied internship and stores guidance notes in your tracker.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={applyNow} disabled={applying} className="gap-2 sm:flex-1">
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Mark as Applied
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowApplyAssist(false)}
                className="sm:flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pb-6">
        <Button
          onClick={() => setShowApplyAssist((prev) => !prev)}
          variant={showApplyAssist ? 'outline' : 'default'}
          className="gap-2 sm:flex-1"
        >
          <Send className="w-4 h-4" />
          {showApplyAssist ? 'Hide Apply Preview' : 'Apply with The Key'}
        </Button>
        <Button
          onClick={addToTracker}
          disabled={tracking || tracked}
          variant={tracked ? 'outline' : 'default'}
          className={`gap-2 sm:flex-1 ${tracked ? 'text-green-600 border-green-500/40 dark:text-green-400' : ''}`}
        >
          {tracking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : tracked ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <ListChecks className="w-4 h-4" />
          )}
          {tracked ? 'Added to Tracker' : 'Add to Applications Tracker'}
        </Button>
        <Button onClick={toggleWishlist} disabled={saving} variant={saved ? 'outline' : 'outline'} className="gap-2 sm:flex-1">
          <Heart className={`w-4 h-4 ${saved ? 'fill-current text-red-500' : ''}`} />
          {saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
        </Button>
        <Link href="/dashboard/internships" className="sm:flex-none">
          <Button variant="ghost" className="w-full gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>
    </div>
  );
}
