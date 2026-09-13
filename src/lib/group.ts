import type { Item } from '../types';

export function groupByCategory(items: Item[]): [string, Item[]][] {
  const map = new Map<string, Item[]>();
  for (const it of items) {
    const key = it.category ?? 'Other';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  return Array.from(map.entries());
}
