import { useState } from 'react';
import { useToast } from '../layout/Toast';

function getErrorMessage(err) {
  if (!err) return 'Login failed. Please try again.';
  if (typeof err === 'string') return err;
  return err.message || 'Login failed. Please try again.';
}

export function LoginPage({ onSignIn, onSignUp, onMagicLink }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
    setMagicSent(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await onSignIn(email, password);
      } else if (mode === 'signup') {
        await onSignUp(email, password, name);
        toast('Account created! Check your email to confirm.', 'success');
      } else {
        await onMagicLink(email);
        setMagicSent(true);
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">₹</div>
        <h1>Rupee.</h1>
        <p className="auth-subtitle">Track every rupee. Save smarter.</p>

        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>Login</button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => changeMode('signup')}>Sign Up</button>
          <button type="button" className={mode === 'magic' ? 'active' : ''} onClick={() => changeMode('magic')}>Magic Link</button>
        </div>

        {mode === 'magic' && magicSent ? (
          <div className="magic-sent">
            <div className="empty-icon">📧</div>
            <p>Check your email for the login link!</p>
            <button className="btn-secondary" onClick={() => { setMagicSent(false); setMode('login'); }}>
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label htmlFor="auth-name">Full Name</label>
                <input id="auth-name" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="auth-email">Email</label>
              <input id="auth-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {mode !== 'magic' && (
              <div className="form-group">
                <label htmlFor="auth-password">Password</label>
                <input id="auth-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
            )}
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={loading} aria-label={mode === 'login' ? 'Submit login' : mode === 'signup' ? 'Create account' : 'Send magic link'}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
