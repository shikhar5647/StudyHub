import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyCreatedCourses } from '../../api/courses';
import ProfileHeader from '../ProfileHeader';

const InstructorDashboard = ({ user, onLogout }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCreatedCourses()
      .then((res) => setCourses(res.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-5">
      <ProfileHeader
        user={user}
        onLogout={onLogout}
        subtitle="Instructor dashboard — create and manage your courses."
      />

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link to="/instructor/courses/new" className="btn btn-success">
          + Create course
        </Link>
        <Link to="/instructor/courses" className="btn btn-primary">
          Manage courses
        </Link>
        <Link to="/storage" className="btn btn-outline-primary">
          Storage
        </Link>
        <Link to="/profile" className="btn btn-outline-secondary">
          Profile
        </Link>
      </div>

      {/* Analytics Summary */}
      {!loading && courses.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card text-white bg-primary shadow-sm h-100 border-0">
              <div className="card-body">
                <h6 className="card-title opacity-75">Total Courses</h6>
                <h2 className="mb-0">{courses.length}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-success shadow-sm h-100 border-0">
              <div className="card-body">
                <h6 className="card-title opacity-75">Total Students</h6>
                <h2 className="mb-0">
                  {courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0)}
                </h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-info shadow-sm h-100 border-0">
              <div className="card-body">
                <h6 className="card-title opacity-75">Estimated Revenue</h6>
                <h2 className="mb-0">
                  ${courses.reduce((acc, c) => acc + ((c.enrolledCount || 0) * (c.price || 0)), 0).toFixed(2)}
                </h2>
              </div>
            </div>
          </div>
        </div>
      )}

      <h3 className="h5 mb-3">Your courses ({courses.length})</h3>
      {loading && <p className="text-muted">Loading…</p>}
      {!loading && courses.length === 0 && (
        <div className="alert alert-info">
          No courses yet.{' '}
          <Link to="/instructor/courses/new">Create your first course</Link>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover bg-white shadow-sm rounded">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Students</th>
              <th>Lessons</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c._id}>
                <td>{c.title}</td>
                <td>
                  <span className={`badge ${c.published ? 'bg-success' : 'bg-secondary'}`}>
                    {c.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>{c.enrolledCount || 0}</td>
                <td>{c.metadata?.totalLessons || 0}</td>
                <td className="text-end">
                  <Link
                    to={`/instructor/courses/${c.slug}/edit`}
                    className="btn btn-sm btn-outline-primary me-1"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/courses/${c.slug}`}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorDashboard;
