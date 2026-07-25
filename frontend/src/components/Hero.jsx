import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryBadge from './CategoryBadge.jsx';
import { colorFor } from '../categories.js';

const SAMPLES = [
  { subject: 'Production API returning 500s', from: 'ops@acme.io', category: 'URGENT' },
  { subject: 'Interested in a demo and pricing', from: 'sara@bigcorp.com', category: 'LEAD' },
  { subject: "Can't reset my password", from: 'jordan@user.net', category: 'SUPPORT' },
  { subject: '50% off this weekend only', from: 'news@deals.com', category: 'NEWSLETTER' }
];

const STATS = [
  ['5', 'Smart categories'],
  ['~1s', 'To classify'],
  ['1-click', 'Live demo']
];

function ClassifierCard() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % SAMPLES.length), 2400);
    return () => clearInterval(id);
  }, []);
  const s = SAMPLES[i];

  return (
    <div className="animate-float w-full max-w-xs">
      <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-[0_22px_50px_-30px_rgba(28,27,25,0.45)]">
        <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" />
            Incoming
          </span>
          <span>Groq</span>
        </div>

        <div key={i} className="swap-in">
          <p className="font-mono text-[10px] text-muted">{s.from}</p>
          <p className="mt-1 font-display text-[17px] font-medium leading-snug text-ink">{s.subject}</p>

          <div className="mt-5 flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Sorted</span>
            <span className="h-px flex-1" style={{ backgroundColor: colorFor(s.category) }} />
            <CategoryBadge category={s.category} />
          </div>
        </div>

        <div className="mt-4 flex gap-1.5">
          {SAMPLES.map((_, idx) => (
            <span
              key={idx}
              className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{ backgroundColor: idx === i ? colorFor(SAMPLES[idx].category) : '#e5e0d6' }}
            />
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
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-28">
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
              className="rounded-full bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition hover:bg-ink/85 active:scale-[0.97]"
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
          <ClassifierCard />
        </div>
      </div>
    </section>
  );
}
