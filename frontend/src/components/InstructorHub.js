import React from 'react';
import InstructorDashboard from './dashboard/InstructorDashboard';
import { useAuthUser } from '../hooks/useAuthUser';

const InstructorHub = () => {
  const { user, loading, logout } = useAuthUser({ roles: ['instructor', 'admin'] });

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading…</p>
      </div>
    );
  }

  return <InstructorDashboard user={user} onLogout={logout} />;
};

export default InstructorHub;
