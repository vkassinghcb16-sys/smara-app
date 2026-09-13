interface Props {
  glyph: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ glyph, title, message, actionLabel, onAction }: Props) {
  return (
    <div className="empty-state">
      <div className="glyph" aria-hidden="true">{glyph}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && onAction && (
        <button className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
