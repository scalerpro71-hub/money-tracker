import { useState } from 'react';
import { useAuthCtx } from '../../app/auth-context';
import { Icon } from '../../components/layout/Icon';

export function LoginPage() {
  const { signIn, signUp, signInWithMagicLink } = useAuthCtx();
  const [mode, setMode] = useState('signin'); // signin | signup | magic
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password, fullName);
        setSignupDone(true);
      } else {
        await signInWithMagicLink(email);
        setMagicSent(true);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card anim-riseIn">
        <div className="auth-logo"><Icon name="sparkle" size={26} style={{ color: '#fff' }} /></div>
        <h1>PaisaCoach</h1>
        <p className="auth-subtitle">Your lifetime money coach — learn to save, then learn to invest.</p>

        {signupDone ? (
          <div className="magic-sent">
            <span className="auth-icon-lg">📬</span>
            <p style={{ fontWeight: 700 }}>Check your inbox</p>
            <p className="auth-subtitle" style={{ margin: 0 }}>
              We sent a confirmation link to <strong>{email}</strong>. Confirm it, then sign in.
            </p>
            <button className="btn-secondary" onClick={() => { setSignupDone(false); setMode('signin'); }}>
              Back to sign in
            </button>
          </div>
        ) : magicSent ? (
          <div className="magic-sent">
            <span className="auth-icon-lg">✨</span>
            <p style={{ fontWeight: 700 }}>Magic link sent</p>
            <p className="auth-subtitle" style={{ margin: 0 }}>
              Check <strong>{email}</strong> and tap the link to sign in.
            </p>
            <button className="btn-secondary" onClick={() => setMagicSent(false)}>Use a different email</button>
          </div>
        ) : (
          <>
            <div className="auth-tabs">
              <button className={mode === 'signin' ? 'active' : ''} onClick={() => { setMode('signin'); setError(''); }}>Sign in</button>
              <button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); }}>Create account</button>
              <button className={mode === 'magic' ? 'active' : ''} onClick={() => { setMode('magic'); setError(''); }}>Magic link</button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="form-group">
                  <label htmlFor="auth-name">Your name</label>
                  <input id="auth-name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Pranay" required autoComplete="name" />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="auth-email">Email</label>
                <input id="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
              </div>
              {mode !== 'magic' && (
                <div className="form-group">
                  <label htmlFor="auth-pass">Password</label>
                  <input id="auth-pass" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
                </div>
              )}
              {error && <div className="auth-error">{error}</div>}
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send magic link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
