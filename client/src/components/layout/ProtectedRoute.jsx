import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({
  children,
  allowedRoles,
  requireApproved = false,
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default role dashboard
    const defaultDashboard =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'owner'
        ? '/owner/dashboard'
        : '/tenant/dashboard';
    return <Navigate to={defaultDashboard} replace />;
  }

  return children;
};
