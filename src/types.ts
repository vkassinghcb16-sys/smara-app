export type BuyLocation = 'quick_commerce' | 'physical' | 'online';

export type ItemStatus = 'buy' | 'someday' | 'bought';

export type Priority = 'low' | 'normal' | 'high';

export interface Item {
  id: string;
  name: string;
  category: string | null;
  locations: BuyLocation[];
  status: ItemStatus;
  createdAt: string;
  purchasedAt?: string;
  purchasedFrom?: BuyLocation;
  notes?: string;
  link?: string;
  quantity?: number;
  priority?: Priority;
}

export interface Aspiration {
  id: string;
  title: string;
  image?: string;
  url?: string;
  note?: string;
  price?: string;
  targetDate?: string;
  createdAt: string;
}

/** Per-word learned signal, so repeated user corrections nudge future suggestions. */
export type WordLocationScore = Record<string, Partial<Record<BuyLocation, number>>>;
export type WordCategoryScore = Record<string, Record<string, number>>;

export interface ExactOverride {
  category?: string | null;
  locations?: BuyLocation[];
}

export interface Corrections {
  /** Last explicit choice for an exact (lowercased, trimmed) item name. */
  exact: Record<string, ExactOverride>;
  wordLocationScore: WordLocationScore;
  wordCategoryScore: WordCategoryScore;
}

export interface AppState {
  items: Item[];
  aspirations: Aspiration[];
  corrections: Corrections;
}

export const LOCATION_META: Record<BuyLocation, { label: string; emoji: string; short: string }> = {
  quick_commerce: { label: 'Quick Commerce', emoji: '⚡', short: 'Quick Commerce' },
  physical: { label: 'Physical Shops', emoji: '🏪', short: 'Physical Shop' },
  online: { label: 'Online', emoji: '🌐', short: 'Online' },
};

export const ALL_LOCATIONS: BuyLocation[] = ['quick_commerce', 'physical', 'online'];

export const KNOWN_CATEGORIES = [
  'Groceries',
  'Personal Care',
  'Home',
  'Clothing',
  'Electronics',
  'Other',
];
