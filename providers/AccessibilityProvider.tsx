'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { AccessibilitySettings, FontSize, Theme, NeurodiversePreset, ColorPalette } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/lib/profiles';

// Extends the base AccessibilitySettings with all setters.
// Neurodiverse preset application logic lives here so every consumer
// automatically gets the derived booleans without re-computing them.
interface AccessibilityContextValue extends AccessibilitySettings {
  setFontSize: (size: FontSize) => void;
  setHighContrast: (val: boolean) => void;
  setReducedMotion: (val: boolean) => void;
  setTheme: (theme: Theme) => void;
  setColorPalette: (palette: ColorPalette) => void;
  setNeurodiversePreset: (preset: NeurodiversePreset) => void;
  setShowGuidancePrompts: (val: boolean) => void;
  setStepByStepMode: (val: boolean) => void;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  // Derived convenience flags consumed by page components —
  // avoids each page needing to compare preset strings
  isLowCognitiveLoad: boolean;
  isStepByStep: boolean;
  isMinimalText: boolean;
}

const defaults: AccessibilitySettings = {
  font_size: 'medium',
  high_contrast: false,
  reduced_motion: false,
  theme: 'light',
  color_palette: 'warm',
  neurodiverse_preset: 'none',
  show_guidance_prompts: false,
  step_by_step_mode: false,
};

const AccessibilityContext = createContext<AccessibilityContextValue>({
  ...defaults,
  setFontSize: () => {},
  setHighContrast: () => {},
  setReducedMotion: () => {},
  setTheme: () => {},
  setColorPalette: () => {},
  setNeurodiversePreset: () => {},
  setShowGuidancePrompts: () => {},
  setStepByStepMode: () => {},
  updateSettings: () => {},
  isLowCognitiveLoad: false,
  isStepByStep: false,
  isMinimalText: false,
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaults);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadSettingsForUser = async (userId: string | null) => {
    const scopedKey = userId ? `accessibility:${userId}` : 'accessibility';
    const stored = localStorage.getItem(scopedKey);

    if (stored) {
      try {
        setSettings({ ...defaults, ...JSON.parse(stored) });
        return;
      } catch {}
    }

    if (userId) {
      const profile = await fetchProfile(userId);
      const row = profile as Record<string, unknown> | null;
      if (row) {
        const restored = {
          font_size: (row.font_size as FontSize) || 'medium',
          high_contrast: (row.high_contrast as boolean) || false,
          reduced_motion: (row.reduced_motion as boolean) || false,
          theme: (row.theme as Theme) || 'light',
          color_palette: (row.color_palette as ColorPalette) || 'warm',
          neurodiverse_preset: (row.neurodiverse_preset as NeurodiversePreset) || 'none',
          show_guidance_prompts: (row.show_guidance_prompts as boolean) || false,
          step_by_step_mode: (row.step_by_step_mode as boolean) || false,
        } satisfies AccessibilitySettings;

        setSettings(restored);
        localStorage.setItem(scopedKey, JSON.stringify(restored));
        return;
      }
    }

    setSettings(defaults);
  };

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      const userId = session?.user?.id ?? null;
      setCurrentUserId(userId);
      await loadSettingsForUser(userId);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      const userId = session?.user?.id ?? null;
      setCurrentUserId(userId);
      await loadSettingsForUser(userId);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Apply settings to DOM whenever they change.
  // Each neurodiverse preset adds a data-nd attribute to <html> so that
  // CSS selectors like [data-nd="low_cognitive_load"] can target globally
  // without Tailwind purging dynamic class names.
  useEffect(() => {
    const scopedKey = currentUserId ? `accessibility:${currentUserId}` : 'accessibility';
    localStorage.setItem(scopedKey, JSON.stringify(settings));

    const root = document.documentElement;

    root.classList.remove('dark', 'high-contrast');
    if (settings.theme === 'dark') root.classList.add('dark');
    if (settings.theme === 'high-contrast') root.classList.add('dark', 'high-contrast');
    root.setAttribute('data-palette', settings.color_palette);

    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${settings.font_size}`);

    // Reduced motion: drives all transitions via CSS variable so components
    // don't need motion-specific conditionals; the browser respects it too.
    if (settings.reduced_motion) {
      root.style.setProperty('--animation-duration', '0ms');
    } else {
      root.style.removeProperty('--animation-duration');
    }

    // Neurodiverse preset data attribute — CSS + React components both read this.
    // 'none' removes the attribute entirely so baseline styles are unaffected.
    if (settings.neurodiverse_preset !== 'none') {
      root.setAttribute('data-nd', settings.neurodiverse_preset);
    } else {
      root.removeAttribute('data-nd');
    }
  }, [settings, currentUserId]);

  const updateSettings = (partial: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const preset = settings.neurodiverse_preset;

  return (
    <AccessibilityContext.Provider value={{
      ...settings,
      setFontSize: (font_size) => updateSettings({ font_size }),
      setHighContrast: (high_contrast) => updateSettings({ high_contrast }),
      setReducedMotion: (reduced_motion) => updateSettings({ reduced_motion }),
      setTheme: (theme) => updateSettings({ theme }),
      setColorPalette: (color_palette) => updateSettings({ color_palette }),
      setNeurodiversePreset: (neurodiverse_preset) => {
        // When a preset is applied, automatically enable associated settings
        // so users get a coherent experience without extra toggles:
        // - Any non-none preset → enable guidance prompts (reduces search burden)
        // - step_by_step preset → also enable step_by_step_mode flag
        // - Clearing to 'none' does not touch other toggles (user may want to keep guidance)
        const extras: Partial<AccessibilitySettings> =
          neurodiverse_preset === 'none'
            ? { show_guidance_prompts: false, step_by_step_mode: false }
            : neurodiverse_preset === 'step_by_step'
              ? { show_guidance_prompts: true, step_by_step_mode: true }
              : { show_guidance_prompts: true, step_by_step_mode: false };
        updateSettings({ neurodiverse_preset, ...extras });
      },
      setShowGuidancePrompts: (show_guidance_prompts) => updateSettings({ show_guidance_prompts }),
      setStepByStepMode: (step_by_step_mode) => updateSettings({ step_by_step_mode }),
      updateSettings,
      isLowCognitiveLoad: preset === 'low_cognitive_load',
      isStepByStep: preset === 'step_by_step' || settings.step_by_step_mode,
      isMinimalText: preset === 'minimal_text',
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
