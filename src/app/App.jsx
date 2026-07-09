import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { Providers } from './providers';
import { useAuthCtx } from './auth-context';
import { useProfile } from '../lib/queries';
import { AppShell } from './shell/AppShell';
import { Spinner } from '../components/layout/Spinner';
import { LoginPage } from '../features/auth/LoginPage';
import { HomePage } from '../features/home/HomePage';

const OnboardingPage = lazy(() => import('../features/onboarding/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const MoneyPage = lazy(() => import('../features/money/MoneyPage').then(m => ({ default: m.MoneyPage })));
const LearnPage = lazy(() => import('../features/learn/LearnPage').then(m => ({ default: m.LearnPage })));
const LessonPage = lazy(() => import('../features/learn/LessonPage').then(m => ({ default: m.LessonPage })));
const InvestPage = lazy(() => import('../features/invest/InvestPage').then(m => ({ default: m.InvestPage })));
const CoachPage = lazy(() => import('../features/coach/CoachPage').then(m => ({ default: m.CoachPage })));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Spinner size={48} />
      <p>Loading…</p>
    </div>
  );
}

function LoginRoute() {
  const { session } = useAuthCtx();
  if (session === undefined) return <LoadingScreen />;
  if (session) return <Navigate to="/" replace />;
  return <LoginPage />;
}

/** Requires a session, then routes through the onboarding gate. */
function Protected({ children }) {
  const { session } = useAuthCtx();
  const { data: profile, isLoading } = useProfile();
  const location = useLocation();

  if (session === undefined) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  if (isLoading || !profile) return <LoadingScreen />;

  const onOnboarding = location.pathname === '/onboarding';
  if (!profile.onboarded_at && !onOnboarding) return <Navigate to="/onboarding" replace />;
  if (profile.onboarded_at && onOnboarding) return <Navigate to="/" replace />;
  return children;
}

const missingEnv = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

function SetupRequired() {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ec', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Manrope, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 18, border: '1px solid rgba(24,28,34,0.08)', boxShadow: '0 2px 6px rgba(24,28,34,.05), 0 14px 30px -18px rgba(24,28,34,.28)', padding: 36, maxWidth: 480, width: '100%' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#0a9d72,#0a8a86)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 22, marginBottom: 20 }}>₹</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Setup required</div>
        <div style={{ fontSize: 14, color: '#565d68', lineHeight: 1.6, marginBottom: 20 }}>
          Create a <code style={{ background: '#f7f5ef', padding: '2px 6px', borderRadius: 6, fontFamily: 'monospace' }}>.env.local</code> file in the project root with your Supabase credentials:
        </div>
        <pre style={{ background: '#0a0c10', color: '#34e0a8', padding: '16px 18px', borderRadius: 12, fontSize: 12.5, overflowX: 'auto', marginBottom: 20, lineHeight: 1.7 }}>
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
        <div style={{ fontSize: 13, color: '#8a909b', fontWeight: 600 }}>
          Find these in <strong style={{ color: '#0a9d72' }}>Supabase Dashboard → Project Settings → API</strong>, then restart the dev server.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  if (missingEnv) return <SetupRequired />;

  return (
    <Providers>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/onboarding" element={<Protected><OnboardingPage /></Protected>} />
          <Route element={<Protected><AppShell /></Protected>}>
            <Route index element={<HomePage />} />
            <Route path="money" element={<MoneyPage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="learn/:levelId/:lessonId" element={<LessonPage />} />
            <Route path="invest" element={<InvestPage />} />
            <Route path="coach" element={<CoachPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </Providers>
  );
}
