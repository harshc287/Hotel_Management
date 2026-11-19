
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './styles/custom.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setBusy(true);

    try {
      const user = await login(cleanEmail, password);

      if (user.role === 'manager') {
        navigate('/manager', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your email and password.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>

        <div className="eyebrow">
          TABLE &amp; THYME
        </div>

        <h1>Welcome back.</h1>

        <p>
          Sign in to continue to your account
          and enjoy a better dining experience.
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <label htmlFor="login-email">
          Email address
        </label>

        <input
          id="login-email"
          className="form-control"
          type="email"
          name="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="login-password">
          Password
        </label>

        <input
          id="login-password"
          className="form-control"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          className="btn btn-gold w-100"
          disabled={busy}
        >
          {busy ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="auth-foot">
          Don't have an account?
          <Link to="/register"> Create account</Link>
        </div>

      </form>
    </div>
  );
}
