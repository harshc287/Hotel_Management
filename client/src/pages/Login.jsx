import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const FALLBACK = { waiter: '/waiter', cook: '/kitchen', delivery: '/delivery', manager: '/manager', admin: '/manager', customer: '/' };

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const user = await login(email.trim(), password);
      nav(location.state?.from || FALLBACK[user.role] || '/', { replace: true });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-md">
      <div className="card">
        <div className="card-body">
          <h1 className="text-xl font-semibold">Sign in</h1>
          {error && <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div><label className="label">Email</label><input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><label className="label">Password</label><input type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">Dev: <code>manager@demo.local</code> / <code>Password123!</code></div>
          <p className="mt-4 text-center text-sm text-slate-600">No account? <Link to="/register" className="text-brand-600 hover:underline">Register</Link></p>
        </div>
      </div>
    </div>
  );
}