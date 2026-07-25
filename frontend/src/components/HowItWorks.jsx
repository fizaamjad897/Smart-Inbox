import Reveal from './Reveal.jsx';

const STEPS = [
  {
    n: '01',
    title: 'Capture',
    body: 'An n8n Gmail trigger polls your inbox for unread mail and normalises each message.',
    tag: 'n8n · Gmail'
  },
  {
    n: '02',
    title: 'Classify',
    body: 'Llama 3.3 70B on Groq reads the subject and body and tags it in a single, sub-second call.',
    tag: 'Groq · Llama 3.3'
  },
  {
    n: '03',
    title: 'Route',
    body: 'Urgent pings Discord, leads get enriched with company and value, support gets a drafted reply.',
    tag: 'Discord · Sheets'
  },
  {
    n: '04',
    title: 'Surface',
    body: 'Every processed email is upserted to a MongoDB-backed API and streamed to this dashboard.',
    tag: 'MongoDB · API'
  }
];

export default function HowItWorks() {
  return (
    <section id="how" className="border-b border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">The pipeline</p>
          <h2 className="mt-4 max-w-2xl font-display text-[34px] font-medium leading-tight tracking-tight text-ink sm:text-[42px]">
            From raw inbox to sorted, four steps end to end.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, idx) => (
            <Reveal key={s.n} delay={idx * 90} className="bg-paper">
              <div className="flex h-full flex-col p-7">
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted">{s.n}</span>
                <h3 className="mt-5 font-display text-xl font-medium text-ink">{s.title}</h3>
                <p className="mt-3 flex-1 text-[13px] leading-relaxed text-ink/70">{s.body}</p>
                <span className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {s.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
