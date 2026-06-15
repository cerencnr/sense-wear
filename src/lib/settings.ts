import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@sensewear/settings/v1';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export const FONT_SIZES: { value: FontSize; label: string; sample: number }[] = [
  { value: 'small', label: 'Small', sample: 14 },
  { value: 'medium', label: 'Medium', sample: 16 },
  { value: 'large', label: 'Large', sample: 19 },
  { value: 'xlarge', label: 'Extra Large', sample: 23 },
];

export const FONT_SCALE: Record<FontSize, number> = {
  small: 0.9,
  medium: 1.0,
  large: 1.2,
  xlarge: 1.45,
};

export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_OPTIONS: { value: ThemePreference; label: string; description: string }[] = [
  { value: 'system', label: 'System', description: 'Match your device appearance' },
  { value: 'light', label: 'Light', description: 'Always use the light palette' },
  { value: 'dark', label: 'Dark', description: 'Always use the dark palette' },
];

export type Settings = {
  fontSize: FontSize;
  theme: ThemePreference;
};

export const DEFAULT_SETTINGS: Settings = {
  fontSize: 'medium',
  theme: 'system',
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
