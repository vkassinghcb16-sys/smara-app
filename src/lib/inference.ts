import type { BuyLocation, Corrections } from '../types';

interface Rule {
  keywords: string[];
  category: string;
  locations: BuyLocation[];
}

/**
 * Lightweight keyword rules — NOT an exhaustive product database.
 * Enough common cases to feel smart; everything else safely falls back to "unknown".
 */
const RULES: Rule[] = [
  {
    category: 'Groceries',
    locations: ['quick_commerce'],
    keywords: [
      'almond', 'banana', 'oats', 'oat', 'milk', 'bread', 'rice', 'vegetable', 'fruit',
      'egg', 'sugar', 'salt', 'tea', 'coffee', 'cereal', 'snack', 'atta', 'flour', 'butter',
      'cheese', 'curd', 'yogurt', 'juice', 'water bottle', 'spice', 'masala', 'onion', 'potato',
      'tomato', 'apple', 'grocery', 'groceries',
    ],
  },
  {
    category: 'Personal Care',
    locations: ['quick_commerce', 'online'],
    keywords: [
      'shampoo', 'face wash', 'soap', 'toothpaste', 'toothbrush', 'deodorant', 'deo',
      'lotion', 'sunscreen', 'conditioner', 'razor', 'moisturizer', 'perfume', 'lip balm',
      'body wash', 'hand wash', 'sanitizer', 'cream', 'serum',
    ],
  },
  {
    category: 'Home',
    locations: ['quick_commerce', 'physical'],
    keywords: [
      'garbage bag', 'detergent', 'bedsheet', 'bed sheet', 'pillow', 'curtain', 'cleaner',
      'mop', 'tissue', 'dishwash', 'candle', 'air freshener', 'bucket', 'broom', 'towel',
      'blanket', 'kitchen', 'storage box',
    ],
  },
  {
    category: 'Clothing',
    locations: ['online', 'physical'],
    keywords: [
      'shirt', 't-shirt', 'tshirt', 'socks', 'jeans', 'jacket', 'shoes', 'dress', 'kurta',
      'trouser', 'pant', 'sweater', 'hoodie', 'cap', 'belt', 'sneaker', 'sandal',
    ],
  },
  {
    category: 'Electronics',
    locations: ['online', 'physical'],
    keywords: [
      'cable', 'charger', 'keyboard', 'mouse', 'headphone', 'earphone', 'earbud', 'adapter',
      'phone cover', 'power bank', 'usb', 'hdmi', 'battery', 'speaker', 'monitor', 'laptop',
      'memory card', 'pendrive', 'pen drive',
    ],
  },
];

export interface Inference {
  category: string | null;
  locations: BuyLocation[];
  confidence: 'high' | 'medium' | 'none';
}

const normalize = (s: string) => s.trim().toLowerCase();
const words = (s: string) => normalize(s).split(/[^a-z0-9]+/).filter(Boolean);

function ruleMatch(name: string): Rule | null {
  const key = normalize(name);
  let best: { rule: Rule; len: number } | null = null;
  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (key.includes(kw) && (!best || kw.length > best.len)) {
        best = { rule, len: kw.length };
      }
    }
  }
  return best?.rule ?? null;
}

/** Apply learned per-word location adjustments on top of a base location set. */
function applyLocationLearning(name: string, base: BuyLocation[], corrections: Corrections): BuyLocation[] {
  const scoreByLocation: Partial<Record<BuyLocation, number>> = {};
  for (const w of words(name)) {
    const s = corrections.wordLocationScore[w];
    if (!s) continue;
    for (const loc of Object.keys(s) as BuyLocation[]) {
      scoreByLocation[loc] = (scoreByLocation[loc] ?? 0) + (s[loc] ?? 0);
    }
  }
  if (Object.keys(scoreByLocation).length === 0) return base;

  const result = new Set(base);
  for (const loc of Object.keys(scoreByLocation) as BuyLocation[]) {
    const score = scoreByLocation[loc] ?? 0;
    if (score >= 2) result.add(loc);
    else if (score <= -2) result.delete(loc);
  }
  return Array.from(result);
}

function learnedCategory(name: string, corrections: Corrections): string | null {
  const tally: Record<string, number> = {};
  for (const w of words(name)) {
    const s = corrections.wordCategoryScore[w];
    if (!s) continue;
    for (const cat of Object.keys(s)) tally[cat] = (tally[cat] ?? 0) + s[cat];
  }
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  return entries.length > 0 && entries[0][1] >= 2 ? entries[0][0] : null;
}

export function inferItem(name: string, corrections: Corrections): Inference {
  const key = normalize(name);
  const exact = corrections.exact[key];
  if (exact) {
    return {
      category: exact.category ?? null,
      locations: exact.locations ?? [],
      confidence: 'high',
    };
  }

  const rule = ruleMatch(name);
  if (rule) {
    return {
      category: rule.category,
      locations: applyLocationLearning(name, rule.locations, corrections),
      confidence: 'high',
    };
  }

  const guessedCategory = learnedCategory(name, corrections);
  const guessedLocations = applyLocationLearning(name, [], corrections);
  if (guessedCategory || guessedLocations.length > 0) {
    return { category: guessedCategory, locations: guessedLocations, confidence: 'medium' };
  }

  return { category: null, locations: [], confidence: 'none' };
}

export function emptyCorrections(): Corrections {
  return { exact: {}, wordLocationScore: {}, wordCategoryScore: {} };
}

/**
 * Called whenever the user manually sets category/locations for an item —
 * either right after quick-add, or later via edit. Remembers the exact name
 * and nudges word-level scores so similar future items improve too.
 */
export function learnFromCorrection(
  name: string,
  corrections: Corrections,
  chosen: { category: string | null; locations: BuyLocation[] },
  previous?: { category: string | null; locations: BuyLocation[] },
): Corrections {
  const key = normalize(name);
  const next: Corrections = {
    exact: { ...corrections.exact, [key]: { category: chosen.category, locations: chosen.locations } },
    wordLocationScore: { ...corrections.wordLocationScore },
    wordCategoryScore: { ...corrections.wordCategoryScore },
  };

  const prevLocations = new Set(previous?.locations ?? []);
  const nextLocations = new Set(chosen.locations);
  const wordList = words(name);

  for (const w of wordList) {
    const scores = { ...(next.wordLocationScore[w] ?? {}) };
    for (const loc of nextLocations) {
      if (!prevLocations.has(loc)) scores[loc] = (scores[loc] ?? 0) + 1;
    }
    for (const loc of prevLocations) {
      if (!nextLocations.has(loc)) scores[loc] = (scores[loc] ?? 0) - 1;
    }
    next.wordLocationScore[w] = scores;
  }

  if (chosen.category && chosen.category !== previous?.category) {
    for (const w of wordList) {
      const scores = { ...(next.wordCategoryScore[w] ?? {}) };
      scores[chosen.category] = (scores[chosen.category] ?? 0) + 1;
      next.wordCategoryScore[w] = scores;
    }
  }

  return next;
}
