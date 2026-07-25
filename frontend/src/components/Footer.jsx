const STACK = ['n8n', 'Groq · Llama 3.3', 'Express', 'MongoDB', 'React', 'Tailwind', 'Docker'];

function MarkInverted() {
  return (
    <span className="grid h-7 w-7 place-items-center rounded-lg bg-paper">
      <svg viewBox="0 0 100 100" className="h-[60%] w-[60%]" aria-hidden="true">
        <path
          d="M20 34 L50 56 L80 34"
          fill="none"
          stroke="#1c1b19"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <MarkInverted />
              <span className="font-display text-lg font-medium">Smart Inbox</span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-paper/60">
              An end-to-end AI email-triage pipeline: workflow automation, an LLM classifier, a
              REST API, and a live dashboard.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">Built with</p>
            <div className="mt-4 flex max-w-sm flex-wrap gap-2">
              {STACK.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-paper/20 px-3 py-1 font-mono text-[11px] tracking-[0.06em] text-paper/80"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-8 flex gap-6 font-mono text-[11px] uppercase tracking-[0.16em] text-paper/60">
              {/* Replace with your links */}
              <a href="#" className="transition-colors hover:text-paper">GitHub</a>
              <a href="#top" className="transition-colors hover:text-paper">Back to top</a>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-paper/15 pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-paper/40">
          Smart Inbox · designed &amp; built as a full-stack automation project
        </div>
      </div>
    </footer>
  );
}
