import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';

function CopyField({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-hairline bg-paper px-3 py-2 text-left font-mono text-[11px] text-ink hover:border-ink"
    >
      <span className="truncate">{value}</span>
      <span className="shrink-0 uppercase tracking-[0.14em] text-muted">{copied ? 'copied' : 'copy'}</span>
    </button>
  );
}

export default function ConnectGmail() {
  const [status, setStatus] = useState(null);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useSearchParams();

  const load = () => api.getGoogleStatus().then(setStatus).catch((e) => setError(e.message));

  useEffect(() => {
    load();
    if (params.get('connected')) {
      params.delete('connected');
      setParams(params, { replace: true });
    }
    const err = params.get('error');
    if (err) {
      setError(err);
      params.delete('error');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveConfig(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setStatus(await api.saveGoogleConfig({ clientId, clientSecret }));
      setClientSecret('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await api.getGoogleConnectUrl();
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const redirectUri = status?.redirectUri || '';

  return (
    <div className="mb-12 rounded-2xl border border-hairline bg-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-medium text-ink">Connect your Gmail</h2>
          <p className="mt-1 text-[13px] text-muted">Bring your own Google app and triage your real inbox.</p>
        </div>
        {status?.connected && (
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#2f6f5e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2f6f5e]" />
            Connected
          </span>
        )}
      </div>

      {status?.connected ? (
        <p className="mt-5 rounded-lg border border-hairline bg-paper px-4 py-3 text-[13px] text-ink/80">
          Connected as <span className="font-mono text-ink">{status.email || 'your account'}</span>. Your inbox
          is being triaged automatically.
        </p>
      ) : (
        <>
          {/* how-to guide */}
          <button
            onClick={() => setGuideOpen((o) => !o)}
            className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted underline underline-offset-4 hover:text-ink"
          >
            {guideOpen ? 'Hide' : 'How do I get a Client ID and Secret?'}
          </button>
          {guideOpen && (
            <ol className="mt-4 space-y-2.5 border-l border-hairline pl-4 text-[13px] leading-relaxed text-ink/80">
              <li>1. Open <a className="underline" href="https://console.cloud.google.com" target="_blank" rel="noreferrer">Google Cloud Console</a> and create a project.</li>
              <li>2. APIs &amp; Services → Library → enable the <span className="font-medium">Gmail API</span>.</li>
              <li>3. OAuth consent screen → <span className="font-medium">External</span> → add your own email under <span className="font-medium">Test users</span>.</li>
              <li>4. Credentials → Create credentials → <span className="font-medium">OAuth client ID</span> → type <span className="font-medium">Web application</span>.</li>
              <li>
                5. Under <span className="font-medium">Authorized redirect URIs</span>, add this exactly:
                {redirectUri && <span className="mt-1.5 block"><CopyField value={redirectUri} /></span>}
              </li>
              <li>6. Copy the <span className="font-medium">Client ID</span> and <span className="font-medium">Client Secret</span> into the fields below.</li>
            </ol>
          )}

          {/* config form */}
          <form onSubmit={saveConfig} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Client ID</span>
              <input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="…apps.googleusercontent.com"
                className="w-full border-0 border-b border-hairline bg-transparent pb-2 font-mono text-[12px] text-ink focus:border-ink"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Client Secret</span>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder={status?.configured ? '•••••••• (saved)' : 'GOCSPX-…'}
                className="w-full border-0 border-b border-hairline bg-transparent pb-2 font-mono text-[12px] text-ink focus:border-ink"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={busy || !clientId}
                className="rounded-full border border-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition hover:bg-ink hover:text-paper disabled:opacity-40"
              >
                {busy ? 'Saving…' : 'Save credentials'}
              </button>
              {status?.configured && (
                <button
                  type="button"
                  onClick={connect}
                  disabled={busy}
                  className="rounded-full bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-paper transition hover:bg-ink/85 active:scale-[0.97] disabled:opacity-40"
                >
                  Connect Gmail →
                </button>
              )}
            </div>
          </form>
        </>
      )}

      {error && <p className="mt-4 font-mono text-[12px] text-[#b23b34]">{error}</p>}
    </div>
  );
}
