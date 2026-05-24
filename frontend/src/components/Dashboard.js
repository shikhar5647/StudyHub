import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE } from '../config/api';
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
} from '../utils/auth';
import { dashboardPathForRole, isAdmin, isInstructor } from '../utils/rbac';
import { getMyEnrolledCourses } from '../api/courses';
import StudentDashboard from './dashboard/StudentDashboard';
import InstructorDashboard from './dashboard/InstructorDashboard';
import AdminDashboard from './dashboard/AdminDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      toast.info('Please log in first');
      navigate('/login');
      return;
    }

    const load = async () => {
      try {
        const [meRes, enrolledRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          getMyEnrolledCourses(),
        ]);
        const meData = await meRes.json();
        if (!meRes.ok) throw new Error(meData.message || 'Failed to load profile');
        setUser(meData.data);

      } catch (err) {
        toast.error(err.message);
        clearAuthSession();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const handleLogout = () => {
    clearAuthSession();
    toast.success('Logged out');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  if (isAdmin(user)) {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }
  if (isInstructor(user)) {
    return <InstructorDashboard user={user} onLogout={handleLogout} />;
  }
  return <StudentDashboard user={user} onLogout={handleLogout} />;
};

export { dashboardPathForRole };
export default Dashboard;
