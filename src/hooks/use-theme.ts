/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorSchemePreference } from '@/hooks/use-settings';

export function useTheme() {
  const scheme = useColorSchemePreference();
  return Colors[scheme];
}
