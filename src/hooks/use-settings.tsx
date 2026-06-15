import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  DEFAULT_SETTINGS,
  FONT_SCALE,
  FontSize,
  Settings,
  ThemePreference,
  loadSettings,
  saveSettings,
} from '@/lib/settings';

type SettingsContextValue = {
  settings: Settings;
  fontScale: number;
  colorScheme: 'light' | 'dark';
  ready: boolean;
  setFontSize: (size: FontSize) => void;
  setTheme: (theme: ThemePreference) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function resolveScheme(
  preference: ThemePreference,
  system: string | null | undefined
): 'light' | 'dark' {
  if (preference === 'system') return system === 'dark' ? 'dark' : 'light';
  return preference;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const systemScheme = useColorScheme();

  useEffect(() => {
    let active = true;
    loadSettings().then((s) => {
      if (active) {
        setSettings(s);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setSettings((prev) => {
      const next = { ...prev, fontSize: size };
      saveSettings(next);
      return next;
    });
  }, []);

  const setTheme = useCallback((theme: ThemePreference) => {
    setSettings((prev) => {
      const next = { ...prev, theme };
      saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      fontScale: FONT_SCALE[settings.fontSize],
      colorScheme: resolveScheme(settings.theme, systemScheme),
      ready,
      setFontSize,
      setTheme,
    }),
    [settings, systemScheme, ready, setFontSize, setTheme]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return {
      settings: DEFAULT_SETTINGS,
      fontScale: FONT_SCALE[DEFAULT_SETTINGS.fontSize],
      colorScheme: 'light',
      ready: true,
      setFontSize: () => undefined,
      setTheme: () => undefined,
    };
  }
  return ctx;
}

export function useFontScale(): number {
  return useSettings().fontScale;
}

export function useColorSchemePreference(): 'light' | 'dark' {
  return useSettings().colorScheme;
}
