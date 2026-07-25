import { Link } from 'react-router-dom';
import Reveal from './Reveal.jsx';

export default function DemoCTA() {
  return (
    <section id="demo" className="border-b border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-paper sm:px-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{ backgroundImage: 'radial-gradient(#f6f4ef 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />
            <div className="relative max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/50">See it live</p>
              <h2 className="mt-4 font-display text-[34px] font-medium leading-tight tracking-tight sm:text-[42px]">
                Open the working dashboard and classify an email yourself.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-paper/70">
                A demo account is preloaded with sorted mail. Log in, then use the{' '}
                <span className="text-paper">Simulate</span> box to type any email and watch your
                own rules tag and route it in real time — no signup, no Google connection.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  to="/login"
                  className="rounded-full bg-paper px-6 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition hover:bg-paper/90"
                >
                  Open the live demo
                </Link>
                <span className="font-mono text-[11px] tracking-[0.08em] text-paper/50">
                  demo@smartinbox.app · demo1234
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
