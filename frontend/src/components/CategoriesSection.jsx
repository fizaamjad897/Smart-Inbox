import Reveal from './Reveal.jsx';
import { CATEGORIES, CATEGORY_ORDER } from '../categories.js';

const COPY = {
  URGENT: ['Outages, crashes, anything time-critical.', 'Instant Discord alert'],
  LEAD: ['Buying signals — pricing, demos, partnerships.', 'Enriched with company, interest & value'],
  SUPPORT: ['Help requests, logins, bugs.', 'A reply drafted automatically'],
  NEWSLETTER: ['Promotions and marketing blasts.', 'Logged, kept out of your way'],
  OTHER: ['Everything that does not fit the rest.', 'Filed for reference']
};

export default function CategoriesSection() {
  return (
    <section id="categories" className="border-b border-hairline bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">What it sorts</p>
          <h2 className="mt-4 max-w-2xl font-display text-[34px] font-medium leading-tight tracking-tight text-ink sm:text-[42px]">
            Five categories, each with its own reflex.
          </h2>
        </Reveal>

        <div className="mt-14 border-t border-hairline">
          {CATEGORY_ORDER.map((k, idx) => {
            const { label, color } = CATEGORIES[k];
            const [desc, action] = COPY[k];
            return (
              <Reveal key={k} delay={idx * 70}>
                <div className="group grid grid-cols-1 items-baseline gap-4 border-b border-hairline py-7 sm:grid-cols-[220px_1fr_auto]">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-display text-xl font-medium text-ink">{label}</span>
                  </div>
                  <p className="text-[14px] leading-relaxed text-ink/70">{desc}</p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color }}>
                    {action}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
