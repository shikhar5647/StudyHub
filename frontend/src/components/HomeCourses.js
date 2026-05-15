import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen } from 'react-icons/fa';
import { listCourses } from '../api/courses';
import CourseCard from './CourseCard';

const HomeCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCourses()
      .then((res) => setCourses((res.data || []).slice(0, 8)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="course-section py-5" style={{ background: '#f8f9fa' }}>
      <div className="container">
        <div className="section-heading text-center mb-5">
          <FaBookOpen size={40} className="text-primary mb-3" />
          <h2 className="display-5 fw-bold">Explore Our Courses</h2>
          <div
            className="title-underline mx-auto mb-4"
            style={{
              width: '80px',
              height: '4px',
              background: 'linear-gradient(to right, #6a11cb, #2575fc)',
            }}
          />
          <p className="lead text-muted">
            Discover courses from StudyHub instructors — enroll and start learning today.
          </p>
        </div>

        {loading && <p className="text-center text-muted">Loading courses…</p>}

        {!loading && courses.length === 0 && (
          <div className="alert alert-info text-center">
            No courses yet. Instructors can add courses, or run{' '}
            <code>npm run seed:courses</code> in the backend.
          </div>
        )}

        <div className="row g-4">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>

        {courses.length > 0 && (
          <div className="text-center mt-4">
            <Link to="/courses" className="btn btn-primary btn-lg">
              View all courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeCourses;
