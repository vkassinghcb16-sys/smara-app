import { useApp } from '../store/AppStore';
import { EmptyState } from '../components/EmptyState';
import { LOCATION_META } from '../types';
import { dayLabel, formatTime } from '../lib/format';

export function HistoryPage() {
  const { state, unmarkBought } = useApp();
  const bought = [...state.items]
    .filter((i) => i.status === 'bought' && i.purchasedAt)
    .sort((a, b) => new Date(b.purchasedAt!).getTime() - new Date(a.purchasedAt!).getTime());

  const groups = new Map<string, typeof bought>();
  for (const it of bought) {
    const label = dayLabel(it.purchasedAt!);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(it);
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">History</h1>
        <p className="page-subtitle">Your buying memory, at a glance.</p>
      </header>

      {bought.length === 0 ? (
        <EmptyState glyph="🕘" title="No history yet" message="Your buying history will appear here." />
      ) : (
        Array.from(groups.entries()).map(([label, its]) => (
          <div className="history-day" key={label}>
            <h2>{label}</h2>
            {its.map((it) => (
              <div className="history-item" key={it.id}>
                <span className="history-check" aria-hidden="true">✓</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="history-name">{it.name}</div>
                  <div className="history-sub">
                    <span>{formatTime(it.purchasedAt!)}</span>
                    {it.purchasedFrom && (
                      <>
                        <span>·</span>
                        <span>{LOCATION_META[it.purchasedFrom].emoji} {LOCATION_META[it.purchasedFrom].short}</span>
                      </>
                    )}
                    {it.category && (
                      <>
                        <span>·</span>
                        <span>{it.category}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="link-action"
                  style={{ flex: '0 0 auto', padding: '8px 12px', fontSize: 12 }}
                  onClick={() => unmarkBought(it.id)}
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
