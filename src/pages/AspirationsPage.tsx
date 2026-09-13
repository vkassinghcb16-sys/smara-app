import { useApp } from '../store/AppStore';
import { AspirationCard } from '../components/AspirationCard';
import { EmptyState } from '../components/EmptyState';
import type { Aspiration } from '../types';

export function AspirationsPage({ onEdit, onAdd }: { onEdit: (a: Aspiration) => void; onAdd: () => void }) {
  const { state } = useApp();
  const items = [...state.aspirations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Aspirations</h1>
        <p className="page-subtitle">Things you're working toward.</p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          glyph="✨"
          title="Keep a few dreams here."
          message="A handful of things worth working toward — not a wishlist."
          actionLabel="Add aspiration"
          onAction={onAdd}
        />
      ) : (
        <div style={{ marginTop: 16 }}>
          {items.map((a) => (
            <AspirationCard key={a.id} aspiration={a} onEdit={() => onEdit(a)} />
          ))}
        </div>
      )}
    </div>
  );
}
