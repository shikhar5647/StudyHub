import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAccessToken, getStoredUser } from '../utils/auth';
import { hasRole } from '../utils/rbac';

const ProtectedRoute = ({ children, roles = null, loginPath = '/login' }) => {
  const token = getAccessToken();
  const user = getStoredUser();

  if (!token) {
    return <Navigate to={loginPath} replace />;
  }

  if (roles && roles.length > 0 && !hasRole(user, ...roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
