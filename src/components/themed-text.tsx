import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useFontScale } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

const TYPE_METRICS: Record<NonNullable<ThemedTextProps['type']>, { fontSize: number; lineHeight: number }> = {
  default: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 48, lineHeight: 52 },
  subtitle: { fontSize: 32, lineHeight: 44 },
  small: { fontSize: 14, lineHeight: 20 },
  smallBold: { fontSize: 14, lineHeight: 20 },
  link: { fontSize: 14, lineHeight: 30 },
  linkPrimary: { fontSize: 14, lineHeight: 30 },
  code: { fontSize: 12, lineHeight: 16 },
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const scale = useFontScale();

  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const baseFontSize = typeof flat.fontSize === 'number' ? flat.fontSize : TYPE_METRICS[type].fontSize;
  const baseLineHeight =
    typeof flat.lineHeight === 'number' ? flat.lineHeight : TYPE_METRICS[type].lineHeight;

  const scaled: TextStyle = {
    fontSize: Math.round(baseFontSize * scale),
    lineHeight: Math.round(baseLineHeight * scale),
  };

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
        scaled,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontWeight: 500,
  },
  smallBold: {
    fontWeight: 700,
  },
  default: {
    fontWeight: 500,
  },
  title: {
    fontWeight: 600,
  },
  subtitle: {
    fontWeight: 600,
  },
  link: {},
  linkPrimary: {
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
  },
});
