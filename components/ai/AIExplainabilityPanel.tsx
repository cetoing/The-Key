'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  CheckCircle2,
  Target,
  Layers,
  ShieldAlert,
  Cpu,
  ArrowRight,
} from 'lucide-react';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface ExplainabilityInput {
  label: string;
  value: string;
  present: boolean;
}

export interface ExplainabilityData {
  featureName: string;
  model: string;
  inputs: ExplainabilityInput[];
  optimisedFor: string[];
  limitations: string[];
  biasRisks: string[];
  confidence: ConfidenceLevel;
  confidenceReason: string;
}

interface Props {
  data: ExplainabilityData;
  defaultOpen?: boolean;
}

const CONFIDENCE_CONFIG: Record<
  ConfidenceLevel,
  { label: string; color: string; bg: string; barWidth: string; barColor: string }
> = {
  low: {
    label: 'Low confidence',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/8 border-red-500/20',
    barWidth: 'w-1/3',
    barColor: 'bg-red-500',
  },
  medium: {
    label: 'Medium confidence',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/8 border-amber-500/20',
    barWidth: 'w-2/3',
    barColor: 'bg-amber-500',
  },
  high: {
    label: 'High confidence',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/8 border-green-500/20',
    barWidth: 'w-full',
    barColor: 'bg-green-500',
  },
};

function ConfidencePill({ level }: { level: ConfidenceLevel }) {
  const c = CONFIDENCE_CONFIG[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${c.bg} ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.barColor}`} />
      {c.label}
    </span>
  );
}

function ConfidenceBar({ level, reason }: { level: ConfidenceLevel; reason: string }) {
  const c = CONFIDENCE_CONFIG[level];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Output Confidence
        </span>
        <ConfidencePill level={level} />
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${c.barWidth} ${c.barColor}`} />
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{reason}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: string }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </p>
  );
}

export function AIExplainabilityPanel({ data, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const presentInputs = data.inputs.filter((i) => i.present);
  const missingInputs = data.inputs.filter((i) => !i.present);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left gap-3"
        aria-expanded={open}
        aria-controls="explainability-content"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-foreground">How was this generated?</span>
            <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
              AI transparency panel
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ConfidencePill level={data.confidence} />
          {open
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          }
        </div>
      </button>

      {open && (
        <div id="explainability-content" className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <ConfidenceBar level={data.confidence} reason={data.confidenceReason} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <SectionHeader icon={Layers} label="Inputs Used" color="text-blue-600 dark:text-blue-400" />
              <ul className="space-y-1.5">
                {presentInputs.map((inp) => (
                  <li key={inp.label} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-foreground">{inp.label}</span>
                      {inp.value && (
                        <span className="text-[11px] text-muted-foreground ml-1.5">{inp.value}</span>
                      )}
                    </div>
                  </li>
                ))}
                {missingInputs.map((inp) => (
                  <li key={inp.label} className="flex items-start gap-2 opacity-50">
                    <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-xs text-muted-foreground">{inp.label}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5 italic">not provided</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <SectionHeader icon={Target} label="Optimised For" color="text-green-600 dark:text-green-400" />
              <ul className="space-y-1.5">
                {data.optimisedFor.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground/80 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 space-y-2">
              <SectionHeader icon={AlertTriangle} label="Known Limitations" color="text-amber-600 dark:text-amber-400" />
              <ul className="space-y-1.5">
                {data.limitations.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-foreground/70 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3 space-y-2">
              <SectionHeader icon={ShieldAlert} label="Bias Risks" color="text-red-600 dark:text-red-400" />
              <ul className="space-y-1.5">
                {data.biasRisks.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ShieldAlert className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-foreground/70 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border">
            <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-medium">Model: </span>{data.model} —
              This explanation is based on static system logic, not AI-generated content.
              It reflects how the system is designed to work.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
