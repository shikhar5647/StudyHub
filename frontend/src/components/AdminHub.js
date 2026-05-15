import React from 'react';
import AdminDashboard from './dashboard/AdminDashboard';
import { useAuthUser } from '../hooks/useAuthUser';

const AdminHub = () => {
  const { user, loading, logout } = useAuthUser({ roles: ['admin'] });

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading…</p>
      </div>
    );
  }

  return <AdminDashboard user={user} onLogout={logout} />;
};

export default AdminHub;
