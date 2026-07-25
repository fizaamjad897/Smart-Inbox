import { useState } from 'react';
import CategoryBadge from './CategoryBadge.jsx';
import { colorFor } from '../categories.js';

function Field({ label, children, mono = false }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className={`text-[13px] leading-relaxed text-ink/90 ${mono ? 'font-mono' : ''}`}>{children}</p>
    </div>
  );
}

function Row({ email }) {
  const [open, setOpen] = useState(false);
  const hasDetail = email.summary || email.draft || email.snippet;
  const color = colorFor(email.category);

  const meta =
    email.company ||
    (email.interest_level
      ? `${email.interest_level}${email.estimated_value ? ` · ${email.estimated_value}` : ''}`
      : '');

  return (
    <>
      <tr
        onClick={() => hasDetail && setOpen((o) => !o)}
        className={`border-b border-hairline align-top transition-colors ${
          hasDetail ? 'cursor-pointer hover:bg-surface' : ''
        }`}
      >
        <td className="py-4 pl-4 pr-4" style={{ boxShadow: `inset 2px 0 0 ${color}` }}>
          <CategoryBadge category={email.category} />
        </td>
        <td className="py-4 pr-6">
          <p className="text-[14px] font-medium leading-snug text-ink">
            {email.subject || 'No subject'}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted">{email.sender || '—'}</p>
        </td>
        <td className="hidden py-4 pr-6 font-mono text-[11px] uppercase tracking-[0.08em] text-muted sm:table-cell">
          {meta || '—'}
        </td>
        <td className="whitespace-nowrap py-4 pr-4 text-right align-middle">
          <span className="font-mono text-[11px] text-muted">
            {email.timestamp || (email.received_at ? email.received_at.slice(0, 16).replace('T', ' ') : '')}
          </span>
          {hasDetail && (
            <span className="ml-3 inline-block w-3 font-mono text-[13px] text-muted">
              {open ? '–' : '+'}
            </span>
          )}
        </td>
      </tr>

      {open && hasDetail && (
        <tr className="border-b border-hairline bg-surface">
          <td colSpan={4} className="px-4 py-6" style={{ boxShadow: `inset 2px 0 0 ${color}` }}>
            <div className="grid gap-6 pl-1 md:grid-cols-2">
              {email.summary && <Field label="Summary">{email.summary}</Field>}
              {email.snippet && <Field label="Preview">{email.snippet}</Field>}
              {email.draft && (
                <div className="md:col-span-2">
                  <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    Suggested reply
                  </p>
                  <pre className="whitespace-pre-wrap border border-hairline bg-paper p-4 font-mono text-[12px] leading-relaxed text-ink/90">
                    {email.draft}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function EmailTable({ emails }) {
  if (!emails.length) {
    return (
      <div className="border border-hairline bg-surface px-6 py-20 text-center">
        <p className="font-display text-xl text-ink">Nothing in the inbox yet</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          Processed mail will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="border-y border-hairline">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-hairline text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            <th className="py-3 pl-4 pr-4 font-normal">Category</th>
            <th className="py-3 pr-6 font-normal">Subject</th>
            <th className="hidden py-3 pr-6 font-normal sm:table-cell">Detail</th>
            <th className="py-3 pr-4 text-right font-normal">Received</th>
          </tr>
        </thead>
        <tbody>
          {emails.map((e) => (
            <Row key={e.id} email={e} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
