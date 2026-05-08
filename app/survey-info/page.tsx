'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ClipboardList,
  Clock,
  Shield,
  BarChart2,
  Users,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';

const SURVEY_URL = 'https://forms.google.com/your-survey-id';

const benefits = [
  'Help shape an accessible career platform for future students',
  'Contribute to academic research on neurodiverse learner support',
  'Improve AI-powered CV generation for underrepresented students',
  'Support development of inclusive internship matching systems',
];

const faqs = [
  {
    q: 'Who is this survey for?',
    a: 'UK university students who are interested in internships and career development tools, especially those who identify as neurodiverse or have accessibility needs.',
  },
  {
    q: 'How will my data be used?',
    a: 'Your anonymised responses will be used solely for academic dissertation research at a UK university. No personal identifying information is shared or published.',
  },
  {
    q: 'Is participation mandatory?',
    a: 'No. Participation is entirely voluntary. You can withdraw at any time without consequence.',
  },
  {
    q: 'How long does it take?',
    a: 'Approximately 5–10 minutes. The survey covers usability, accessibility needs, and your experience using career platforms.',
  },
];

export default function SurveyInfoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16 space-y-10">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Research Survey</h1>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                Help shape the future of accessible career technology for university students.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Clock, label: '5–10 minutes', sub: 'to complete' },
            { icon: Shield, label: 'Anonymous', sub: 'responses' },
            { icon: GraduationCap, label: 'Academic', sub: 'research' },
            { icon: Users, label: 'Students', sub: 'focus group' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl text-center">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">About This Research</h2>
            <p className="text-muted-foreground leading-relaxed">
              This survey is part of a university dissertation investigating how AI-powered career platforms
              can better support neurodiverse students and those with accessibility needs in the UK higher
              education system. The Key prototype was built specifically to explore this question.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              Your Participation Helps
            </h3>
            <ul className="space-y-2.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href={SURVEY_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Take the Survey
              </a>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Opens in a new tab. Google Forms — no account required.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <Card key={q}>
                <CardContent className="pt-4 pb-4">
                  <p className="font-semibold text-sm text-foreground mb-2">{q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground border-t border-border pt-8">
          <p>
            This research is conducted in accordance with university ethical guidelines.
            For questions, contact the researcher via your institution&apos;s student portal.
          </p>
          <p className="mt-1">The Key — Dissertation Prototype · {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
