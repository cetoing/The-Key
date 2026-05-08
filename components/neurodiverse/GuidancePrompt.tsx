'use client';

// GuidancePrompt — "Next best action" contextual banner.
//
// Design rationale for neurodiverse users:
// - Reduces decision paralysis by surfacing a single clear next step,
//   rather than expecting the user to scan many options simultaneously.
// - Uses icon + short headline + brief explanation so users who struggle
//   with dense text can quickly parse the prompt at different reading speeds.
// - Dismissible per-session (sessionStorage) so it doesn't become noise
//   after the first encounter, respecting cognitive fatigue.
// - Calm, non-alarming colour palette (teal/slate) to avoid anxiety responses
//   from high-saturation alerts.

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, X, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface GuidanceAction {
  label: string;
  href: string;
}

export interface GuidancePromptProps {
  // Unique key used to track per-session dismissal in sessionStorage
  id: string;
  // Short headline — plain language, max ~6 words
  headline: string;
  // One sentence explaining why this action is recommended
  reason: string;
  action: GuidanceAction;
  // Optional second action for cases where there are exactly two clear paths
  secondaryAction?: GuidanceAction;
}

export function GuidancePrompt({ id, headline, reason, action, secondaryAction }: GuidancePromptProps) {
  const storageKey = `guidance_dismissed_${id}`;
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read sessionStorage only on client to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && sessionStorage.getItem(storageKey)) {
      setDismissed(true);
    }
  }, [storageKey]);

  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(storageKey, '1');
    }
  };

  if (!mounted || dismissed) return null;

  return (
    // Teal accent: calm, forward-looking — avoids red/amber which can trigger
    // stress responses in some neurodiverse users (especially autistic users).
    <div
      role="status"
      aria-live="polite"
      aria-label={`Suggested next action: ${headline}`}
      className="rounded-xl border border-teal-500/25 bg-teal-500/6 p-4 flex gap-3 items-start"
    >
      {/* Compass icon signals "guidance" rather than "warning" */}
      <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Label badge — explicit "Next step" framing reduces ambiguity */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-0.5">
          Suggested next step
        </p>
        <p className="text-sm font-semibold text-foreground leading-snug mb-1">{headline}</p>
        {/* Reason uses plain language — avoids jargon, keeps sentences short */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{reason}</p>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white h-8 text-xs">
            <Link href={action.href}>
              {action.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
          {secondaryAction && (
            <Button asChild size="sm" variant="outline" className="gap-1.5 border-teal-500/30 text-teal-700 dark:text-teal-400 hover:bg-teal-500/10 h-8 text-xs">
              <Link href={secondaryAction.href}>
                {secondaryAction.label}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Dismiss button — always present so users feel in control */}
      <button
        onClick={dismiss}
        aria-label="Dismiss suggestion"
        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
