import React from 'react';
import { ROLE_BADGE_CLASS, ROLE_LABELS } from '../utils/rbac';

const ProfileHeader = ({ user, onLogout, subtitle }) => {
  const badge = ROLE_BADGE_CLASS[user?.role] || 'bg-secondary';

  return (
    <div className="card shadow border-0 mb-4">
      <div className="card-body p-4 d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <span className={`badge ${badge} mb-2`}>
            {ROLE_LABELS[user?.role] || user?.role}
          </span>
          <h2 className="mb-1">Welcome, {user?.name}</h2>
          <p className="text-muted mb-0">{user?.email}</p>
          {subtitle && <p className="small text-muted mt-2 mb-0">{subtitle}</p>}
        </div>
        {onLogout && (
          <button type="button" className="btn btn-outline-secondary" onClick={onLogout}>
            Log out
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
