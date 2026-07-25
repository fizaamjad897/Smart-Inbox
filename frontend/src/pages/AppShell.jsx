import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const TABS = [
  ['Dashboard', '/app', true],
  ['Simulate', '/app/simulate', false],
  ['Settings', '/app/settings', false],
  ['Help', '/app/help', false]
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const doLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-hairline bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-8">
            <Link to="/app" className="flex items-center gap-2.5">
              <Logo />
              <span className="font-display text-lg font-medium tracking-tight">Smart Inbox</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {TABS.map(([label, to, end]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                      isActive ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[11px] text-muted sm:inline">{user?.email}</span>
            <button
              onClick={doLogout}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted underline underline-offset-4 hover:text-ink"
            >
              Log out
            </button>
          </div>
        </div>

        {/* mobile tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-hairline px-4 py-2 md:hidden">
          {TABS.map(([label, to, end]) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] ${
                  isActive ? 'bg-ink text-paper' : 'text-muted'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div key={location.pathname} className="page-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
