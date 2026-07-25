import { CATEGORIES } from '../categories.js';

export default function CategoryBadge({ category }) {
  const key = (category || 'OTHER').toUpperCase();
  const { label, color } = CATEGORIES[key] || CATEGORIES.OTHER;
  return (
    <span
      className="inline-flex items-center gap-2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em]"
      style={{ color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
