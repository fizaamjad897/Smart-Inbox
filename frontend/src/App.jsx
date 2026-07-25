import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import Intro from './components/Intro.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import AppShell from './pages/AppShell.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SimulatePage from './pages/SimulatePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import HelpPage from './pages/HelpPage.jsx';

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
      Loading
    </div>
  );
}

function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <Splash />;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Intro />
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/app"
        element={
          <Protected>
            <AppShell />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="simulate" element={<SimulatePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
