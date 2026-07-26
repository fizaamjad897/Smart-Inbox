import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ConnectGmail from '../components/ConnectGmail.jsx';

const blankCat = () => ({ key: '', label: '', color: '#8a8578', description: '', keywords: '' });

export default function SettingsPage() {
  const [enabled, setEnabled] = useState(true);
  const [cats, setCats] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [discord, setDiscord] = useState('');
  const [logSheet, setLogSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getSettings();
        setEnabled(s.enabled);
        setPrompt(s.prompt || '');
        setDiscord(s.routing?.discordWebhook || '');
        setLogSheet(!!s.routing?.logToSheet);
        setCats((s.categories || []).map((c) => ({ ...c, keywords: (c.keywords || []).join(', ') })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateCat = (i, patch) => setCats((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const removeCat = (i) => setCats((cs) => cs.filter((_, idx) => idx !== i));
  const addCat = () => setCats((cs) => [...cs, blankCat()]);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const categories = cats
        .filter((c) => c.label || c.key)
        .map((c) => ({
          key: (c.key || c.label).toUpperCase().trim().replace(/\s+/g, '_'),
          label: c.label || c.key,
          color: c.color,
          description: c.description || '',
          keywords: c.keywords.split(',').map((k) => k.trim()).filter(Boolean)
        }));
      const s = await api.saveSettings({
        enabled,
        prompt,
        categories,
        routing: { discordWebhook: discord, logToSheet: logSheet }
      });
      setCats((s.categories || []).map((c) => ({ ...c, keywords: (c.keywords || []).join(', ') })));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-20 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Loading</p>;
  }

  return (
    <div className="max-w-3xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Settings</p>
      <h1 className="mt-3 font-display text-[32px] font-medium leading-tight tracking-tight text-ink">
        Your automation rules
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink/70">
        This is the whole config surface: categories, routing, and an on/off switch.
      </p>

      <div className="mt-10">
        <ConnectGmail />
      </div>

      {/* enabled */}
      <div className="mt-10 flex items-center justify-between border-y border-hairline py-5">
        <div>
          <p className="font-display text-lg font-medium text-ink">Automation</p>
          <p className="text-[13px] text-muted">Classify and route incoming email.</p>
        </div>
        <button
          onClick={() => setEnabled((v) => !v)}
          className={`relative h-7 w-12 rounded-full transition-colors ${enabled ? 'bg-ink' : 'bg-hairline'}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-paper transition-all ${enabled ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {/* categories */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-medium text-ink">Categories</h2>
          <button
            onClick={addCat}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted underline underline-offset-4 hover:text-ink"
          >
            + Add category
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {cats.map((c, i) => (
            <div key={i} className="flex flex-wrap items-center gap-3 border border-hairline bg-surface p-3">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(c.color) ? c.color : '#8a8578'}
                onChange={(e) => updateCat(i, { color: e.target.value })}
                className="h-8 w-8 cursor-pointer rounded border border-hairline bg-transparent"
                title="Colour"
              />
              <input
                value={c.label}
                onChange={(e) => updateCat(i, { label: e.target.value })}
                placeholder="Label"
                className="w-32 border-0 border-b border-hairline bg-transparent pb-1 text-sm font-medium text-ink focus:border-ink"
              />
              <input
                value={c.keywords}
                onChange={(e) => updateCat(i, { keywords: e.target.value })}
                placeholder="keywords, comma, separated"
                className="min-w-[180px] flex-1 border-0 border-b border-hairline bg-transparent pb-1 font-mono text-[12px] text-muted focus:border-ink"
              />
              <button
                onClick={() => removeCat(i)}
                className="font-mono text-[13px] text-muted hover:text-[#b23b34]"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Keywords power the fallback classifier when the LLM is unavailable.
        </p>
      </div>

      {/* routing */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-medium text-ink">Routing</h2>
        <label className="mt-4 block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Discord webhook URL</span>
          <input
            value={discord}
            onChange={(e) => setDiscord(e.target.value)}
            placeholder="https://discord.com/api/webhooks/…"
            className="w-full border-0 border-b border-hairline bg-transparent pb-2 font-mono text-[12px] text-ink focus:border-ink"
          />
        </label>
        <label className="mt-5 flex items-center gap-3">
          <input type="checkbox" checked={logSheet} onChange={(e) => setLogSheet(e.target.checked)} className="h-4 w-4 accent-[#1c1b19]" />
          <span className="text-[13px] text-ink/80">Also log to Google Sheets (handled by the n8n workflow)</span>
        </label>
      </div>

      {/* advanced prompt */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-medium text-ink">Classifier prompt <span className="font-sans text-[11px] font-normal text-muted">· optional</span></h2>
        <p className="mt-1 text-[13px] text-muted">Override the system prompt. Leave blank to auto-generate it from your categories.</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Custom classification instructions…"
          className="mt-4 w-full resize-none border border-hairline bg-surface p-3 font-mono text-[12px] text-ink focus:border-ink"
        />
      </div>

      {error && <p className="mt-6 font-mono text-[12px] text-[#b23b34]">{error}</p>}

      <div className="mt-12 flex items-center gap-4 border-t border-hairline pt-6">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition hover:bg-ink/85 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {saved && <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#2f6f5e]">Saved ✓</span>}
      </div>
    </div>
  );
}
