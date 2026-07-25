import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import CategoryBadge from '../components/CategoryBadge.jsx';
import { colorFor } from '../categories.js';

const EXAMPLES = [
  { label: 'Outage', from: 'ops@acme.io', subject: 'Production database is down', body: 'Everything is returning 500s, customers affected, need this fixed immediately.' },
  { label: 'Sales lead', from: 'sara@bigcorp.com', subject: 'Pricing for 300 seats + demo', body: 'We have budget approved this quarter and would love a demo next week.' },
  { label: 'Support', from: 'jordan@user.net', subject: 'Cannot log in to my account', body: 'The password reset link keeps expiring, can you help?' },
  { label: 'Promo', from: 'news@deals.com', subject: 'Weekend flash sale, 50% off', body: 'Huge discounts on everything. Unsubscribe anytime.' }
];

export default function SimulatePage() {
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const fill = (ex) => {
    setFrom(ex.from);
    setSubject(ex.subject);
    setBody(ex.body);
    setResult(null);
    setError(null);
  };

  async function classify(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setResult(await api.simulate({ from, subject, body }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Simulate</p>
      <h1 className="mt-3 font-display text-[32px] font-medium leading-tight tracking-tight text-ink">
        Send an email through your rules
      </h1>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink/70">
        Type any email below. Smart Inbox classifies it with your categories, routes it, and drops
        it into your dashboard, exactly what happens with real mail.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.8fr]">
        <form onSubmit={classify} className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => fill(ex)}
                className="rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition hover:border-ink hover:text-ink"
              >
                {ex.label}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">From</span>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="sender@example.com"
              className="w-full border-0 border-b border-hairline bg-transparent pb-2 text-sm text-ink focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's it about?"
              className="w-full border-0 border-b border-hairline bg-transparent pb-2 text-sm text-ink focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Body</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Paste or write the email…"
              className="w-full resize-none border border-hairline bg-surface p-3 text-sm text-ink focus:border-ink"
            />
          </label>

          {error && <p className="font-mono text-[12px] text-[#b23b34]">{error}</p>}

          <button
            type="submit"
            disabled={busy || (!subject && !body)}
            className="rounded-full bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition hover:bg-ink/85 disabled:opacity-40"
          >
            {busy ? 'Classifying…' : 'Classify email'}
          </button>
        </form>

        <div>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Result</p>
          {result ? (
            <div className="rounded-2xl border border-hairline bg-surface p-6" style={{ boxShadow: `inset 3px 0 0 ${colorFor(result.category)}` }}>
              <div className="flex items-center justify-between">
                <CategoryBadge category={result.category} />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  {result.routed ? 'Routed to Discord' : 'Stored'}
                </span>
              </div>
              <p className="mt-5 font-display text-lg font-medium leading-snug text-ink">
                {result.email?.subject}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted">{result.email?.sender}</p>
              {result.email?.snippet && (
                <p className="mt-4 text-[13px] leading-relaxed text-ink/70">{result.email.snippet}</p>
              )}
              <Link
                to="/app"
                className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-ink underline underline-offset-4"
              >
                View in dashboard →
              </Link>
            </div>
          ) : (
            <div className="grid place-items-center rounded-2xl border border-dashed border-hairline bg-surface/50 px-6 py-16 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Your classification will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
