import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/providers/AuthProvider';
import { AccessibilityProvider } from '@/providers/AccessibilityProvider';
import { Toaster } from '@/components/ui/toaster';
import { CookieConsent } from '@/components/CookieConsent';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Key - AI-Powered Internship Platform',
  description: 'Helping university students - especially neurodiverse learners - build CVs, find internships, and prepare for interviews.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AccessibilityProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <CookieConsent />
          </AuthProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
