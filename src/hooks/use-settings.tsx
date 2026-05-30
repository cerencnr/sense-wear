import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_SETTINGS,
  FONT_SCALE,
  FontSize,
  Settings,
  loadSettings,
  saveSettings,
} from '@/lib/settings';

type SettingsContextValue = {
  settings: Settings;
  fontScale: number;
  ready: boolean;
  setFontSize: (size: FontSize) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

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

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      fontScale: FONT_SCALE[settings.fontSize],
      ready,
      setFontSize,
    }),
    [settings, ready, setFontSize]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return {
      settings: DEFAULT_SETTINGS,
      fontScale: FONT_SCALE[DEFAULT_SETTINGS.fontSize],
      ready: true,
      setFontSize: () => undefined,
    };
  }
  return ctx;
}

export function useFontScale(): number {
  return useSettings().fontScale;
}
