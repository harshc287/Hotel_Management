import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex justify-center py-20 text-slate-500 animate-pulse">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) return <div className="mx-auto max-w-xl rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">You don't have access to this page.</div>;
  return children;
}