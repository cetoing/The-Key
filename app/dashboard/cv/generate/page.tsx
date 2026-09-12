'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { Profile, CVItem, GeneratedCV, Application } from '@/lib/types';
import { fetchProfile } from '@/lib/profiles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Download,
  Info,
  User,
  GraduationCap,
  Zap,
} from 'lucide-react';
import { AIExplainabilityPanel } from '@/components/ai/AIExplainabilityPanel';
import { buildCVExplainability } from '@/lib/explainability';
import internshipsData from '@/data/internships.json';
import type { Internship } from '@/lib/types';

interface CVDesign {
  template: string;
  fontFamily: string;
  accentColor: string;
  secondaryColor: string;
  layout: string;
  rationale: string;
}

const defaultDesign: CVDesign = {
  template: 'balanced-professional',
  fontFamily: 'Aptos, Calibri, Arial, sans-serif',
  accentColor: '#c2410c',
  secondaryColor: '#fff7ed',
  layout: 'Balanced one-page CV with clear summary, education, experience, skills, and achievements.',
  rationale: 'A balanced layout is suitable when no specific application is selected.',
};

const internships = internshipsData as Internship[];

function getApplicationTarget(application?: Application) {
  if (!application) return undefined;

  const internship = internships.find((item) => item.id === application.internship_id);

  return {
    role_title: application.internship_title,
    company: application.company,
    category: internship?.type || '',
    location: internship?.location || '',
    required_skills: internship?.skills_required || [],
    description: internship?.description || application.notes || '',
  };
}

function getSafeFileLabel(value: string) {
  return value.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'the-key-cv';
}

function buildDownloadMarkup(content: string, design: CVDesign = defaultDesign) {
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>The Key CV</title>
      </head>
      <body style="font-family: ${design.fontFamily}; font-size: 11.5pt; line-height: 1.5; padding: 32px; color: #111827;">
        <div style="border-top: 8px solid ${design.accentColor}; background: ${design.secondaryColor}; padding: 18px 22px; margin-bottom: 22px;">
          <div style="font-size: 10pt; letter-spacing: 1px; text-transform: uppercase; color: ${design.accentColor}; font-weight: 700;">${design.template}</div>
          <div style="font-size: 10pt; color: #374151; margin-top: 4px;">${design.layout}</div>
        </div>
        <div style="white-space: pre-wrap;">${escaped}</div>
      </body>
    </html>
  `;
}

function downloadCVDocument(content: string, fileLabel: string, design: CVDesign = defaultDesign) {
  const blob = new Blob([buildDownloadMarkup(content, design)], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileLabel}.doc`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function GeneratedCVDisplay({
  content,
  design,
  onRegenerate,
  onAccept,
  onDownload,
  loading,
  saving,
}: {
  content: string;
  design: CVDesign;
  onRegenerate: () => void;
  onAccept: () => void;
  onDownload: () => void;
  loading: boolean;
  saving: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div
          className="flex flex-col gap-3 px-5 py-4 border-b border-border sm:flex-row sm:items-center sm:justify-between"
          style={{ backgroundColor: design.secondaryColor }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: design.accentColor }} />
            <div>
              <span className="text-sm font-medium text-foreground">Application-specific AI draft</span>
              <p className="text-xs text-muted-foreground">{design.layout}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-background/80">{design.template}</Badge>
        </div>
        <div className="p-6" style={{ fontFamily: design.fontFamily }}>
          <pre className="whitespace-pre-wrap text-sm text-foreground/85 leading-relaxed">
            {content}
          </pre>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onRegenerate}
          variant="outline"
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          {loading
            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            : <RefreshCw className="w-4 h-4 mr-2" />
          }
          Regenerate
        </Button>
        <Button
          onClick={onDownload}
          variant="outline"
          className="flex-1 sm:flex-none"
        >
          <Download className="w-4 h-4 mr-2" />
          Download CV
        </Button>
        <Button
          onClick={onAccept}
          disabled={saving}
          className="flex-1 sm:flex-none"
        >
          {saving
            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            : <CheckCircle2 className="w-4 h-4 mr-2" />
          }
          Accept & Save
        </Button>
      </div>
    </div>
  );
}

function AcceptedCVCard({ cv, onDownload }: { cv: GeneratedCV; onDownload: () => void }) {
  return (
    <Card className="border-green-500/20 bg-green-50/30 dark:bg-green-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Accepted CV
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {new Date(cv.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap font-mono text-xs text-foreground/70 leading-relaxed max-h-64 overflow-y-auto">
          {cv.content}
        </pre>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download CV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AICVGeneratorPage() {
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [cvItems, setCVItems] = useState<CVItem[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [acceptedCVs, setAcceptedCVs] = useState<GeneratedCV[]>([]);
  const [draftContent, setDraftContent] = useState('');
  const [draftDesign, setDraftDesign] = useState<CVDesign>(defaultDesign);
  const [draftMetadata, setDraftMetadata] = useState<{ promptUsed: string; modelUsed: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchProfile(user.id),
      supabase.from('cv_items').select('*').eq('user_id', user.id).order('order_index'),
      supabase.from('generated_cvs').select('*').eq('user_id', user.id).eq('status', 'accepted').order('created_at', { ascending: false }),
      supabase.from('applications').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
    ]).then(([profileRes, itemsRes, cvsRes, appsRes]) => {
      setProfile(profileRes as Profile | null);
      setCVItems((itemsRes.data as CVItem[]) || []);
      setAcceptedCVs((cvsRes.data as GeneratedCV[]) || []);
      setApplications((appsRes.data as Application[]) || []);
      setLoaded(true);
    });
  }, [user]);

  const selectedApplication = applications.find((app) => app.id === selectedApplicationId);
  const selectedTargetApplication = getApplicationTarget(selectedApplication);

  const generate = async () => {
    if (!profile?.full_name) {
      toast({
        title: 'Profile incomplete',
        description: 'Please complete your profile first before generating a CV.',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    setDraftContent('');

    try {
      if (!session?.access_token) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in again before generating a CV.',
          variant: 'destructive',
        });
        return;
      }

      const res = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          profile,
          cvItems,
          targetApplication: selectedTargetApplication,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'Generation failed',
          description: data.error || 'Failed to generate CV. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setDraftContent(data.content);
      setDraftDesign(data.design || defaultDesign);
      setDraftMetadata({
        promptUsed: data.prompt_used,
        modelUsed: data.model_used,
      });

      await supabase.from('generated_cvs').insert({
        user_id: user!.id,
        content: data.content,
        status: 'draft',
        prompt_used: data.prompt_used,
        model_used: data.model_used,
      });
    } catch {
      toast({
        title: 'Network error',
        description: 'Could not connect to the AI service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const accept = async () => {
    if (!user || !draftContent) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('generated_cvs')
      .insert({
        user_id: user.id,
        content: draftContent,
        status: 'accepted',
        prompt_used: draftMetadata?.promptUsed || '',
        model_used: draftMetadata?.modelUsed || 'gpt-4o-mini',
      })
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast({ title: 'Failed to save', description: error.message, variant: 'destructive' });
      return;
    }
    setAcceptedCVs((prev) => [data as GeneratedCV, ...prev]);
    setDraftContent('');
    setDraftDesign(defaultDesign);
    setDraftMetadata(null);
    toast({ title: 'CV saved', description: 'Your AI-generated CV has been saved successfully.' });
  };

  const profileComplete = profile?.full_name && profile?.course && profile?.university;
  const draftFileName = `${getSafeFileLabel(profile?.full_name || 'the-key-cv')}-draft`;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI CV Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Our AI will use your profile and CV entries to generate a tailored, professional CV draft.
        </p>
      </div>

      {!profileComplete && (
        <Card className="border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20">
          <CardContent className="pt-4 pb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Profile Incomplete</p>
              <p className="text-xs text-muted-foreground mt-1">
                For the best results, complete your profile with your name, course, university, and skills before generating.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generate Your CV</CardTitle>
          <CardDescription>
            The AI will use your profile, {cvItems.length} CV {cvItems.length === 1 ? 'entry' : 'entries'}, and the selected application to create a personalised draft.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="target-application" className="text-sm font-medium text-foreground">
              Target application
            </label>
            <select
              id="target-application"
              value={selectedApplicationId}
              onChange={(event) => setSelectedApplicationId(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">General internship CV</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.internship_title} at {application.company}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Selecting an application changes the writing focus, section order, colour accent, and document style.
            </p>
            {selectedTargetApplication && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  Tailoring for {selectedTargetApplication.role_title} at {selectedTargetApplication.company}
                </p>
                <p className="mt-1">
                  Sector: {selectedTargetApplication.category || 'General'} · Location: {selectedTargetApplication.location || 'Not specified'}
                </p>
                {selectedTargetApplication.required_skills.length > 0 && (
                  <p className="mt-1">
                    Required skills: {selectedTargetApplication.required_skills.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Name', value: profile?.full_name || '-', icon: User },
              { label: 'Course', value: profile?.course || '-', icon: GraduationCap },
              { label: 'Skills', value: `${profile?.skills?.length || 0} added`, icon: Zap },
              { label: 'CV Entries', value: `${cvItems.length} added`, icon: FileText },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="mb-1 flex justify-center">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs font-semibold text-foreground truncate">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This feature uses OpenAI GPT-4o Mini. Ensure your <code className="bg-muted px-1 rounded text-[10px]">OPENAI_API_KEY</code> is configured.
              The generated CV is a draft - always review and edit before submitting to employers.
            </p>
          </div>

          <Button onClick={generate} disabled={generating} className="w-full sm:w-auto">
            {generating
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating CV...</>
              : <><Sparkles className="w-4 h-4 mr-2" />Generate CV with AI</>
            }
          </Button>
        </CardContent>
      </Card>

      <AIExplainabilityPanel
        data={buildCVExplainability(profile, cvItems)}
        defaultOpen={false}
      />

      {draftContent && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            AI Draft
          </h2>
          <GeneratedCVDisplay
            content={draftContent}
            design={draftDesign}
            onRegenerate={generate}
            onAccept={accept}
            onDownload={() => downloadCVDocument(draftContent, draftFileName, draftDesign)}
            loading={generating}
            saving={saving}
          />
        </div>
      )}

      {acceptedCVs.length > 0 && (
        <div>
          <Separator className="my-2" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 mt-4">
            Saved CVs ({acceptedCVs.length})
          </h2>
          <div className="space-y-4">
            {acceptedCVs.map((cv) => (
              <AcceptedCVCard
                key={cv.id}
                cv={cv}
                onDownload={() => downloadCVDocument(
                  cv.content,
                  `${getSafeFileLabel(profile?.full_name || 'the-key-cv')}-${new Date(cv.created_at).toISOString().slice(0, 10)}`,
                  defaultDesign
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
