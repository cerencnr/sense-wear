import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  ClothingItem,
  deleteClothingItem,
  describeClothing,
  loadWardrobe,
} from '@/lib/clothing';

export default function WardrobeScreen() {
  const theme = useTheme();
  const [items, setItems] = useState<ClothingItem[]>([]);

  const refresh = useCallback(() => {
    loadWardrobe().then(setItems);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const confirmDelete = (item: ClothingItem) => {
    const doDelete = async () => {
      await deleteClothingItem(item.id);
      refresh();
    };

    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' ? window.confirm(`Remove "${item.name}"?`) : true;
      if (ok) doDelete();
      return;
    }

    Alert.alert('Remove garment', `Remove "${item.name}" from your wardrobe?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: doDelete },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Wardrobe</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.headerSubtitle}>
            {items.length === 0
              ? 'No garments saved yet'
              : `${items.length} garment${items.length === 1 ? '' : 's'} recognized by SenseWear`}
          </ThemedText>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
              Add a garment from the Add tab to teach the app what you own.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.three }} />}
            renderItem={({ item }) => (
              <Pressable
                onLongPress={() => confirmDelete(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}. ${describeClothing(item)}`}
                accessibilityHint="Long press to remove"
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: colorSwatch(item.color), borderColor: theme.backgroundSelected },
                  ]}
                />
                <View style={styles.cardBody}>
                  <ThemedText type="default" style={styles.cardTitle}>
                    {item.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.color} · {item.pattern} · {item.type}
                  </ThemedText>
                  {item.hasStain && (
                    <ThemedText type="smallBold" style={styles.stainTag}>
                      Stain detected
                    </ThemedText>
                  )}
                </View>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const NAMED_COLORS: Record<string, string> = {
  black: '#111111',
  white: '#f5f5f5',
  red: '#d64545',
  orange: '#e58a3a',
  yellow: '#e8c547',
  green: '#4a8a52',
  blue: '#3c6ec7',
  navy: '#1d2b53',
  purple: '#7148a8',
  pink: '#e87aa3',
  brown: '#7a4a2a',
  beige: '#d8c4a3',
  grey: '#888888',
  gray: '#888888',
};

function colorSwatch(color: string): string {
  const key = color.trim().toLowerCase();
  return NAMED_COLORS[key] ?? '#999999';
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
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  header: {
    paddingTop: Platform.OS === 'web' ? Spacing.six : Spacing.three,
    gap: Spacing.one,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  emptyText: {
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.75,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontWeight: '700',
  },
  stainTag: {
    marginTop: Spacing.half,
    color: '#c04444',
  },
});
