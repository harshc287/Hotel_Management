
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './styles/custom.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    restaurantName: '',
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  function change(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const restaurantName = form.restaurantName.trim();

    // Name validation
    if (name.length < 2) {
      setError('Name must contain at least 2 characters.');
      return;
    }

    // Email validation
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    // Password validation
    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    // Restaurant validation
    if (
      form.role === 'manager' &&
      restaurantName.length < 2
    ) {
      setError('Restaurant name must contain at least 2 characters.');
      return;
    }

    // Prepare registration payload
    const payload = {
      name,
      email,
      password: form.password,
      role: form.role,
    };

    if (form.role === 'manager') {
      payload.restaurantName = restaurantName;
    }

    setBusy(true);

    try {
      // Call registration API
      const user = await register(payload);

      // Redirect according to account role
      if (user.role === 'manager') {
        navigate('/manager', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (err) {
      const fieldErrors =
        err.response?.data?.errors?.fieldErrors;

      if (fieldErrors) {
        const firstError = Object.values(fieldErrors)
          .flat()
          .find(Boolean);

        setError(
          firstError ||
          err.response?.data?.message ||
          'Could not create account.'
        );
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Registration failed. Please try again.'
        );
      }

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

        <h1>Make yourself at home.</h1>

        <p>
          Create your account and discover
          a better dining experience.
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <label htmlFor="register-name">
          Full name
        </label>

        <input
          id="register-name"
          className="form-control"
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={form.name}
          onChange={change}
          minLength={2}
          maxLength={80}
          autoComplete="name"
          required
        />

        <label htmlFor="register-email">
          Email address
        </label>

        <input
          id="register-email"
          className="form-control"
          type="email"
          name="email"
          placeholder="Enter your email address"
          value={form.email}
          onChange={change}
          autoComplete="email"
          required
        />

        <label htmlFor="register-password">
          Password
        </label>

        <input
          id="register-password"
          className="form-control"
          type="password"
          name="password"
          placeholder="Minimum 8 characters"
          value={form.password}
          onChange={change}
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
          required
        />

        <label htmlFor="register-role">
          Account type
        </label>

        <select
          id="register-role"
          className="form-select"
          name="role"
          value={form.role}
          onChange={change}
          required
        >
          <option value="customer">
            Customer
          </option>

          <option value="manager">
            Restaurant manager
          </option>
        </select>

        {form.role === 'manager' && (
          <>
            <label htmlFor="restaurant-name">
              Restaurant name
            </label>

            <input
              id="restaurant-name"
              className="form-control"
              type="text"
              name="restaurantName"
              placeholder="Enter your restaurant name"
              value={form.restaurantName}
              onChange={change}
              minLength={2}
              maxLength={100}
              required
            />
          </>
        )}

        <button
          type="submit"
          className="btn btn-gold w-100"
          disabled={busy}
        >
          {busy ? 'Creating account...' : 'Create account'}
        </button>

        <div className="auth-foot">
          Already registered?
          <Link to="/login"> Sign in</Link>
        </div>

      </form>
    </div>
  );
}
