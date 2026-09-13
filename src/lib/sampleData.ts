import type { AppState, Item, Aspiration } from '../types';
import { makeId } from './id';
import { emptyCorrections } from './inference';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

function item(partial: Omit<Item, 'id' | 'status' | 'createdAt'> & { status?: Item['status']; createdAt?: string }): Item {
  return {
    id: makeId(),
    status: 'buy',
    createdAt: daysAgo(2),
    ...partial,
  };
}

export function buildSampleState(): AppState {
  const items: Item[] = [
    // Quick Commerce
    item({ name: 'Almonds', category: 'Groceries', locations: ['quick_commerce'] }),
    item({ name: 'Bananas', category: 'Groceries', locations: ['quick_commerce'] }),
    item({ name: 'Oats', category: 'Groceries', locations: ['quick_commerce'] }),
    item({ name: 'Face Wash', category: 'Personal Care', locations: ['quick_commerce', 'online'] }),
    item({ name: 'Garbage Bags', category: 'Home', locations: ['quick_commerce', 'physical'] }),
    item({ name: 'Detergent', category: 'Home', locations: ['quick_commerce', 'physical'] }),
    // Shared item — one record, two contexts (Quick Commerce + Online)
    item({ name: 'Shampoo', category: 'Personal Care', locations: ['quick_commerce', 'online'] }),

    // Physical
    item({ name: 'Black Socks', category: 'Clothing', locations: ['physical', 'online'] }),
    item({ name: 'Formal Shirt', category: 'Clothing', locations: ['physical', 'online'] }),
    item({ name: 'Phone Cover', category: 'Electronics', locations: ['physical', 'online'] }),
    item({ name: 'Bedsheet', category: 'Home', locations: ['physical', 'online'] }),

    // Online
    item({ name: 'USB-C Cable', category: 'Electronics', locations: ['online', 'physical'] }),
    item({ name: 'Running Shoes', category: 'Clothing', locations: ['online', 'physical'] }),
    item({ name: 'Mechanical Keyboard', category: 'Electronics', locations: ['online', 'physical'] }),

    // No category / location — proves the app never blocks on unknown items
    item({ name: 'Buy new weird adapter', category: null, locations: [] }),

    // Someday Soon
    item({ name: 'New Backpack', category: null, locations: ['online', 'physical'], status: 'someday' }),
    item({ name: 'Office Chair', category: null, locations: ['online', 'physical'], status: 'someday' }),
    item({ name: 'Winter Jacket', category: 'Clothing', locations: ['online', 'physical'], status: 'someday' }),

    // History
    item({
      name: 'USB Cable',
      category: 'Electronics',
      locations: ['online'],
      status: 'bought',
      createdAt: daysAgo(3),
      purchasedAt: hoursAgo(4.7),
      purchasedFrom: 'online',
    }),
    item({
      name: 'Almonds (pack)',
      category: 'Groceries',
      locations: ['quick_commerce'],
      status: 'bought',
      createdAt: daysAgo(3),
      purchasedAt: hoursAgo(4.9),
      purchasedFrom: 'quick_commerce',
    }),
    item({
      name: 'Black T-shirt',
      category: 'Clothing',
      locations: ['physical'],
      status: 'bought',
      createdAt: daysAgo(4),
      purchasedAt: daysAgo(1),
      purchasedFrom: 'physical',
    }),
  ];

  const aspirations: Aspiration[] = [
    {
      id: makeId(),
      title: 'Dream Motorcycle',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=80',
      url: 'https://www.youtube.com/results?search_query=royal+enfield+himalayan+review',
      note: 'Someday, the long ride north.',
      price: '₹2,50,000',
      createdAt: daysAgo(30),
    },
    {
      id: makeId(),
      title: 'Premium Camera',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80',
      note: 'For slow mornings and family trips.',
      price: '₹1,20,000',
      createdAt: daysAgo(20),
    },
    {
      id: makeId(),
      title: 'Dream Home',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      note: 'A quiet house with a big window for plants.',
      createdAt: daysAgo(10),
    },
  ];

  return { items, aspirations, corrections: emptyCorrections() };
}
