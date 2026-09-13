import { useMemo, useRef, useState } from 'react';
import { Sheet } from './Sheet';
import { useApp } from '../store/AppStore';
import { inferItem } from '../lib/inference';
import { ALL_LOCATIONS, KNOWN_CATEGORIES, LOCATION_META } from '../types';
import type { BuyLocation, Item } from '../types';

interface Props {
  onClose: () => void;
  onAdded: (info: { id: string; name: string; category: string | null; locations: BuyLocation[] }) => void;
}

export function QuickAddSheet({ onClose, onAdded }: Props) {
  const { state, addItem, editItem } = useApp();
  const [name, setName] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [locations, setLocations] = useState<BuyLocation[]>([]);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [locationsTouched, setLocationsTouched] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [highPriority, setHighPriority] = useState(false);
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => inferItem(name || ' ', state.corrections), [name, state.corrections]);
  const effectiveCategory = categoryTouched ? category : preview.category;
  const effectiveLocations = locationsTouched ? locations : preview.locations;

  const openDetails = () => {
    if (!showDetails) {
      setCategory(preview.category);
      setLocations(preview.locations);
    }
    setShowDetails((v) => !v);
  };

  const toggleLocation = (loc: BuyLocation) => {
    setLocationsTouched(true);
    setLocations((prev) => (prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]));
  };

  const pickCategory = (cat: string) => {
    setCategoryTouched(true);
    setCategory((prev) => (prev === cat ? null : cat));
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const created = addItem(trimmed);

    const patch: Partial<Item> = {};
    let learn = false;
    if (showDetails) {
      if (categoryTouched && category !== created.category) {
        patch.category = category;
        learn = true;
      }
      if (locationsTouched && JSON.stringify(locations) !== JSON.stringify(created.locations)) {
        patch.locations = locations;
        learn = true;
      }
      if (quantity > 1) patch.quantity = quantity;
      if (highPriority) patch.priority = 'high';
      if (notes.trim()) patch.notes = notes.trim();
      if (link.trim()) patch.link = link.trim();
    }

    let finalCategory = created.category;
    let finalLocations = created.locations;
    if (Object.keys(patch).length > 0) {
      editItem(created.id, patch, { learn });
      if (patch.category !== undefined) finalCategory = patch.category;
      if (patch.locations !== undefined) finalLocations = patch.locations;
    }

    onAdded({ id: created.id, name: trimmed, category: finalCategory, locations: finalLocations });
    onClose();
  };

  return (
    <Sheet title="What do you need?" onClose={onClose}>
      <input
        ref={inputRef}
        autoFocus
        className="text-input quick-add-input"
        placeholder="e.g. Shampoo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
        aria-label="Item name"
      />

      {name.trim() && (
        <div className="chip-row" style={{ marginTop: 12 }}>
          {effectiveCategory && <span className="tag">{effectiveCategory}</span>}
          {effectiveLocations.map((loc) => (
            <span key={loc} className="tag">
              {LOCATION_META[loc].emoji} {LOCATION_META[loc].short}
            </span>
          ))}
          {!effectiveCategory && effectiveLocations.length === 0 && (
            <span className="tag muted">No suggestion yet — that's okay</span>
          )}
        </div>
      )}

      <button type="button" className="details-toggle" onClick={openDetails}>
        {showDetails ? '▾' : '▸'} Add details (optional)
      </button>

      {showDetails && (
        <div className="fade-in-up">
          <span className="field-label">Category</span>
          <div className="chip-row">
            {KNOWN_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`chip${effectiveCategory === cat ? ' selected' : ''}`}
                onClick={() => pickCategory(cat)}
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
                className={`chip${effectiveLocations.includes(loc) ? ` selected ${loc === 'quick_commerce' ? 'qc' : loc}` : ''}`}
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
            <button
              type="button"
              className={`chip${highPriority ? ' selected' : ''}`}
              onClick={() => setHighPriority((v) => !v)}
            >
              🔥 High priority
            </button>
          </div>

          <span className="field-label">Notes</span>
          <textarea
            className="text-area"
            placeholder="Any details worth remembering…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <span className="field-label">Link</span>
          <input
            className="text-input"
            placeholder="https://…"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
      )}

      <div className="sheet-actions">
        <button type="button" className="btn-block ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-block primary" disabled={!name.trim()} onClick={handleSubmit}>
          Add
        </button>
      </div>
    </Sheet>
  );
}
