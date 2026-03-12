import { Navigate } from 'react-router-dom';
import { useAuth, normalizeRole } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const role = normalizeRole(user.role);
    if (!allowedRoles.includes(role) && !allowedRoles.includes(user.role)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600">Access Denied</div>
        </div>
      );
    }
  }

  return children;

  return children;
};
