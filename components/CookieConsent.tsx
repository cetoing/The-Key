'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Set to true when non-essential analytics/tracking cookies are added.
// While false, this component returns null (essential session cookies don't need consent).
const ANALYTICS_ENABLED = false;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ANALYTICS_ENABLED) return;
    const stored = localStorage.getItem('cookie_consent');
    if (!stored) setVisible(true);
  }, []);

  if (!ANALYTICS_ENABLED || !visible) return null;

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground leading-relaxed">
          We use essential cookies for authentication and optional analytics to improve The Key.
          See our{' '}
          <Link href="/privacy" className="text-primary underline underline-offset-2 hover:no-underline">
            Privacy Policy
          </Link>.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" onClick={accept} className="rounded-xl">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
