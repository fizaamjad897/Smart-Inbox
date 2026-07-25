import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

const DEMO = { email: 'demo@smartinbox.app', password: 'demo1234' };

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function run(fn) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const submit = (e) => {
    e.preventDefault();
    run(() => (mode === 'login' ? login(email, password) : signup(email, password)));
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* left / brand panel */}
      <div className="relative hidden overflow-hidden bg-ink p-12 text-paper lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{ backgroundImage: 'radial-gradient(#f6f4ef 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-paper">
            <svg viewBox="0 0 100 100" className="h-[60%] w-[60%]" aria-hidden="true">
              <path d="M20 34 L50 56 L80 34" fill="none" stroke="#1c1b19" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-display text-lg font-medium">Smart Inbox</span>
        </Link>
        <div className="relative max-w-sm">
          <h2 className="font-display text-4xl font-medium leading-tight">
            Email that sorts itself, the moment it lands.
          </h2>
          <p className="mt-5 text-[14px] leading-relaxed text-paper/60">
            Log in to the dashboard, or spin up a fresh account and configure your own triage rules.
          </p>
        </div>
        <p className="relative font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40">
          AI email triage · n8n · Groq · MongoDB
        </p>
      </div>

      {/* right / form */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
            <Logo />
            <span className="font-display text-lg font-medium">Smart Inbox</span>
          </Link>

          <h1 className="font-display text-3xl font-medium tracking-tight text-ink">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-[13px] text-muted">
            {mode === 'login' ? 'Log in to your triage dashboard.' : 'Start sorting your inbox in seconds.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-0 border-b border-hairline bg-transparent pb-2 text-sm text-ink focus:border-ink"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-0 border-b border-hairline bg-transparent pb-2 text-sm text-ink focus:border-ink"
                placeholder="••••••••"
              />
            </label>

            {error && <p className="font-mono text-[12px] text-[#b23b34]">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-ink py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition hover:bg-ink/85 disabled:opacity-50"
            >
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
            </button>
          </form>

          <button
            onClick={() => run(() => login(DEMO.email, DEMO.password))}
            disabled={busy}
            className="mt-3 w-full rounded-full border border-hairline py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition hover:border-ink hover:text-ink disabled:opacity-50"
          >
            Try the demo account
          </button>

          <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {mode === 'login' ? 'No account?' : 'Already have one?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
              className="text-ink underline underline-offset-4"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
