import { useApp } from '../store/AppStore';
import { ItemRow } from '../components/ItemRow';
import { EmptyState } from '../components/EmptyState';
import type { Item } from '../types';

export function SomedayPage({ onOpenItem, onAdd }: { onOpenItem: (item: Item) => void; onAdd: () => void }) {
  const { state, markBought, moveToBuy } = useApp();
  const items = state.items.filter((i) => i.status === 'someday');

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Someday Soon</h1>
        <p className="page-subtitle">Things you'll get around to.</p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          glyph="🌤️"
          title="Nothing parked here yet."
          message="Save things you want later, without cluttering Buy."
          actionLabel="Add something"
          onAction={onAdd}
        />
      ) : (
        <div className="section">
          {items.map((it) => (
            <ItemRow
              key={it.id}
              item={it}
              onBought={() => markBought(it.id)}
              onOpen={() => onOpenItem(it)}
              secondaryAction={{ label: '🛍️ Move to Buy', onClick: () => moveToBuy(it.id) }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
