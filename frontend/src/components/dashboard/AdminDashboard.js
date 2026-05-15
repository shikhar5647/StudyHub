import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyCreatedCourses } from '../../api/courses';
import { listUsers, updateUserRole } from '../../api/users';
import { ROLE_LABELS } from '../../utils/rbac';
import ProfileHeader from '../ProfileHeader';

const AdminDashboard = ({ user, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([getMyCreatedCourses(), listUsers()])
      .then(([cRes, uRes]) => {
        setCourses(cRes.data || []);
        setUsers(uRes.data || []);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      toast.success('Role updated');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container py-5">
      <ProfileHeader
        user={user}
        onLogout={onLogout}
        subtitle="Admin dashboard — manage users and all courses."
      />

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link to="/instructor/courses/new" className="btn btn-success">
          + Create course
        </Link>
        <Link to="/courses" className="btn btn-primary">
          All courses (public)
        </Link>
        <Link to="/profile" className="btn btn-outline-secondary">
          Profile
        </Link>
      </div>

      {loading ? (
        <p>Loading admin data…</p>
      ) : (
        <>
          <h3 className="h5 mt-4">All courses ({courses.length})</h3>
          <div className="table-responsive mb-5">
            <table className="table table-sm table-hover bg-white shadow-sm">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Published</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id}>
                    <td>{c.title}</td>
                    <td>{c.instructor?.name || '—'}</td>
                    <td>{c.published ? 'Yes' : 'No'}</td>
                    <td>
                      <Link to={`/instructor/courses/${c.slug}/edit`}>Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="h5">Users ({users.length})</h3>
          <div className="table-responsive">
            <table className="table table-sm table-hover bg-white shadow-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Change role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{ROLE_LABELS[u.role] || u.role}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={u.role}
                        disabled={u._id === user._id}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
