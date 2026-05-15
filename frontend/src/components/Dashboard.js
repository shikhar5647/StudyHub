import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE } from '../config/api';
import { getMyEnrolledCourses } from '../api/courses';
import { clearAuthSession, getAccessToken, getStoredUser } from '../utils/auth';
import CourseCard from './CourseCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [enrolled, setEnrolled] = useState([]);
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
        setEnrolled(enrolledRes.data || []);
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
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="card shadow border-0 mb-4" style={{ maxWidth: 720 }}>
        <div className="card-body p-4">
          <h2 className="mb-3">Welcome, {user?.name || 'Learner'}!</h2>
          <p className="text-muted mb-1">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-muted mb-4">
            <strong>Role:</strong> {user?.role}
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/courses" className="btn btn-primary">
              Browse courses
            </Link>
            <Link to="/storage" className="btn btn-outline-primary">
              Storage manager
            </Link>
            <button type="button" className="btn btn-outline-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </div>

      <h3 className="h4 mb-3">My enrolled courses</h3>
      {enrolled.length === 0 ? (
        <p className="text-muted">
          You have not enrolled in any course yet.{' '}
          <Link to="/courses">Explore courses</Link>
        </p>
      ) : (
        <div className="row g-4">
          {enrolled.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
