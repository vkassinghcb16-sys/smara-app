import type { Item } from '../types';
import { useSwipeToBuy } from '../hooks/useSwipeToBuy';

interface Props {
  item: Item;
  onBought: () => void;
  onOpen: () => void;
  secondaryAction?: { label: string; onClick: () => void };
}

export function ItemRow({ item, onBought, onOpen, secondaryAction }: Props) {
  const { dx, dragging, leaving, handlers } = useSwipeToBuy({ onCommit: onBought, threshold: 96 });

  return (
    <div className="item-row-wrap">
      <div className="item-row-backdrop" aria-hidden="true">
        <span>✓</span>
        <span>Bought</span>
      </div>
      <div
        className={`item-row${dragging ? ' dragging' : ''}${leaving ? ' leaving' : ''}`}
        style={{ transform: `translateX(${dx}px)`, transition: dragging ? 'none' : 'transform 0.22s ease' }}
        {...handlers}
      >
        <button
          type="button"
          className="item-check"
          aria-label={`Mark ${item.name} as bought`}
          onClick={onBought}
        >
          ✓
        </button>
        <button type="button" className="item-body" onClick={onOpen}>
          <div className="item-name">{item.name}</div>
          <div className="item-meta">
            {item.priority === 'high' && <span className="priority-dot" aria-label="High priority" />}
            {item.category ? <span className="tag">{item.category}</span> : <span className="tag muted">Unsorted</span>}
            {item.quantity && item.quantity > 1 && <span className="qty-badge">×{item.quantity}</span>}
          </div>
        </button>
        {secondaryAction && (
          <button
            type="button"
            className="promote-btn"
            onClick={(e) => {
              e.stopPropagation();
              secondaryAction.onClick();
            }}
          >
            {secondaryAction.label}
          </button>
        )}
        <span className="item-edit-affordance" aria-hidden="true">›</span>
      </div>
    </div>
  );
}
