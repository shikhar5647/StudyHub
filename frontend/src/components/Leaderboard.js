import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/users';
import './Leaderboard.css';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(res => {
        setUsers(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching leaderboard', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container mt-5 text-center">Loading Leaderboard...</div>;

  return (
    <div className="container mt-5 leaderboard-container">
      <h2 className="mb-4 text-center">🏆 Global Leaderboard</h2>
      <div className="card bg-dark text-white border-secondary">
        <div className="card-body p-0">
          <ul className="list-group list-group-flush">
            {users.map((u, index) => (
              <li key={u._id} className="list-group-item bg-dark text-white d-flex align-items-center border-secondary p-3">
                <span className="fs-4 fw-bold me-3 text-warning">#{index + 1}</span>
                <img src={u.avatar} alt="avatar" className="rounded-circle me-3" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                <div className="flex-grow-1">
                  <h5 className="mb-0">{u.name}</h5>
                  <small className="text-muted">
                    Streak: 🔥 {u.streak?.current || 0} Days
                  </small>
                </div>
                <div className="text-end">
                  <h4 className="mb-0 text-success">{u.xp || 0} XP</h4>
                  {u.badges && u.badges.length > 0 && (
                    <small className="text-muted">{u.badges.length} Badges</small>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {users.length === 0 && <div className="p-4 text-center text-muted">No users found.</div>}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
