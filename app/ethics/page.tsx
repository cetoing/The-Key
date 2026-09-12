import Link from 'next/link';
import {
  Shield,
  AlertTriangle,
  Brain,
  Scale,
  Eye,
  Lock,
  ArrowLeft,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

const CONSENT_VERSION = '1.0';
const LAST_UPDATED = '18 February 2026';

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

export default function EthicsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Scale className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Ethics & Transparency</h1>
              <p className="text-muted-foreground mt-2 leading-relaxed max-w-2xl">
                How The Key uses your data, what AI can and cannot do, and your rights as a
                user of The Key.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
              <FileText className="w-3 h-3" />Policy version {CONSENT_VERSION}
            </span>
            <span className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
              <Eye className="w-3 h-3" />Last updated {LAST_UPDATED}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-border/70 bg-muted/30 px-5 py-4 text-sm text-muted-foreground leading-relaxed">
            This page explains our approach to AI and data. For our formal legal policies, see our{' '}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            {' '}and{' '}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>.
          </div>
        </div>

        <nav className="rounded-2xl border border-border bg-card p-5 mb-8" aria-label="Page sections">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">On this page</p>
          <ol className="space-y-1.5">
            {[
              { id: 'overview', label: 'Overview & Purpose' },
              { id: 'data-usage', label: 'What Data We Collect' },
              { id: 'ai-limitations', label: 'AI Limitations & Accuracy' },
              { id: 'bias-risks', label: 'Bias Risks' },
              { id: 'consent', label: 'Consent & Your Rights' },
              { id: 'data-storage', label: 'Data Storage & Security' },
              { id: 'contact', label: 'Contact & Complaints' },
            ].map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                >
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10">
          <section id="overview" aria-labelledby="overview-heading">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h2 id="overview-heading" className="text-xl font-bold text-foreground">Overview & Purpose</h2>
            </div>
            <div className="prose-custom space-y-3 text-sm text-foreground/80 leading-relaxed">
              <p>
                <strong className="text-foreground">The Key</strong> is an AI-powered career support platform
                designed to help neurodiverse students and those with accessibility needs in UK higher education
                find internships, build CVs, and practise interviews.
              </p>
              <p>
                No data is sold, shared with third parties for commercial use,
                or used for advertising.
              </p>
              <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-4">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">What this platform does</p>
                <ul className="space-y-1.5">
                  {[
                    'Helps you practise CV writing with AI-generated suggestions',
                    'Matches your skills to internship listings',
                    'Provides AI-powered interview practice with feedback',
                    'Tracks your internship applications in one place',
                    'Collects anonymised usage data to improve the platform (you can opt out)',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-blue-800/80 dark:text-blue-200/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <hr className="border-border" />

          <section id="data-usage" aria-labelledby="data-usage-heading">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 id="data-usage-heading" className="text-xl font-bold text-foreground">What Data We Collect</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-foreground/80 leading-relaxed">
                The following table summarises all data categories collected, why each is needed, and how long it is retained.
              </p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Purpose</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Retention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { category: 'Email address', purpose: 'Account authentication only', retention: 'Until account deletion' },
                      { category: 'Profile (name, course, university, skills, bio)', purpose: 'Personalise internship matching and CV generation', retention: 'Until account deletion' },
                      { category: 'CV content and generated CVs', purpose: 'CV Builder feature and AI generation', retention: 'Until account deletion' },
                      { category: 'Internship applications', purpose: 'Application tracking feature', retention: 'Until account deletion' },
                      { category: 'Interview session answers', purpose: 'Interview practice feature; anonymised patterns may inform research findings', retention: 'Until account deletion' },
                      { category: 'Accessibility preferences', purpose: 'Personalise interface rendering', retention: 'Until account deletion' },
                      { category: 'Research consent record', purpose: 'Audit trail of your consent decision — required by research ethics guidelines', retention: 'Preserved in de-identified form after account deletion' },
                    ].map(({ category, purpose, retention }) => (
                      <tr key={category} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{category}</td>
                        <td className="px-4 py-3 text-muted-foreground">{purpose}</td>
                        <td className="px-4 py-3 text-muted-foreground">{retention}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl bg-muted/40 border border-border p-4">
                <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />What we do NOT do
                </p>
                <ul className="space-y-1.5">
                  {[
                    'We do not sell your data to any third party',
                    'We do not share identifiable data with employers or recruiters',
                    'We do not use your data to train AI models',
                    'We do not store OpenAI API responses beyond what you see on screen',
                    'We do not track you across other websites',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <hr className="border-border" />

          <section id="ai-limitations" aria-labelledby="ai-heading">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 id="ai-heading" className="text-xl font-bold text-foreground">AI Limitations & Accuracy</h2>
            </div>
            <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
              <p>
                The Key uses <strong className="text-foreground">OpenAI&apos;s GPT-4o-mini</strong> model to generate
                CV content and interview feedback. AI language models have well-documented limitations that you
                should understand before relying on their output.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: 'Hallucination',
                    desc: 'AI models can generate confident-sounding content that is factually incorrect. Always verify specific claims, dates, statistics, or advice against authoritative sources.',
                  },
                  {
                    title: 'Inconsistency',
                    desc: 'The same input may produce different outputs on different runs. AI feedback scores and suggestions are not deterministic.',
                  },
                  {
                    title: 'Context blindness',
                    desc: 'The AI does not know your full context, the specific employer\'s expectations, or the current job market. Feedback is generic, not tailored.',
                  },
                  {
                    title: 'Over-confidence',
                    desc: 'AI feedback may sound authoritative even when uncertain. Treat all AI output as a starting point for reflection, not a definitive assessment.',
                  },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />{title}
                    </p>
                    <p className="text-xs text-foreground/70 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-4">
                <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />Our recommendation
                </p>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  Use AI output as a <strong>first draft or discussion starter</strong>, not a final product.
                  Always review AI-generated CVs and interview feedback with a careers advisor, trusted
                  mentor, or your university careers service before making important decisions.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-border" />

          <section id="bias-risks" aria-labelledby="bias-heading">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Scale className="w-5 h-5 text-red-500 dark:text-red-400" />
              </div>
              <h2 id="bias-heading" className="text-xl font-bold text-foreground">Bias Risks</h2>
            </div>
            <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
              <p>
                AI language models are trained on large datasets of human-generated text that reflect historical
                societal biases. These biases can surface in subtle, unintentional ways.
              </p>
              <div className="space-y-3">
                {[
                  {
                    heading: 'Language and communication style',
                    body: 'AI may favour formal, Standard English writing styles that could disadvantage users for whom English is an additional language, or those who communicate differently due to neurodiversity.',
                  },
                  {
                    heading: 'Gender and name bias',
                    body: 'Research shows AI models can subtly score or phrase content differently based on perceived gender. We do not ask for gender, but it may be inferred from names or pronouns in your profile.',
                  },
                  {
                    heading: 'Institutional prestige bias',
                    body: 'AI trained on professional content may implicitly favour candidates from well-known universities or employers. Feedback may not reflect the value of non-traditional career paths.',
                  },
                  {
                    heading: 'Neurodiversity and communication differences',
                    body: 'Structured, linear answers tend to score higher with AI. Users who communicate in a less linear way — which can be a strength in the right context — may receive lower scores that do not reflect their actual ability.',
                  },
                  {
                    heading: 'Interview question selection bias',
                    body: 'The question bank included in this platform reflects common UK internship interview formats. It may not represent all industries, cultures, or types of roles equally.',
                  },
                ].map(({ heading, body }) => (
                  <div key={heading} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm font-semibold text-foreground mb-1.5">{heading}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
                <p className="text-xs font-medium text-red-700 dark:text-red-300 leading-relaxed">
                  If you believe AI feedback you have received reflects bias rather than the quality of your answer,
                  please disregard it and seek human feedback instead. You are encouraged to note this in the
                  optional research survey.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-border" />

          <section id="consent" aria-labelledby="consent-heading">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 id="consent-heading" className="text-xl font-bold text-foreground">Consent & Your Rights</h2>
            </div>
            <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
              <p>
                Use of The Key is entirely voluntary. Creating an account implies acceptance
                of our Terms of Service. Analytics consent is a separate decision you can make independently
                and can be changed at any time from Settings &gt; Data &amp; Privacy.
              </p>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b border-border">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your rights under UK GDPR</p>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { right: 'Right to access', detail: 'You can export all your data at any time from the Data & Privacy page.' },
                    { right: 'Right to erasure', detail: 'You can request account deletion from the Data & Privacy page. This removes stored personal data and de-identifies the remaining consent audit record.' },
                    { right: 'Right to withdraw consent', detail: 'You can withdraw research consent at any time without consequence. This does not affect your use of the platform.' },
                    { right: 'Right to data portability', detail: 'Your data export is provided in JSON format, which can be opened with any text editor or imported into other tools.' },
                    { right: 'Right to rectification', detail: 'You can edit your profile, CV items, and other data at any time through the dashboard.' },
                  ].map(({ right, detail }) => (
                    <div key={right} className="px-4 py-3 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{right}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/dashboard/data"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Manage your data and consent
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </section>

          <hr className="border-border" />

          <section id="data-storage" aria-labelledby="storage-heading">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 id="storage-heading" className="text-xl font-bold text-foreground">Data Storage & Security</h2>
            </div>
            <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
              <p>
                All data is stored in <strong className="text-foreground">Supabase</strong>, a GDPR-compliant,
                EU-hosted PostgreSQL database service. Row Level Security (RLS) is enabled on every table,
                meaning the database enforces that each user can only access their own data — even if there
                were a bug in the application layer.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Lock, label: 'Encrypted at rest', sub: 'AES-256 encryption' },
                  { icon: Shield, label: 'Encrypted in transit', sub: 'TLS 1.2+' },
                  { icon: Eye, label: 'Row Level Security', sub: 'Per-user isolation' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                AI requests are sent to OpenAI&apos;s API over HTTPS. We do not log request payloads beyond what
                appears in your session. OpenAI&apos;s data retention policies apply to API calls;
                see <span className="font-medium text-foreground">openai.com/privacy</span> for details.
              </p>
            </div>
          </section>

          <hr className="border-border" />

          <section id="contact" aria-labelledby="contact-heading">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 id="contact-heading" className="text-xl font-bold text-foreground">Contact & Complaints</h2>
            </div>
            <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
              <p>
                If you have questions about this ethics statement, want to make a complaint about data handling,
                or wish to exercise any of your rights, please contact the researcher through your university&apos;s
                student portal or academic supervisor.
              </p>
              <p>
                If you believe your data has been mishandled and cannot resolve this with the researcher, you have the
                right to lodge a complaint with the <strong className="text-foreground">Information Commissioner&apos;s Office (ICO)</strong>{' '}
                at <span className="font-medium text-foreground">ico.org.uk</span>.
              </p>
            </div>
          </section>
        </div>

        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            The Key — Dissertation Research Prototype · Ethics Policy v{CONSENT_VERSION} · {LAST_UPDATED}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Conducted in accordance with UK university research ethics guidelines and UK GDPR.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/dashboard/data" className="text-xs text-primary hover:underline">Manage Data & Consent</Link>
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
