import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useFontScale } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';
import {
  CLOTHING_TYPES,
  ClothingType,
  PATTERNS,
  Pattern,
  addClothingItem,
} from '@/lib/clothing';

const COLOR_OPTIONS = [
  'Black',
  'White',
  'Grey',
  'Red',
  'Orange',
  'Yellow',
  'Green',
  'Blue',
  'Navy',
  'Purple',
  'Pink',
  'Brown',
  'Beige',
];

export default function AddClothingScreen() {
  const theme = useTheme();
  const fontScale = useFontScale();
  const inputFontSize = Math.round(16 * fontScale);
  const [name, setName] = useState('');
  const [type, setType] = useState<ClothingType>('T-Shirt');
  const [color, setColor] = useState<string>('Black');
  const [pattern, setPattern] = useState<Pattern>('Solid');
  const [hasStain, setHasStain] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await addClothingItem({
        name: name.trim(),
        type,
        color,
        pattern,
        hasStain,
        notes: notes.trim() || undefined,
      });
      setName('');
      setType('T-Shirt');
      setColor('Black');
      setPattern('Solid');
      setHasStain(false);
      setNotes('');
      router.navigate('/wardrobe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <ThemedText type="subtitle">Add garment</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.headerSubtitle}>
                Teach SenseWear a new clothing item
              </ThemedText>
            </View>

            <FormField label="Name">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Blue striped shirt"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    fontSize: inputFontSize,
                  },
                ]}
              />
            </FormField>

            <FormField label="Type">
              <ChipGroup
                options={CLOTHING_TYPES}
                selected={type}
                onSelect={(v) => setType(v as ClothingType)}
              />
            </FormField>

            <FormField label="Primary color">
              <ChipGroup options={COLOR_OPTIONS} selected={color} onSelect={setColor} />
            </FormField>

            <FormField label="Pattern">
              <ChipGroup
                options={PATTERNS}
                selected={pattern}
                onSelect={(v) => setPattern(v as Pattern)}
              />
            </FormField>

            <View
              style={[
                styles.stainRow,
                { backgroundColor: theme.backgroundElement },
              ]}>
              <View style={styles.flex}>
                <ThemedText type="default">Has visible stain</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Mark if the garment currently has a stain
                </ThemedText>
              </View>
              <Switch value={hasStain} onValueChange={setHasStain} />
            </View>

            <FormField label="Notes (optional)">
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Soft cotton, ribbed collar"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                style={[
                  styles.input,
                  styles.notesInput,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    fontSize: inputFontSize,
                  },
                ]}
              />
            </FormField>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save garment"
              onPress={handleSave}
              disabled={!canSave}
              style={({ pressed }) => [
                styles.saveButton,
                { backgroundColor: theme.text },
                !canSave && styles.saveButtonDisabled,
                pressed && styles.pressed,
              ]}>
              <ThemedText
                type="default"
                style={[styles.saveLabel, { color: theme.background }]}>
                {saving ? 'Saving…' : 'Save to wardrobe'}
              </ThemedText>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.fieldLabel}>
        {label.toUpperCase()}
      </ThemedText>
      {children}
    </View>
  );
}

function ChipGroup({
  options,
  selected,
  onSelect,
}: {
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.chipGroup}>
      {options.map((opt) => {
        const isSelected = opt === selected;
        return (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={opt}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isSelected ? theme.text : theme.backgroundElement,
              },
              pressed && styles.pressed,
            ]}>
            <ThemedText
              type="small"
              style={{ color: isSelected ? theme.background : theme.text, fontWeight: '600' }}>
              {opt}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  flex: { flex: 1 },
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
  field: {
    gap: Spacing.two,
  },
  fieldLabel: {
    letterSpacing: 1,
  },
  input: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  stainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  saveButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
