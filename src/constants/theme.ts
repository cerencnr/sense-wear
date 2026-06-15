/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Brand palette
//  krem (cream)        #ccb498
//  kahve (brown)       #5f5850
//  hardal (mustard)    #d4a017
//  koyu hardal (deep)  #70530b
export const Colors = {
  light: {
    text: '#3D352B',
    background: '#F5EFE3',
    backgroundElement: '#EADFC9',
    backgroundSelected: '#DDCAA6',
    textSecondary: '#5F5850',
    accent: '#D4A017',
    accentText: '#2A2006',
  },
  dark: {
    text: '#F2E9D8',
    background: '#1E1B17',
    backgroundElement: '#322D26',
    backgroundSelected: '#463F35',
    textSecondary: '#B7AB97',
    accent: '#D4A017',
    accentText: '#231A05',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
