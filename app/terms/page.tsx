import Link from 'next/link';
import { Scale, ArrowLeft, FileText, Eye } from 'lucide-react';

const LAST_UPDATED = '18 May 2026';
const EFFECTIVE_DATE = '18 May 2026';

export const metadata = {
  title: 'Terms of Service — The Key',
  description: 'Terms of Service for The Key platform.',
};

export default function TermsPage() {
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
              <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-muted-foreground mt-2 leading-relaxed max-w-2xl">
                Please read these terms carefully before using The Key. By creating an account you agree to be bound by them.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-8">
            <span className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
              <FileText className="w-3 h-3" />Effective {EFFECTIVE_DATE}
            </span>
            <span className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
              <Eye className="w-3 h-3" />Last updated {LAST_UPDATED}
            </span>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/30 px-5 py-4 text-sm text-muted-foreground mb-8 leading-relaxed">
            For our formal privacy and data protection policies, see our{' '}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            For how we approach AI and data ethics, see our{' '}
            <Link href="/ethics" className="text-primary hover:underline">Ethics & Transparency</Link> page.
          </div>
        </div>

        <div className="space-y-10 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. About The Key</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                The Key is an AI-assisted internship and career support platform for UK university students,
                operated by <strong className="text-foreground">[Your Legal Name / Trading Name]</strong>,
                based in the United Kingdom.
              </p>
              <p>
                Contact: <a href="mailto:support@[yourdomain]" className="text-primary hover:underline">support@[yourdomain]</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                You must be at least 18 years old to use The Key independently, or at least 13 years old
                with the consent of a parent or guardian. You should be a current or prospective UK university student.
              </p>
              <p>
                By creating an account you confirm that you meet these requirements and that the information
                you provide is accurate.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. What The Key Provides</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>The Key offers the following features:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>AI-assisted CV drafting based on your profile and experience</li>
                <li>A curated internship listings browser with transparent skill matching</li>
                <li>AI-generated interview practice feedback</li>
                <li>Application tracking and notes tools</li>
                <li>Accessibility settings including neurodiverse support modes</li>
              </ul>
              <p>
                Internship listings are sourced from a curated dataset. We do not guarantee that listings
                are current, accurate, or that applications will be successful.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. AI Limitations Disclaimer</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                CV content and interview feedback are generated by AI models (currently OpenAI GPT-4o mini)
                and <strong className="text-foreground">may contain errors, omissions, or inaccuracies</strong>.
              </p>
              <p>
                The Key does not provide professional careers advice. AI-generated output should be reviewed
                critically before use in real applications. We do not guarantee that using AI-generated content
                will improve your job prospects.
              </p>
              <p>
                Our matching system uses a transparent rule-based algorithm to compare your skills against
                internship requirements. Match scores are indicative and not a guarantee of suitability.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Use automated tools to scrape or extract content from The Key</li>
                <li>Attempt to circumvent rate limits or usage quotas</li>
                <li>Share account credentials with other users</li>
                <li>Use The Key to generate content intended to deceive employers about your qualifications</li>
                <li>Submit false information to the platform</li>
                <li>Reverse engineer or attempt to access The Key&apos;s backend systems or API keys</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                Content you upload to The Key (CV entries, profile information, interview answers) remains
                yours. You grant us a limited licence to process it in order to provide the service.
              </p>
              <p>
                AI-generated content produced by The Key based on your data is provided for your personal use.
                The Key retains no ownership claim over AI output generated from your inputs.
              </p>
              <p>
                The Key platform itself, including its design, code, and branding, is proprietary and
                may not be copied, distributed, or reverse engineered without our written permission.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Subscription and Payments</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                The Key offers a free tier and a paid Pro subscription. Subscription payments are processed
                securely by <strong className="text-foreground">Stripe</strong>. We do not store your payment
                card details.
              </p>
              <p>
                Subscriptions renew automatically on a monthly or yearly basis. You can cancel at any time
                via the subscription management tool in your account settings. Cancellation takes effect
                at the end of the current billing period.
              </p>
              <p>
                We do not offer refunds for partial subscription periods unless required by UK consumer law.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Account Termination</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                You may delete your account at any time from Settings &gt; Data &amp; Privacy. This permanently
                removes your data from our systems within 30 days.
              </p>
              <p>
                We reserve the right to suspend or terminate accounts that violate these terms, abuse the
                service, or engage in fraudulent activity.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                To the extent permitted by UK law, The Key is not liable for any losses arising from:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Reliance on AI-generated CV content or interview feedback</li>
                <li>Inaccurate or outdated internship listings</li>
                <li>Service interruptions or downtime</li>
                <li>Loss of data due to account deletion (including by you)</li>
              </ul>
              <p>
                Nothing in these terms limits our liability for death or personal injury caused by
                negligence, fraud, or any liability that cannot lawfully be excluded under UK law.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to These Terms</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                We will notify registered users by email of material changes to these terms at least
                14 days in advance. Continued use of The Key after the effective date of changes
                constitutes acceptance of the updated terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                These terms are governed by the laws of England and Wales. Any disputes will be subject
                to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                Questions about these terms:{' '}
                <a href="mailto:support@[yourdomain]" className="text-primary hover:underline">
                  support@[yourdomain]
                </a>
              </p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/ethics" className="hover:text-foreground transition-colors">Ethics & Transparency</Link>
        </div>
      </div>
    </div>
  );
}
