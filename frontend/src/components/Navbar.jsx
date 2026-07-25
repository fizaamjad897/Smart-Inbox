import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const LINKS = [
  ['How it works', '#how'],
  ['Categories', '#categories'],
  ['Live demo', '#demo']
];

export default function Navbar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-paper/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-lg font-medium tracking-tight">Smart Inbox</span>
        </a>

        <div className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.16em] text-muted md:flex">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className="transition-colors hover:text-ink">
              {label}
            </a>
          ))}
        </div>

        <Link
          to={user ? '/app' : '/login'}
          className="rounded-full bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper transition hover:bg-ink/85"
        >
          {user ? 'Open app' : 'Log in'}
        </Link>
      </nav>
    </header>
  );
}
