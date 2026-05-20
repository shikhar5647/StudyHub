import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyProfile } from '../api/users';
import { ROLE_BADGE_CLASS, ROLE_LABELS, dashboardPathForRole } from '../utils/rbac';
import { useAuthUser } from '../hooks/useAuthUser';

const Profile = () => {
  const { user: sessionUser, loading: authLoading } = useAuthUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !sessionUser) return;
    getMyProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [authLoading, sessionUser]);

  if (authLoading || loading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading profile…</p>
      </div>
    );
  }

  const user = profile?.user || sessionUser;
  const badge = ROLE_BADGE_CLASS[user?.role] || 'bg-secondary';

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <Link to={dashboardPathForRole(user?.role)} className="small text-decoration-none">
        ← Back to dashboard
      </Link>
      <div className="card shadow border-0 mt-3">
        <div className="card-body p-4 text-center">
          <img
            src={user?.avatar || 'https://via.placeholder.com/120'}
            alt=""
            className="rounded-circle mb-3"
            width={120}
            height={120}
            style={{ objectFit: 'cover' }}
          />
          <span className={`badge ${badge} mb-2`}>
            {profile?.roleLabel || ROLE_LABELS[user?.role]}
          </span>
          <h2>{user?.name}</h2>
          <p className="text-muted">{user?.email}</p>
          <p className="small text-muted">
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </p>
          <div className="d-flex justify-content-center gap-4 mt-3">
            <div className="text-center">
              <h4 className="text-success mb-0">{user?.xp || 0}</h4>
              <small className="text-muted">XP</small>
            </div>
            <div className="text-center">
              <h4 className="text-warning mb-0">🔥 {user?.streak?.current || 0}</h4>
              <small className="text-muted">Day Streak</small>
            </div>
          </div>
        </div>
        <ul className="list-group list-group-flush">
          {user?.badges && user.badges.length > 0 && (
            <li className="list-group-item">
              <span className="d-block mb-2"><strong>Badges</strong></span>
              <div className="d-flex gap-2 flex-wrap">
                {user.badges.map((b, i) => (
                  <span key={i} className="badge bg-primary rounded-pill px-3 py-2">
                    🏆 {b.name}
                  </span>
                ))}
              </div>
            </li>
          )}
          {user?.role === 'student' && (
            <li className="list-group-item d-flex justify-content-between">
              <span>Enrolled courses</span>
              <strong>{user.enrolledCourses?.length || 0}</strong>
            </li>
          )}
          {(user?.role === 'instructor' || user?.role === 'admin') && (
            <li className="list-group-item d-flex justify-content-between">
              <span>Courses created</span>
              <strong>{user.createdCourses?.length || profile?.user?.createdCourses?.length || 0}</strong>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
