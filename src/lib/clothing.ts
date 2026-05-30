import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@sensewear/wardrobe/v1';

export type ClothingType =
  | 'T-Shirt'
  | 'Shirt'
  | 'Sweater'
  | 'Jacket'
  | 'Dress'
  | 'Skirt'
  | 'Pants'
  | 'Jeans'
  | 'Shorts'
  | 'Scarf'
  | 'Other';

export const CLOTHING_TYPES: ClothingType[] = [
  'T-Shirt',
  'Shirt',
  'Sweater',
  'Jacket',
  'Dress',
  'Skirt',
  'Pants',
  'Jeans',
  'Shorts',
  'Scarf',
  'Other',
];

export type Pattern = 'Solid' | 'Striped' | 'Checked' | 'Floral' | 'Dotted' | 'Printed';

export const PATTERNS: Pattern[] = ['Solid', 'Striped', 'Checked', 'Floral', 'Dotted', 'Printed'];

export type ClothingItem = {
  id: string;
  name: string;
  type: ClothingType;
  color: string;
  pattern: Pattern;
  hasStain: boolean;
  notes?: string;
  createdAt: number;
};

export function describeClothing(item: ClothingItem): string {
  const patternPart = item.pattern === 'Solid' ? '' : `${item.pattern.toLowerCase()} `;
  const stainPart = item.hasStain ? ' A stain was detected on the fabric.' : ' No stains detected.';
  const notesPart = item.notes ? ` Note: ${item.notes}.` : '';
  return `This is a ${item.color.toLowerCase()} ${patternPart}${item.type.toLowerCase()}.${stainPart}${notesPart}`;
}

export async function loadWardrobe(): Promise<ClothingItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ClothingItem[];
  } catch {
    return [];
  }
}

export async function saveWardrobe(items: ClothingItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function addClothingItem(
  input: Omit<ClothingItem, 'id' | 'createdAt'>
): Promise<ClothingItem> {
  const items = await loadWardrobe();
  const newItem: ClothingItem = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  await saveWardrobe([newItem, ...items]);
  return newItem;
}

export async function deleteClothingItem(id: string): Promise<void> {
  const items = await loadWardrobe();
  await saveWardrobe(items.filter((item) => item.id !== id));
}

export function pickRandomItem(items: ClothingItem[]): ClothingItem | null {
  if (items.length === 0) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx];
}
