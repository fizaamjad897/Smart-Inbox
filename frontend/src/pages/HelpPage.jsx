const SUPPORT = 'fizaamjad444@gmail.com';

const TIERS = [
  {
    n: '01',
    title: 'Instant: Simulate',
    google: 'No Google needed',
    body: 'Log in and open the Simulate tab. Type any email and Smart Inbox classifies and routes it using your rules, then drops it into your dashboard. This is the fastest way to see everything working.'
  },
  {
    n: '02',
    title: 'Concierge: Real inbox, set up for you',
    google: 'We handle the connection',
    body: 'Want your actual Gmail triaged? Email support and we will connect your inbox and wire your routing into the automation for you, with no OAuth screens on your end.'
  },
  {
    n: '03',
    title: 'Self-setup: Bring your own credentials',
    google: 'You connect it',
    body: 'Advanced users can connect their own Gmail, Groq key, and Discord webhooks by following the setup guide in the project README.'
  }
];

function Step({ children }) {
  return <li className="border-b border-hairline py-3 text-[14px] leading-relaxed text-ink/80">{children}</li>;
}

export default function HelpPage() {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Help &amp; manual</p>
      <h1 className="mt-3 font-display text-[32px] font-medium leading-tight tracking-tight text-ink">
        How to use Smart Inbox
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink/70">
        Three ways to get your mail sorted. Pick the one that fits how far you want to go.
      </p>

      {/* tiers */}
      <div className="mt-10 space-y-px overflow-hidden rounded-2xl border border-hairline bg-hairline">
        {TIERS.map((t) => (
          <div key={t.n} className="bg-paper p-6">
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted">{t.n}</span>
                <h2 className="font-display text-xl font-medium text-ink">{t.title}</h2>
              </div>
              <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{t.google}</span>
            </div>
            <p className="mt-3 pl-9 text-[14px] leading-relaxed text-ink/70">{t.body}</p>
          </div>
        ))}
      </div>

      {/* quick start */}
      <div className="mt-12">
        <h2 className="font-display text-xl font-medium text-ink">Quick start</h2>
        <ol className="mt-4 list-inside list-decimal border-t border-hairline">
          <Step>Open <span className="font-medium text-ink">Settings</span> and shape your categories: names, colours, and keywords.</Step>
          <Step>Paste a <span className="font-medium text-ink">Discord webhook</span> under Routing if you want alerts, then save.</Step>
          <Step>Go to <span className="font-medium text-ink">Simulate</span>, send a test email, and watch it get classified.</Step>
          <Step>Check the <span className="font-medium text-ink">Dashboard</span>. Your email is there, filtered by category.</Step>
        </ol>
      </div>

      {/* support */}
      <div className="mt-12 rounded-2xl bg-ink p-8 text-paper">
        <h2 className="font-display text-2xl font-medium">Want your real inbox connected?</h2>
        <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-paper/70">
          Reach out and we will set up Gmail, classification, and routing for your account. You
          do not need to touch any Google settings.
        </p>
        <a
          href={`mailto:${SUPPORT}?subject=Smart%20Inbox%20-%20connect%20my%20real%20inbox`}
          className="mt-6 inline-block rounded-full bg-paper px-6 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition hover:bg-paper/90"
        >
          Contact support
        </a>
        <p className="mt-4 font-mono text-[11px] tracking-[0.08em] text-paper/50">{SUPPORT}</p>
      </div>

      {/* faq */}
      <div className="mt-12">
        <h2 className="font-display text-xl font-medium text-ink">Good to know</h2>
        <dl className="mt-4 space-y-5">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Is my data shared?</dt>
            <dd className="mt-1.5 text-[14px] leading-relaxed text-ink/80">No. Every account only sees its own emails and settings.</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">What model does the classifier use?</dt>
            <dd className="mt-1.5 text-[14px] leading-relaxed text-ink/80">Llama 3.3 70B via Groq, with a keyword fallback so it never hard-fails.</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Do I need to connect Google to try it?</dt>
            <dd className="mt-1.5 text-[14px] leading-relaxed text-ink/80">Not at all. Simulate works with zero Google connection.</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
