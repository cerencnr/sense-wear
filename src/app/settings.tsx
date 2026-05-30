import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSettings } from '@/hooks/use-settings';
import { FONT_SIZES, FontSize } from '@/lib/settings';

export default function SettingsScreen() {
  const theme = useTheme();
  const { settings, setFontSize } = useSettings();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="subtitle">Settings</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.headerSubtitle}>
              Adjust SenseWear to fit your reading comfort
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              TEXT SIZE
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Affects every text in the app. Changes apply instantly.
            </ThemedText>

            <View style={styles.optionList}>
              {FONT_SIZES.map((option) => {
                const isSelected = option.value === settings.fontSize;
                return (
                  <FontSizeRow
                    key={option.value}
                    label={option.label}
                    sample={option.sample}
                    value={option.value}
                    isSelected={isSelected}
                    onSelect={() => setFontSize(option.value)}
                  />
                );
              })}
            </View>
          </View>

          <View
            style={[
              styles.previewCard,
              { backgroundColor: theme.backgroundElement },
            ]}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              PREVIEW
            </ThemedText>
            <ThemedText type="title" style={styles.previewTitle}>
              Sample
            </ThemedText>
            <ThemedText type="default" style={styles.previewBody}>
              This is a navy striped t-shirt. No stains detected.
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Captions and helper text appear at this size.
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function FontSizeRow({
  label,
  sample,
  value: _value,
  isSelected,
  onSelect,
}: {
  label: string;
  sample: number;
  value: FontSize;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${label} text size`}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: isSelected ? theme.backgroundSelected : theme.backgroundElement,
          borderColor: isSelected ? theme.text : 'transparent',
        },
        pressed && styles.pressed,
      ]}>
      <View style={styles.rowMain}>
        <ThemedText type="default" style={styles.rowLabel}>
          {label}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Aa preview at native size
        </ThemedText>
      </View>
      <View
        style={[
          styles.rowSampleBox,
          { backgroundColor: theme.background },
        ]}>
        <ThemedText style={[styles.rowSample, { fontSize: sample, lineHeight: sample + 4 }]}>
          Aa
        </ThemedText>
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: isSelected ? theme.text : theme.textSecondary,
          },
        ]}>
        {isSelected && <View style={[styles.radioDot, { backgroundColor: theme.text }]} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.OS === 'web' ? Spacing.six : Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    letterSpacing: 1,
  },
  optionList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
    borderWidth: 2,
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontWeight: '700',
  },
  rowSampleBox: {
    width: 48,
    height: 48,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowSample: {
    fontWeight: '700',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pressed: {
    opacity: 0.85,
  },
  previewCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  previewTitle: {
    fontSize: 36,
    lineHeight: 40,
  },
  previewBody: {
    fontSize: 17,
    lineHeight: 24,
  },
});
