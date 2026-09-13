import { useState } from 'react';
import { Sheet } from './Sheet';
import { useApp } from '../store/AppStore';
import type { Aspiration } from '../types';

export function AspirationEditSheet({ aspiration, onClose }: { aspiration: Aspiration | null; onClose: () => void }) {
  const { addAspiration, editAspiration, deleteAspiration } = useApp();
  const [title, setTitle] = useState(aspiration?.title ?? '');
  const [image, setImage] = useState(aspiration?.image ?? '');
  const [url, setUrl] = useState(aspiration?.url ?? '');
  const [note, setNote] = useState(aspiration?.note ?? '');
  const [price, setPrice] = useState(aspiration?.price ?? '');
  const [targetDate, setTargetDate] = useState(aspiration?.targetDate ?? '');

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const payload = {
      title: trimmed,
      image: image.trim() || undefined,
      url: url.trim() || undefined,
      note: note.trim() || undefined,
      price: price.trim() || undefined,
      targetDate: targetDate.trim() || undefined,
    };
    if (aspiration) editAspiration(aspiration.id, payload);
    else addAspiration(payload);
    onClose();
  };

  return (
    <Sheet title={aspiration ? 'Edit Aspiration' : 'New Aspiration'} onClose={onClose}>
      <span className="field-label">Title</span>
      <input className="text-input" placeholder="Dream Motorcycle" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />

      <span className="field-label">Image URL (optional)</span>
      <input className="text-input" placeholder="https://…" value={image} onChange={(e) => setImage(e.target.value)} />

      <span className="field-label">Link (optional)</span>
      <input
        className="text-input"
        placeholder="YouTube video, product page, article…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <span className="field-label">Note (optional)</span>
      <textarea className="text-area" placeholder="Someday." value={note} onChange={(e) => setNote(e.target.value)} />

      <span className="field-label">Price (optional)</span>
      <input className="text-input" placeholder="₹1,20,000" value={price} onChange={(e) => setPrice(e.target.value)} />

      <span className="field-label">Target date (optional)</span>
      <input className="text-input" placeholder="2027" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />

      <div className="sheet-actions">
        <button type="button" className="btn-block ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-block primary" disabled={!title.trim()} onClick={save}>
          Save
        </button>
      </div>

      {aspiration && (
        <button
          type="button"
          className="btn-block danger"
          style={{ width: '100%', marginTop: 10 }}
          onClick={() => {
            deleteAspiration(aspiration.id);
            onClose();
          }}
        >
          Remove
        </button>
      )}
    </Sheet>
  );
}
