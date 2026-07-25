import { Link } from 'react-router-dom';
import BlockMosaic from './BlockMosaic.jsx';
import { CATEGORIES, CATEGORY_ORDER } from '../categories.js';

const STATS = [
  ['5', 'Smart categories'],
  ['~1s', 'To classify'],
  ['1-click', 'Live demo']
];

function TriageCard() {
  return (
    <div className="animate-float w-full max-w-md">
      <div className="rounded-3xl border border-hairline bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(28,27,25,0.4)] sm:p-6">
        <div className="mb-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
            Live triage
          </span>
          <span>Groq · Llama 3.3</span>
        </div>

        <BlockMosaic />

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
          {CATEGORY_ORDER.map((k) => (
            <span key={k} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CATEGORIES[k].color }} />
              {CATEGORIES[k].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-hairline">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{ backgroundImage: 'radial-gradient(#1c1b1912 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-28">
        <div className="hero-enter">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            AI email triage · built on n8n
          </span>

          <h1 className="mt-6 font-display text-[38px] font-medium leading-[1.05] tracking-tight text-ink sm:text-[52px] lg:text-[58px]">
            Your inbox, triaged the moment it arrives.
          </h1>

          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink/70">
            Smart Inbox reads every incoming email, classifies it with an LLM, and routes it where it
            belongs. Urgent alerts go to Discord, leads get enriched and logged, support replies are
            drafted for you, and the whole flow streams to a live dashboard.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className="rounded-full bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition hover:bg-ink/85"
            >
              Try the live demo
            </Link>
            <a
              href="#how"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted underline underline-offset-[6px] transition-colors hover:text-ink"
            >
              See how it works
            </a>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-6 border-t border-hairline pt-8 sm:gap-x-12">
            {STATS.map(([v, l]) => (
              <div key={l}>
                <dd className="font-display text-3xl font-medium tabular-nums text-ink">{v}</dd>
                <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{l}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex justify-center lg:justify-end">
          <TriageCard />
        </div>
      </div>
    </section>
  );
}
