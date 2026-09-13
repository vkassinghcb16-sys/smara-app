export function Fab({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="fab" onClick={onClick} aria-label={label}>
      <span aria-hidden="true">+</span>
    </button>
  );
}
