'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { Profile, CVItem, GeneratedCV } from '@/lib/types';
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

function buildDownloadMarkup(content: string) {
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
      <body style="font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; padding: 32px; color: #111827;">
        ${escaped}
      </body>
    </html>
  `;
}

function downloadCVDocument(content: string, fileLabel: string) {
  const blob = new Blob([buildDownloadMarkup(content)], { type: 'application/msword' });
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
  onRegenerate,
  onAccept,
  onDownload,
  loading,
  saving,
}: {
  content: string;
  onRegenerate: () => void;
  onAccept: () => void;
  onDownload: () => void;
  loading: boolean;
  saving: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-sm font-medium text-foreground">AI Draft - review before accepting</span>
          </div>
          <Badge variant="outline" className="text-xs">Draft</Badge>
        </div>
        <div className="p-6">
          <pre className="whitespace-pre-wrap font-mono text-xs text-foreground/80 leading-relaxed">
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
  const [acceptedCVs, setAcceptedCVs] = useState<GeneratedCV[]>([]);
  const [draftContent, setDraftContent] = useState('');
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
    ]).then(([profileRes, itemsRes, cvsRes]) => {
      setProfile(profileRes as Profile | null);
      setCVItems((itemsRes.data as CVItem[]) || []);
      setAcceptedCVs((cvsRes.data as GeneratedCV[]) || []);
      setLoaded(true);
    });
  }, [user]);

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
        body: JSON.stringify({ profile, cvItems }),
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
    setDraftMetadata(null);
    toast({ title: 'CV saved', description: 'Your AI-generated CV has been saved successfully.' });
  };

  const profileComplete = profile?.full_name && profile?.course && profile?.university;
  const draftFileName = `${(profile?.full_name || 'the-key-cv').trim().replace(/\s+/g, '-').toLowerCase()}-draft`;

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
            The AI will use your profile and {cvItems.length} CV {cvItems.length === 1 ? 'entry' : 'entries'} to create a personalised draft.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            onRegenerate={generate}
            onAccept={accept}
            onDownload={() => downloadCVDocument(draftContent, draftFileName)}
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
                  `${(profile?.full_name || 'the-key-cv').trim().replace(/\s+/g, '-').toLowerCase()}-${new Date(cv.created_at).toISOString().slice(0, 10)}`
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
