import type { Aspiration } from '../types';

const FALLBACK_EMOJIS = ['✨', '🌙', '🎯', '🚀', '🌅', '💫'];
const fallbackFor = (title: string) => FALLBACK_EMOJIS[title.length % FALLBACK_EMOJIS.length];

function linkKind(url: string): { icon: string; label: string } {
  if (/youtube\.com|youtu\.be/.test(url)) return { icon: '▶', label: 'Watch' };
  return { icon: '🔗', label: 'Open' };
}

export function AspirationCard({ aspiration, onEdit }: { aspiration: Aspiration; onEdit: () => void }) {
  const link = aspiration.url ? linkKind(aspiration.url) : null;

  return (
    <div className="aspiration-card">
      {aspiration.image ? (
        <img className="aspiration-img" src={aspiration.image} alt="" />
      ) : (
        <div className="aspiration-fallback" aria-hidden="true">
          {fallbackFor(aspiration.title)}
        </div>
      )}
      <div className="aspiration-scrim" aria-hidden="true" />
      <button className="aspiration-edit" onClick={onEdit} aria-label={`Edit ${aspiration.title}`}>
        ✎
      </button>
      <div className="aspiration-content">
        <h3 className="aspiration-title">{aspiration.title}</h3>
        {aspiration.note && <p className="aspiration-note">“{aspiration.note}”</p>}
        {(aspiration.price || aspiration.targetDate) && (
          <div className="aspiration-meta-row">
            {aspiration.price && <span className="aspiration-pill">{aspiration.price}</span>}
            {aspiration.targetDate && <span className="aspiration-pill">🎯 {aspiration.targetDate}</span>}
          </div>
        )}
        <div className="aspiration-actions">
          {link && (
            <a
              className="aspiration-action primary"
              href={aspiration.url}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              {link.icon} {link.label}
            </a>
          )}
          <button className="aspiration-action" onClick={onEdit}>
            📝 My Note
          </button>
        </div>
      </div>
    </div>
  );
}
