
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const ROLE_HOME = {
  admin: '/manager',
  manager: '/manager',
  waiter: '/waiter',
  cook: '/kitchen',
  delivery: '/delivery',
  customer: '/',
};

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until authentication check completes
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
          <p className="text-sm text-slate-500">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check allowed roles
  if (roles && !roles.includes(user.role)) {
    const redirectPath = ROLE_HOME[user.role] || '/';

    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
