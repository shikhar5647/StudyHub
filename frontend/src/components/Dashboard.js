import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE } from '../config/api';
import { clearAuthSession, getAccessToken, getStoredUser } from '../utils/auth';

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

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load profile');
        setUser(data.data);
      } catch (err) {
        toast.error(err.message);
        clearAuthSession();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
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
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <div className="card shadow border-0">
        <div className="card-body p-4">
          <h2 className="mb-3">Welcome, {user?.name || 'Learner'}!</h2>
          <p className="text-muted mb-1">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-muted mb-4">
            <strong>Role:</strong> {user?.role}
          </p>
          <p className="small text-success mb-4">
            Connected to StudyHub API at {API_BASE}
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/storage" className="btn btn-primary">
              Open Storage Manager
            </Link>
            <button type="button" className="btn btn-outline-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
