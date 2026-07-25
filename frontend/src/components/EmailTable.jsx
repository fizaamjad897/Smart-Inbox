import { useState } from 'react';
import CategoryBadge from './CategoryBadge.jsx';
import { colorFor } from '../categories.js';

function when(email) {
  if (email.timestamp) return email.timestamp;
  if (email.received_at) return email.received_at.slice(0, 16).replace('T', ' ');
  return '';
}

function Detail({ label, children, mono = false }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className={`text-[13px] leading-relaxed text-ink/90 ${mono ? 'font-mono' : ''}`}>{children}</p>
    </div>
  );
}

function Card({ email, index }) {
  const [open, setOpen] = useState(false);
  const color = colorFor(email.category);
  const hasDetail = email.summary || email.draft || email.snippet;
  const meta =
    email.company ||
    (email.interest_level
      ? `${email.interest_level}${email.estimated_value ? ` · ${email.estimated_value}` : ''}`
      : '');

  return (
    <div
      className="block-in overflow-hidden rounded-2xl border border-hairline bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-32px_rgba(28,27,25,0.5)]"
      style={{ animationDelay: `${Math.min(index, 14) * 45}ms`, borderLeft: `3px solid ${color}` }}
    >
      <button
        onClick={() => hasDetail && setOpen((o) => !o)}
        className={`flex w-full items-start gap-3 p-4 text-left sm:p-5 ${hasDetail ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <CategoryBadge category={email.category} />
            <span className="whitespace-nowrap font-mono text-[10px] text-muted">{when(email)}</span>
          </div>

          <p className="mt-3 truncate text-[15px] font-medium leading-snug text-ink">
            {email.subject || 'No subject'}
          </p>
          <p className="mt-1 truncate font-mono text-[11px] text-muted">{email.sender || 'Unknown sender'}</p>

          {meta && (
            <span className="mt-3 inline-block rounded-full bg-paper px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted ring-1 ring-inset ring-hairline">
              {meta}
            </span>
          )}
        </div>

        {hasDetail && (
          <span
            className={`mt-0.5 shrink-0 font-mono text-[15px] leading-none text-muted transition-transform ${open ? 'rotate-45' : ''}`}
          >
            +
          </span>
        )}
      </button>

      {hasDetail && (
        <div className={`expander ${open ? 'open' : ''}`}>
          <div className="expander-inner">
            <div className="expander-body space-y-4 border-t border-hairline bg-paper/60 px-4 py-5 sm:px-5">
              {email.summary && <Detail label="Summary">{email.summary}</Detail>}
              {email.snippet && <Detail label="Preview">{email.snippet}</Detail>}
              {email.draft && (
                <div>
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Suggested reply</p>
                  <pre className="whitespace-pre-wrap rounded-xl border border-hairline bg-surface p-4 font-mono text-[12px] leading-relaxed text-ink/90">
                    {email.draft}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmailTable({ emails }) {
  if (!emails.length) {
    return (
      <div className="rounded-2xl border border-dashed border-hairline bg-surface px-6 py-20 text-center">
        <p className="font-display text-xl text-ink">Nothing in the inbox yet</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Processed mail shows up here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {emails.map((e, i) => (
        <Card key={e.id} email={e} index={i} />
      ))}
    </div>
  );
}
