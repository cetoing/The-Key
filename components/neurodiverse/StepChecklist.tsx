'use client';

// StepChecklist — Progressive task disclosure for step-by-step mode.
//
// Design rationale for neurodiverse users:
// - Shows only one uncompleted step at a time (progressive disclosure),
//   preventing "task overwhelm" where a full list causes avoidance.
// - Completed steps remain visible in a muted style so users can see
//   their progress — important for ADHD users who need positive reinforcement.
// - Each step has a short action label AND a brief "why" explanation,
//   supporting autistic users who benefit from explicit reasoning.
// - Steps are numbered so users always know where they are in the sequence,
//   reducing the anxiety of not knowing how much is left.

import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface ChecklistStep {
  id: string;
  label: string;
  // Plain-language explanation of why this step matters
  why: string;
  done: boolean;
  href?: string;
  actionLabel?: string;
}

interface StepChecklistProps {
  title: string;
  steps: ChecklistStep[];
  // In step-by-step mode, only show the first incomplete step + completed steps.
  // In regular mode, show all steps (used for reference-style checklists).
  stepByStepMode?: boolean;
}

export function StepChecklist({ title, steps, stepByStepMode = false }: StepChecklistProps) {
  const firstIncompleteIdx = steps.findIndex((s) => !s.done);

  const visibleSteps = stepByStepMode
    ? steps.filter((s, idx) => s.done || idx === firstIncompleteIdx)
    : steps;

  const completedCount = steps.filter((s) => s.done).length;
  const totalCount = steps.length;
  const allDone = completedCount === totalCount;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span className="text-xs text-muted-foreground tabular-nums">
          {completedCount}/{totalCount} done
        </span>
      </div>

      {/* Progress bar — provides immediate visual feedback on progress.
          For ADHD users this acts as a "reward" visual that motivates continuation. */}
      <div className="h-1.5 bg-muted">
        <div
          className="h-full bg-teal-500 transition-all duration-500"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>

      <ul className="divide-y divide-border">
        {visibleSteps.map((step, idx) => {
          const globalIdx = steps.findIndex((s) => s.id === step.id);
          const isCurrentStep = !step.done && globalIdx === firstIncompleteIdx;

          return (
            <li
              key={step.id}
              className={`px-4 py-3 flex gap-3 items-start transition-colors ${
                isCurrentStep ? 'bg-teal-500/4' : ''
              }`}
            >
              {/* Status icon — clear binary visual, no ambiguous intermediary states */}
              <div className="flex-shrink-0 mt-0.5">
                {step.done
                  ? <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  : <Circle className={`w-4 h-4 ${isCurrentStep ? 'text-teal-500' : 'text-muted-foreground/40'}`} />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {/* Step number — explicit position cue */}
                  <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                    Step {globalIdx + 1}
                  </span>
                  {isCurrentStep && (
                    <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                      Current
                    </span>
                  )}
                </div>

                <p className={`text-sm font-medium leading-snug ${step.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {step.label}
                </p>

                {/* "Why" explanation — always shown for current/future steps.
                    Explicit rationale helps autistic users and those with
                    executive function difficulties understand task relevance. */}
                {!step.done && (
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{step.why}</p>
                )}

                {isCurrentStep && step.href && step.actionLabel && (
                  <Button asChild size="sm" className="mt-2 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white h-7 text-xs">
                    <Link href={step.href}>
                      {step.actionLabel}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
            </li>
          );
        })}

        {/* Hidden steps indicator in step-by-step mode */}
        {stepByStepMode && firstIncompleteIdx !== -1 && (
          <li className="px-4 py-2.5 flex items-center gap-2 text-xs text-muted-foreground bg-muted/20">
            <ChevronRight className="w-3.5 h-3.5" />
            {totalCount - completedCount - 1} more step{totalCount - completedCount - 1 !== 1 ? 's' : ''} will appear after you complete the current one
          </li>
        )}
      </ul>

      {allDone && (
        <div className="px-4 py-3 bg-teal-500/6 border-t border-teal-500/15 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            All steps complete — well done!
          </p>
        </div>
      )}
    </div>
  );
}
