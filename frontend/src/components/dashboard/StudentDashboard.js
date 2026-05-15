import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyEnrolledCourses } from '../../api/courses';
import CourseCard from '../CourseCard';
import ProfileHeader from '../ProfileHeader';

const StudentDashboard = ({ user, onLogout }) => {
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEnrolledCourses()
      .then((res) => setEnrolled(res.data || []))
      .catch(() => setEnrolled([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-5">
      <ProfileHeader
        user={user}
        onLogout={onLogout}
        subtitle="Student dashboard — enroll in courses and track your learning."
      />

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link to="/courses" className="btn btn-primary">
          Browse courses
        </Link>
        <Link to="/profile" className="btn btn-outline-secondary">
          My profile
        </Link>
      </div>

      <h3 className="h5 mb-3">Enrolled courses</h3>
      {loading && <p className="text-muted">Loading…</p>}
      {!loading && enrolled.length === 0 && (
        <p className="text-muted">
          You are not enrolled yet. <Link to="/courses">Find a course</Link>
        </p>
      )}
      <div className="row g-4">
        {enrolled.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
