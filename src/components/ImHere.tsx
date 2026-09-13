import { Sheet } from './Sheet';
import { ItemRow } from './ItemRow';
import { EmptyState } from './EmptyState';
import { useApp } from '../store/AppStore';
import { LOCATION_META } from '../types';
import type { BuyLocation, Item } from '../types';
import { groupByCategory } from '../lib/group';

export function ImHereChooserSheet({
  onClose,
  onChoose,
}: {
  onClose: () => void;
  onChoose: (loc: BuyLocation) => void;
}) {
  return (
    <Sheet title="I'm here — what can I buy?" onClose={onClose}>
      {(['quick_commerce', 'physical', 'online'] as BuyLocation[]).map((loc) => (
        <button
          key={loc}
          type="button"
          className={`here-choice ${loc === 'quick_commerce' ? 'qc' : loc}`}
          onClick={() => onChoose(loc)}
        >
          <span className="emoji" aria-hidden="true">{LOCATION_META[loc].emoji}</span>
          <div>
            <div className="title">{LOCATION_META[loc].label}</div>
            <div className="sub">Show everything I could buy here</div>
          </div>
        </button>
      ))}
    </Sheet>
  );
}

export function ImHereView({ location, onClose, onEdit }: { location: BuyLocation; onClose: () => void; onEdit: (item: Item) => void }) {
  const { state, markBought } = useApp();
  const items = state.items.filter((it) => it.status === 'buy' && it.locations.includes(location));
  const groups = groupByCategory(items);
  const meta = LOCATION_META[location];
  const cssKey = location === 'quick_commerce' ? 'qc' : location;

  return (
    <div className="here-view">
      <div className="here-view-inner">
        <div className={`here-header ${cssKey}`}>
          <button className="back-btn" onClick={onClose} aria-label="Back to Buy">
            ←
          </button>
          <div>
            <h1>{meta.emoji} {meta.label}</h1>
            <p>{items.length} {items.length === 1 ? 'thing' : 'things'} to buy</p>
          </div>
        </div>
        <div className="here-body">
          {items.length === 0 ? (
            <EmptyState glyph={meta.emoji} title="Nothing here right now" message={`No active items are tagged for ${meta.label.toLowerCase()}.`} />
          ) : (
            groups.map(([cat, its]) => (
              <div className="category-group" key={cat}>
                <div className="category-label">{cat}</div>
                {its.map((it) => (
                  <ItemRow key={it.id} item={it} onBought={() => markBought(it.id, location)} onOpen={() => onEdit(it)} />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
