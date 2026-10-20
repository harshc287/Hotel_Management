import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await register(form); nav('/'); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-md">
      <div className="card">
        <div className="card-body">
          <h1 className="text-xl font-semibold">Create account</h1>
          {error && <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            {['name', 'email', 'password', 'phone'].map((f) => (
              <div key={f}>
                <label className="label capitalize">{f}</label>
                <input type={f === 'password' ? 'password' : 'text'} className="input" required={f !== 'phone'} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
              </div>
            ))}
            <button className="btn-success w-full" disabled={busy}>{busy ? 'Creating…' : 'Register'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}