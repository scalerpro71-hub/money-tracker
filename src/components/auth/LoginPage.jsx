import { useState } from 'react';
import { useToast } from '../layout/Toast';

export function LoginPage({ onSignIn, onSignUp, onMagicLink }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const toast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
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
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">💰</div>
        <h1>Rupee Tracker</h1>
        <p className="auth-subtitle">Track every rupee. Save smarter.</p>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign Up</button>
          <button className={mode === 'magic' ? 'active' : ''} onClick={() => setMode('magic')}>Magic Link</button>
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
                <label>Full Name</label>
                <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {mode !== 'magic' && (
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
