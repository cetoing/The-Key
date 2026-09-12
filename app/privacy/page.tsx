import Link from 'next/link';
import { Lock, ArrowLeft, FileText, Eye, Shield } from 'lucide-react';

const LAST_UPDATED = '18 May 2026';
const EFFECTIVE_DATE = '18 May 2026';

export const metadata = {
  title: 'Privacy Policy — The Key',
  description: 'Privacy Policy for The Key platform, compliant with UK GDPR.',
};

export default function PrivacyPage() {
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
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground mt-2 leading-relaxed max-w-2xl">
                How we collect, use, and protect your personal data, and your rights under UK GDPR.
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
            For our Terms of Service, see our{' '}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> page.
            For how we approach AI transparency and bias, see our{' '}
            <Link href="/ethics" className="text-primary hover:underline">Ethics & Transparency</Link> page.
          </div>
        </div>

        <div className="space-y-10 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Who We Are (Data Controller)</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                The Key is operated by <strong className="text-foreground">[Your Legal Name / Trading Name]</strong>,
                based in the United Kingdom.
              </p>
              <p>
                ICO Registration Number: <strong className="text-foreground">[Your ICO number — register at ico.org.uk before launch]</strong>
              </p>
              <p>
                Data protection contact:{' '}
                <a href="mailto:privacy@[yourdomain]" className="text-primary hover:underline">privacy@[yourdomain]</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. What Personal Data We Collect</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-foreground mb-1.5">Account data</p>
                  <p>Email address, full name — collected at registration.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1.5">Profile data</p>
                  <p>University, course, skills, bio — provided by you to improve matching and CV generation.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1.5">CV content</p>
                  <p>Work experience, education, achievements — provided by you for CV building.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1.5">Usage data</p>
                  <p>
                    Anonymised interaction events (date and feature type only — e.g. &quot;cv_generation on 2026-05-18&quot;).
                    No CV text, interview answers, or other personal content is stored in usage metrics.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1.5">AI-processed data</p>
                  <p>
                    Your CV profile and interview answers are sent to OpenAI&apos;s API to generate responses.
                    See Section 5 for details on how OpenAI handles this data.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1.5">Payment data</p>
                  <p>
                    Payment details are collected and processed by Stripe. We do not store your card number or
                    payment credentials. We retain only a Stripe customer ID to manage your subscription.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Lawful Basis for Processing</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-semibold text-foreground">Data</th>
                      <th className="text-left py-2 pr-4 font-semibold text-foreground">Basis</th>
                      <th className="text-left py-2 font-semibold text-foreground">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr>
                      <td className="py-2 pr-4">Account &amp; profile data</td>
                      <td className="py-2 pr-4">Contract</td>
                      <td className="py-2">Required to provide the service</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">CV content</td>
                      <td className="py-2 pr-4">Contract</td>
                      <td className="py-2">Required for CV building features</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">AI processing</td>
                      <td className="py-2 pr-4">Contract</td>
                      <td className="py-2">Feature cannot function without it</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Usage analytics</td>
                      <td className="py-2 pr-4">Legitimate interests</td>
                      <td className="py-2">Improving the platform — you can opt out</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Payment data</td>
                      <td className="py-2 pr-4">Contract</td>
                      <td className="py-2">Processing your subscription</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. How We Use Your Data</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Provide and improve The Key&apos;s features</li>
                <li>Generate AI-assisted CV drafts and interview practice feedback</li>
                <li>Match your profile to relevant internship listings</li>
                <li>Send transactional emails (email verification, password reset)</li>
                <li>Process subscription payments via Stripe</li>
                <li>Identify platform issues and improve reliability</li>
              </ul>
              <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-foreground mb-1">
                  <Shield className="w-3.5 h-3.5 text-green-600" />
                  We do not sell your data. We do not use it for advertising.
                </p>
                <p className="text-xs text-muted-foreground">
                  Your data is never sold to third parties and is never used for targeted advertising.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Third-Party Data Processors</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
              <div>
                <p className="font-medium text-foreground mb-1">Supabase</p>
                <p>
                  Database and authentication provider. Your account data, profile, CV content, and application
                  records are stored on Supabase infrastructure in the EU region.
                  Supabase privacy policy: <span className="text-primary">supabase.com/privacy</span>
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">OpenAI</p>
                <p>
                  AI processing provider. Your CV profile and interview answers are sent to OpenAI&apos;s API
                  to generate responses. According to OpenAI&apos;s API data usage policy, data submitted
                  via the API is <strong className="text-foreground">not used to train OpenAI models by default</strong>.
                  OpenAI policy: <span className="text-primary">openai.com/policies/api-data-usage</span>
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Stripe</p>
                <p>
                  Payment processing. Stripe processes subscription payments and stores payment card details
                  on PCI-compliant infrastructure. We do not receive or store card numbers.
                  Stripe privacy policy: <span className="text-primary">stripe.com/gb/privacy</span>
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Netlify</p>
                <p>
                  Hosting and CDN provider. The Key is deployed on Netlify infrastructure.
                  Netlify privacy policy: <span className="text-primary">netlify.com/privacy</span>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Account, profile, and CV data: retained until you delete your account</li>
                <li>After account deletion: all personal data is deleted within 30 days</li>
                <li>Anonymised usage metrics: retained for up to 24 months, then deleted</li>
                <li>Analytics consent records: a de-identified audit row is retained for compliance purposes even after account deletion</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Your Rights Under UK GDPR</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li><strong className="text-foreground">Access:</strong> request a copy of your data (use the export tool in Settings &gt; Data &amp; Privacy)</li>
                <li><strong className="text-foreground">Correction:</strong> update inaccurate data via your profile settings</li>
                <li><strong className="text-foreground">Deletion:</strong> delete your account and all personal data from Settings &gt; Data &amp; Privacy</li>
                <li><strong className="text-foreground">Restriction:</strong> request that we limit how we process your data</li>
                <li><strong className="text-foreground">Objection:</strong> object to processing based on legitimate interests (e.g. opt out of analytics)</li>
                <li><strong className="text-foreground">Portability:</strong> export your data in a machine-readable format</li>
              </ul>
              <p className="mt-2">
                To exercise any right, email{' '}
                <a href="mailto:privacy@[yourdomain]" className="text-primary hover:underline">privacy@[yourdomain]</a>{' '}
                or use the tools available in your account settings. We will respond within 30 days.
              </p>
              <p>
                If you are unhappy with how we handle your data, you have the right to lodge a complaint
                with the <strong className="text-foreground">Information Commissioner&apos;s Office (ICO)</strong> at{' '}
                <span className="text-primary">ico.org.uk</span>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                The Key uses only <strong className="text-foreground">essential session cookies</strong> required
                for authentication (managed by Supabase). These cookies are necessary for the service to function
                and do not require consent under UK GDPR.
              </p>
              <p>
                We do not use advertising cookies, tracking cookies, or third-party analytics cookies at this time.
                If we add analytics in the future, we will update this policy and obtain consent before setting
                any non-essential cookies.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Children</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                The Key is not directed at children under the age of 13. We do not knowingly collect
                personal data from children under 13 without parental consent.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                We will notify registered users by email of material changes to this privacy policy at least
                14 days in advance of the changes taking effect.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
              <p>
                Data protection queries:{' '}
                <a href="mailto:privacy@[yourdomain]" className="text-primary hover:underline">
                  privacy@[yourdomain]
                </a>
              </p>
              <p>
                General support:{' '}
                <a href="mailto:support@[yourdomain]" className="text-primary hover:underline">
                  support@[yourdomain]</a>
              </p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/ethics" className="hover:text-foreground transition-colors">Ethics & Transparency</Link>
        </div>
      </div>
    </div>
  );
}
