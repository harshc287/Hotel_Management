import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../context/CartContext.jsx';
import NotificationBell from '../notifications/NotificationBell.jsx';

const STAFF_LINKS = {
  waiter: [{ to: '/waiter', label: 'Waiter' }],
  cook: [{ to: '/kitchen', label: 'Kitchen' }],
  delivery: [{ to: '/delivery', label: 'Deliveries' }],
  manager: [{ to: '/manager', label: 'Dashboard' }, { to: '/manager/orders', label: 'Orders' }, { to: '/manager/menu', label: 'Menu' }],
  admin: [{ to: '/manager', label: 'Dashboard' }, { to: '/manager/orders', label: 'Orders' }],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const links = user ? STAFF_LINKS[user.role] || [] : [];

  return (
    <nav className="sticky top-0 z-40 bg-slate-900 text-white shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-bold">RMS</Link>
        <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(!open)}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} className={({ isActive }) => `navlink ${isActive ? 'navlink-active' : ''}`} end>{l.label}</NavLink>)}
          {(!user || user.role === 'customer') && <NavLink to="/cart" className="navlink">Cart {itemCount > 0 && `(${itemCount})`}</NavLink>}
          {user ? (
            <>
              <NotificationBell />
              <span className="ml-2 text-xs text-slate-300">{user.name} · {user.role}</span>
              <button className="btn-ghost ml-2 !text-white" onClick={() => { logout(); nav('/login'); }}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="navlink">Login</NavLink>
              <NavLink to="/register" className="navlink">Register</NavLink>
            </>
          )}
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-800 bg-slate-900 px-4 pb-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="navlink w-full">{l.label}</NavLink>)}
            {user ? <button className="navlink w-full text-left" onClick={() => { logout(); nav('/login'); setOpen(false); }}>Logout</button> : <NavLink to="/login" onClick={() => setOpen(false)} className="navlink">Login</NavLink>}
          </div>
        </div>
      )}
    </nav>
  );
}