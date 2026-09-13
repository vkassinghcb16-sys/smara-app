import { useState } from 'react';
import { Sheet } from './Sheet';
import { useApp } from '../store/AppStore';
import { ALL_LOCATIONS, KNOWN_CATEGORIES, LOCATION_META } from '../types';
import type { BuyLocation, Item } from '../types';

export function ItemEditSheet({ item, onClose }: { item: Item; onClose: () => void }) {
  const { editItem, deleteItem, moveToSomeday, moveToBuy, markBought } = useApp();
  const [category, setCategory] = useState<string | null>(item.category);
  const [locations, setLocations] = useState<BuyLocation[]>(item.locations);
  const [quantity, setQuantity] = useState(item.quantity ?? 1);
  const [highPriority, setHighPriority] = useState(item.priority === 'high');
  const [notes, setNotes] = useState(item.notes ?? '');
  const [link, setLink] = useState(item.link ?? '');

  const toggleLocation = (loc: BuyLocation) => {
    setLocations((prev) => (prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]));
  };

  const save = () => {
    const learn = category !== item.category || JSON.stringify(locations) !== JSON.stringify(item.locations);
    editItem(
      item.id,
      {
        category,
        locations,
        quantity: quantity > 1 ? quantity : undefined,
        priority: highPriority ? 'high' : undefined,
        notes: notes.trim() || undefined,
        link: link.trim() || undefined,
      },
      { learn },
    );
    onClose();
  };

  return (
    <Sheet title={item.name} onClose={onClose}>
      <span className="field-label">Category</span>
      <div className="chip-row">
        {KNOWN_CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat}
            className={`chip${category === cat ? ' selected' : ''}`}
            onClick={() => setCategory((prev) => (prev === cat ? null : cat))}
          >
            {cat}
          </button>
        ))}
      </div>

      <span className="field-label">Where will you buy this?</span>
      <div className="chip-row">
        {ALL_LOCATIONS.map((loc) => (
          <button
            type="button"
            key={loc}
            className={`chip${locations.includes(loc) ? ` selected ${loc === 'quick_commerce' ? 'qc' : loc}` : ''}`}
            onClick={() => toggleLocation(loc)}
          >
            {LOCATION_META[loc].emoji} {LOCATION_META[loc].short}
          </button>
        ))}
      </div>

      <span className="field-label">Quantity</span>
      <div className="stepper">
        <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
          −
        </button>
        <span className="val">{quantity}</span>
        <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
          +
        </button>
      </div>

      <span className="field-label">Priority</span>
      <div className="chip-row">
        <button type="button" className={`chip${highPriority ? ' selected' : ''}`} onClick={() => setHighPriority((v) => !v)}>
          🔥 High priority
        </button>
      </div>

      <span className="field-label">Notes</span>
      <textarea className="text-area" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <span className="field-label">Link</span>
      <input className="text-input" placeholder="https://…" value={link} onChange={(e) => setLink(e.target.value)} />

      <div className="sheet-actions">
        <button type="button" className="btn-block ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-block primary" onClick={save}>
          Save
        </button>
      </div>

      <div className="inline-actions">
        {item.status === 'someday' ? (
          <button
            type="button"
            className="link-action"
            onClick={() => {
              moveToBuy(item.id);
              onClose();
            }}
          >
            🛍️ Move to Buy
          </button>
        ) : (
          <button
            type="button"
            className="link-action"
            onClick={() => {
              moveToSomeday(item.id);
              onClose();
            }}
          >
            🌤️ Someday Soon
          </button>
        )}
        <button
          type="button"
          className="link-action"
          onClick={() => {
            markBought(item.id);
            onClose();
          }}
        >
          ✓ Mark Bought
        </button>
      </div>

      <button
        type="button"
        className="btn-block danger"
        style={{ width: '100%', marginTop: 10 }}
        onClick={() => {
          deleteItem(item.id);
          onClose();
        }}
      >
        Delete item
      </button>
    </Sheet>
  );
}
