export type Tab = 'buy' | 'someday' | 'aspirations' | 'history';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'buy', label: 'BUY', icon: '🛍️' },
  { key: 'someday', label: 'SOMEDAY', icon: '🌤️' },
  { key: 'aspirations', label: 'ASPIRE', icon: '✨' },
  { key: 'history', label: 'HISTORY', icon: '🕘' },
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={`nav-btn${active === t.key ? ' active' : ''}`}
          onClick={() => onChange(t.key)}
          aria-current={active === t.key ? 'page' : undefined}
        >
          <span className="icon" aria-hidden="true">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
