import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user } = useAuth();

  // Fallback to localStorage to handle the React state timing gap
  // that occurs right after login (setUser is async, localStorage is sync)
  const effectiveUser = user || (() => {
    try {
      const s = localStorage.getItem('sla3li_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  })();

  if (!effectiveUser) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(effectiveUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
