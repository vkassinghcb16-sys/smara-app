import { useApp } from '../store/AppStore';
import { ItemRow } from '../components/ItemRow';
import { EmptyState } from '../components/EmptyState';
import { ALL_LOCATIONS, LOCATION_META } from '../types';
import type { BuyLocation, Item } from '../types';
import { groupByCategory } from '../lib/group';
import { greeting } from '../lib/format';

interface Props {
  onOpenItem: (item: Item) => void;
  onImHere: () => void;
  onAdd: () => void;
}

function scrollToSection(loc: BuyLocation) {
  document.getElementById(`section-${loc}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function BuyPage({ onOpenItem, onImHere, onAdd }: Props) {
  const { state, markBought } = useApp();
  const buyItems = state.items.filter((i) => i.status === 'buy');
  const unsorted = buyItems.filter((i) => i.locations.length === 0);

  return (
    <div>
      <header className="page-header">
        <div className="brand-row">
          <img src="/icons/icon-192.png" alt="" className="brand-mark" />
          <h1 className="page-title">Smara</h1>
        </div>
        <p className="page-subtitle">Remember it. Get it later.</p>
        <p className="page-subtitle-count">
          {greeting()} — {buyItems.length} {buyItems.length === 1 ? 'thing' : 'things'} on your mind
        </p>
      </header>

      <button className="im-here-btn" onClick={onImHere}>
        <span className="pin-dot" aria-hidden="true" />
        I'm Here — show me what to buy
      </button>

      {buyItems.length === 0 ? (
        <EmptyState
          glyph="🛍️"
          title="Nothing to buy right now."
          message="Enjoy the rare moment."
          actionLabel="Add something"
          onAction={onAdd}
        />
      ) : (
        <>
          <div className="context-row">
            {ALL_LOCATIONS.map((loc) => {
              const count = buyItems.filter((i) => i.locations.includes(loc)).length;
              const cssKey = loc === 'quick_commerce' ? 'qc' : loc;
              return (
                <button key={loc} className={`context-card ${cssKey}`} onClick={() => scrollToSection(loc)}>
                  <span className="emoji">{LOCATION_META[loc].emoji}</span>
                  <span className="count">{count}</span>
                  <span className="label">{LOCATION_META[loc].short}</span>
                </button>
              );
            })}
          </div>

          {ALL_LOCATIONS.map((loc) => {
            const items = buyItems.filter((i) => i.locations.includes(loc));
            if (items.length === 0) return null;
            const groups = groupByCategory(items);
            return (
              <div className="section" id={`section-${loc}`} key={loc}>
                <div className="section-heading">
                  <span className="emoji">{LOCATION_META[loc].emoji}</span>
                  <h2>{LOCATION_META[loc].label}</h2>
                  <span className="n">{items.length}</span>
                </div>
                {groups.map(([cat, its]) => (
                  <div className="category-group" key={cat}>
                    <div className="category-label">{cat}</div>
                    {its.map((it) => (
                      <ItemRow key={`${loc}-${it.id}`} item={it} onBought={() => markBought(it.id, loc)} onOpen={() => onOpenItem(it)} />
                    ))}
                  </div>
                ))}
              </div>
            );
          })}

          {unsorted.length > 0 && (
            <div className="section">
              <div className="section-heading">
                <span className="emoji">🗂️</span>
                <h2>Not Sorted Yet</h2>
                <span className="n">{unsorted.length}</span>
              </div>
              {unsorted.map((it) => (
                <ItemRow key={it.id} item={it} onBought={() => markBought(it.id)} onOpen={() => onOpenItem(it)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
