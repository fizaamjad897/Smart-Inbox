// A single cell in the overview rail — a large tabular figure over a
// mono caption, with an ink underline when it's the active filter.
export default function StatCard({ label, value, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-start px-4 py-5 text-left transition-colors ${
        active ? 'bg-surface' : 'hover:bg-surface/60'
      }`}
    >
      <span className="font-display text-[28px] font-medium leading-none tabular-nums text-ink">
        {value}
      </span>
      <span
        className={`mt-2.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] ${
          active ? 'text-ink' : 'text-muted'
        }`}
      >
        {color && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />}
        {label}
      </span>
      <span
        className="absolute inset-x-0 bottom-0 h-[2px]"
        style={{ backgroundColor: active ? '#1c1b19' : 'transparent' }}
      />
    </button>
  );
}
