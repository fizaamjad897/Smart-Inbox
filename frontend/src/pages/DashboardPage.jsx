import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import StatCard from '../components/StatCard.jsx';
import EmailTable from '../components/EmailTable.jsx';
import { CATEGORIES, CATEGORY_ORDER } from '../categories.js';

const REFRESH_MS = 15000;

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, today: 0, categories: {} });
  const [emails, setEmails] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [s, e] = await Promise.all([api.getStats(), api.getEmails({ category, q })]);
      setStats(s);
      setEmails(e);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, q]);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Overview</p>
          <h1 className="mt-3 font-display text-[32px] font-medium leading-tight tracking-tight text-ink">
            Your inbox at a glance
          </h1>
        </div>
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
          {stats.today ?? 0} today · {stats.total ?? 0} total
        </span>
      </div>

      {error && (
        <div className="mt-8 border border-hairline bg-surface px-4 py-3 font-mono text-[12px] text-[#b23b34]">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 border border-hairline sm:grid-cols-6">
        <div className="[&:not(:first-child)]:border-l border-hairline">
          <StatCard label="All" value={stats.total ?? 0} active={category === 'ALL'} onClick={() => setCategory('ALL')} />
        </div>
        {CATEGORY_ORDER.map((k) => (
          <div key={k} className="border-l border-hairline">
            <StatCard
              label={CATEGORIES[k].label}
              value={stats.categories?.[k] ?? 0}
              color={CATEGORIES[k].color}
              active={category === k}
              onClick={() => setCategory(k)}
            />
          </div>
        ))}
      </div>

      <div className="mb-6 mt-10 flex items-end justify-between gap-6">
        <label className="w-full max-w-md">
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="sender, subject, summary…"
            className="w-full border-0 border-b border-hairline bg-transparent pb-2 text-sm text-ink placeholder:text-muted/60 focus:border-ink"
          />
        </label>
        {category !== 'ALL' && (
          <button
            onClick={() => setCategory('ALL')}
            className="whitespace-nowrap pb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted underline underline-offset-4 hover:text-ink"
          >
            Clear filter
          </button>
        )}
      </div>

      {loading ? (
        <p className="py-20 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Loading</p>
      ) : (
        <EmailTable emails={emails} />
      )}
    </div>
  );
}
