'use client';

// Accessibility Settings page.
//
// Design decisions for neurodiverse support:
// - Preset cards use large tap targets and clear iconography so users with
//   motor difficulties or executive function challenges can act quickly.
// - Each preset card includes a plain-English "what changes" list so users
//   understand the effect before committing — reducing reversal anxiety.
// - Individual toggles remain available so users can configure fine-grained
//   combinations beyond the predefined presets.
// - The active preset is highlighted with a border + checkmark — removes the
//   need to remember which option was previously chosen.

import { useAuth } from '@/providers/AuthProvider';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { supabase } from '@/lib/supabase';
import type { Theme, FontSize, NeurodiversePreset, ColorPalette } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Eye,
  Type,
  Zap,
  Moon,
  Sun,
  Contrast,
  CheckCircle2,
  Brain,
  ListOrdered,
  AlignLeft,
  LayoutGrid,
  Compass,
  Info,
  Palette,
  Flame,
  Waves,
} from 'lucide-react';

const fontSizeOptions: { value: FontSize; label: string; description: string }[] = [
  { value: 'small', label: 'Small', description: '14px — compact view' },
  { value: 'medium', label: 'Medium', description: '16px — default' },
  { value: 'large', label: 'Large', description: '18px — easier to read' },
];

const themeOptions: { value: Theme; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', description: 'Clean white background', icon: Sun },
  { value: 'dark', label: 'Dark', description: 'Dark oak-toned background', icon: Moon },
  { value: 'high-contrast', label: 'High Contrast', description: 'Maximum legibility', icon: Contrast },
];

const paletteOptions: {
  value: ColorPalette;
  label: string;
  description: string;
  lightPreview: string;
  darkPreview: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'warm',
    label: 'Warm Amber',
    description: 'The current calm orange-and-oak palette.',
    lightPreview: 'linear-gradient(135deg, hsl(35 70% 97%), hsl(34 90% 96%))',
    darkPreview: 'linear-gradient(135deg, hsl(22 24% 14%), hsl(18 26% 10%))',
    icon: Flame,
  },
  {
    value: 'cool',
    label: 'Cool Blue',
    description: 'The earlier cyan and navy palette from your previous version.',
    lightPreview: 'linear-gradient(135deg, hsl(194 83% 49%), hsl(187 77% 51%))',
    darkPreview: 'linear-gradient(135deg, hsl(222 42% 16%), hsl(224 39% 12%))',
    icon: Waves,
  },
];

// Neurodiverse preset definitions.
// Each preset is designed around a specific cognitive profile:
// - low_cognitive_load: for users who experience decision fatigue or
//   sensory overload — reduces options per screen, increases whitespace.
// - step_by_step: for users with ADHD or executive dysfunction who benefit
//   from being shown one task at a time with explicit progress indicators.
// - minimal_text: for users with dyslexia or processing difficulties who
//   prefer icon-led navigation with shorter labels.
const neurodiversePresets: {
  value: NeurodiversePreset;
  label: string;
  tagline: string;
  description: string;
  changes: string[];
  icon: React.ElementType;
  color: string;
}[] = [
  {
    value: 'none',
    label: 'Standard',
    tagline: 'Default interface',
    description: 'No cognitive load adaptations. All features and options visible.',
    changes: [],
    icon: LayoutGrid,
    color: 'text-slate-500',
  },
  {
    value: 'low_cognitive_load',
    // Reduces the number of choices presented at once (Hick's Law).
    // Beneficial for: ADHD, anxiety, autism, cognitive fatigue.
    label: 'Low Cognitive Load',
    tagline: 'Fewer choices, clearer focus',
    description: 'Hides secondary options and simplifies layouts so you can focus on one thing at a time.',
    changes: [
      'Secondary actions hidden until needed',
      'Guidance prompts on key pages',
      'Reduced visual complexity on cards',
    ],
    icon: Brain,
    color: 'text-teal-600 dark:text-teal-400',
  },
  {
    value: 'step_by_step',
    // Addresses executive function difficulties — the inability to self-sequence
    // tasks without external scaffolding.
    // Beneficial for: ADHD, autism, dyspraxia, acquired brain injury.
    label: 'Step-by-Step',
    tagline: 'One task at a time',
    description: 'Breaks tasks into numbered steps and reveals the next step only when the current one is complete.',
    changes: [
      'Checklists show one step at a time',
      'Progress indicators on every multi-step task',
      'Guidance prompts enabled by default',
    ],
    icon: ListOrdered,
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    value: 'minimal_text',
    // Supports dyslexia and reading processing difficulties by shortening labels.
    // Beneficial for: dyslexia, Irlen syndrome, processing speed differences.
    label: 'Minimal Text',
    tagline: 'Icons-first, shorter labels',
    description: 'Shortens text labels throughout the interface and uses icons as the primary navigation cue.',
    changes: [
      'Navigation labels condensed to key words',
      'Longer descriptions hidden behind toggles',
      'Icon emphasis increased on action buttons',
    ],
    icon: AlignLeft,
    color: 'text-amber-600 dark:text-amber-400',
  },
];

export default function AccessibilityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    font_size, high_contrast, reduced_motion, theme,
    color_palette, neurodiverse_preset, show_guidance_prompts, step_by_step_mode,
    setFontSize, setHighContrast, setReducedMotion, setTheme,
    setColorPalette,
    setNeurodiversePreset, setShowGuidancePrompts, setStepByStepMode,
    updateSettings,
  } = useAccessibility();

  const saveToProfile = async () => {
    if (!user) return;
    const payload = {
      id: user.id,
      user_id: user.id,
      font_size,
      high_contrast,
      reduced_motion,
      theme,
      color_palette,
      neurodiverse_preset,
      show_guidance_prompts,
      step_by_step_mode,
      updated_at: new Date().toISOString(),
    };

    let { error } = await supabase
      .from('profiles')
      .upsert(payload);

    if (error?.message?.includes('color_palette')) {
      const { error: fallbackError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          font_size,
          high_contrast,
          reduced_motion,
          theme,
          neurodiverse_preset,
          show_guidance_prompts,
          step_by_step_mode,
          updated_at: payload.updated_at,
        });
      error = fallbackError;
    }
    if (error) {
      toast({ title: 'Failed to save preferences', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Preferences saved', description: 'Your accessibility settings have been saved to your profile.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Accessibility Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Customise The Key to suit your needs. All changes apply immediately and save to your profile.
        </p>
      </div>

      {/* ── Neurodiverse Support Mode ──────────────────────────────────────────
          Preset cards each correspond to a documented cognitive profile.
          Selecting a preset sets the neurodiverse_preset value AND automatically
          enables supporting toggles (guidance prompts, step-by-step mode)
          so users get a coherent experience without extra steps.
      */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Neurodiverse Support Mode
          </CardTitle>
          <CardDescription>
            Choose a preset that suits your cognitive style. Each one adapts how
            information is presented — you can still change individual settings below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {neurodiversePresets.map(({ value, label, tagline, description, changes, icon: Icon, color }) => {
              const active = neurodiverse_preset === value;
              return (
                <button
                  key={value}
                  onClick={() => setNeurodiversePreset(value)}
                  className={`relative text-left flex flex-col gap-2 p-4 rounded-xl border-2 transition-all ${
                    active
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 bg-card'
                  }`}
                  aria-pressed={active}
                >
                  {active && (
                    <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-primary" />
                  )}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${active ? 'bg-primary/15' : 'bg-muted'}`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-primary' : color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{tagline}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{description}</p>
                  {changes.length > 0 && (
                    <ul className="space-y-1 mt-1">
                      {changes.map((c) => (
                        <li key={c} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-teal-500 flex-shrink-0 mt-0.5" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border mt-1">
            <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              These presets are designed with input from neurodiversity research.
              They do not diagnose or label — choose whichever works best for you.
              These changes affect presentation and navigation support, and they are fully reversible.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Guidance & Navigation Aids ────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" />
            Guidance & Navigation Aids
          </CardTitle>
          <CardDescription>
            Optional prompts that help you know what to do next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* show_guidance_prompts: surfaces "Next best action" banners on pages.
              Beneficial for users who experience navigation anxiety or need
              external scaffolding to sequence tasks. */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5 max-w-[75%]">
              <Label htmlFor="guidance-prompts" className="text-sm font-medium">
                Show Guidance Prompts
              </Label>
              <p className="text-xs text-muted-foreground">
                Displays a &quot;Suggested next step&quot; banner on the dashboard and
                internships pages to reduce decision-making effort.
              </p>
            </div>
            <Switch
              id="guidance-prompts"
              checked={show_guidance_prompts}
              onCheckedChange={setShowGuidancePrompts}
            />
          </div>

          {/* step_by_step_mode: reveals checklist items one at a time.
              Supports executive function by removing the need to self-sequence
              tasks from a full visible list. */}
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div className="space-y-0.5 max-w-[75%]">
              <Label htmlFor="step-by-step" className="text-sm font-medium">
                Step-by-Step Checklists
              </Label>
              <p className="text-xs text-muted-foreground">
                Shows one checklist step at a time. The next step appears only
                after the current one is marked complete.
              </p>
            </div>
            <Switch
              id="step-by-step"
              checked={step_by_step_mode}
              onCheckedChange={setStepByStepMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Colour Theme ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Colour Theme
          </CardTitle>
          <CardDescription>Choose the visual theme that works best for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themeOptions.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                  theme === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 bg-card'
                }`}
                aria-pressed={theme === value}
              >
                {theme === value && (
                  <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
                )}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === value ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground leading-snug">{description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Colour Palette
          </CardTitle>
          <CardDescription>
            Choose between the current warm palette and the older cool blue palette. Each works with light and dark mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paletteOptions.map(({ value, label, description, lightPreview, darkPreview, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setColorPalette(value)}
                className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                  color_palette === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 bg-card'
                }`}
                aria-pressed={color_palette === value}
              >
                {color_palette === value && (
                  <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-primary" />
                )}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    color_palette === value ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="overflow-hidden rounded-lg border border-border/70">
                    <div className="h-16" style={{ backgroundImage: lightPreview }} />
                    <div className="bg-background px-2 py-1.5 text-[10px] font-medium text-muted-foreground">Light mode</div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-border/70">
                    <div className="h-16" style={{ backgroundImage: darkPreview }} />
                    <div className="bg-background px-2 py-1.5 text-[10px] font-medium text-muted-foreground">Dark mode</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Text Size ─────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" />
            Text Size
          </CardTitle>
          <CardDescription>Adjust the base font size across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {fontSizeOptions.map(({ value, label, description }) => (
              <button
                key={value}
                onClick={() => setFontSize(value)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                  font_size === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 bg-card'
                }`}
                aria-pressed={font_size === value}
              >
                {font_size === value && (
                  <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
                )}
                <span className={`font-bold text-foreground ${
                  value === 'small' ? 'text-sm' : value === 'medium' ? 'text-base' : 'text-lg'
                }`}>Aa</span>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-[10px] text-muted-foreground">{description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Motion & Animation ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Motion & Animation
          </CardTitle>
          <CardDescription>
            Reduce animations if you experience discomfort with motion effects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* reduced_motion: important for vestibular disorders and ADHD
              — animation can pull focus away from content. */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion" className="text-sm font-medium">
                Reduce Motion
              </Label>
              <p className="text-xs text-muted-foreground">
                Disables transitions and animations throughout the interface.
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={reduced_motion}
              onCheckedChange={setReducedMotion}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Visual Accessibility ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Visual Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-sm font-medium">
                High Contrast Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Maximises colour contrast for better text legibility.
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={high_contrast}
              onCheckedChange={(v) => {
                setHighContrast(v);
                if (v) setTheme('high-contrast');
                else if (theme === 'high-contrast') setTheme('light');
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="pt-2">
        <Button onClick={saveToProfile} className="w-full sm:w-auto">
          Save Preferences to Profile
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Changes are applied locally immediately. Save to persist them across devices.
        </p>
      </div>
    </div>
  );
}
