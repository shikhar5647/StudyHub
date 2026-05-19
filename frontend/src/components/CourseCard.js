import React from 'react';
import { Link } from 'react-router-dom';
import EnrollButton from './EnrollButton';

const GRADIENTS = [
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
];

function gradientFor(title = '') {
  const index = title.length % GRADIENTS.length;
  return GRADIENTS[index];
}

function formatDuration(seconds) {
  if (!seconds) return null;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

const CourseCard = ({ course, isEnrolled = false, showEnroll = false }) => {
  const gradient = gradientFor(course.title);
  const lessons = course.metadata?.totalLessons ?? 0;
  const duration = formatDuration(course.metadata?.totalDurationSec);

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
      <div
        className="card h-100 border-0 shadow-sm course-card-hover"
        style={{ borderRadius: '12px', overflow: 'hidden' }}
      >
        <div style={{ height: '180px', overflow: 'hidden' }}>
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div
              className="d-flex align-items-center justify-content-center h-100"
              style={{ background: gradient }}
            >
              <h5 className="text-white text-center px-3 mb-0">{course.title}</h5>
            </div>
          )}
        </div>
        <div className="card-body d-flex flex-column">
          <div className="mb-2">
            {course.category && (
              <span className="badge bg-light text-dark border me-1">{course.category}</span>
            )}
            {course.level && (
              <span className="badge bg-primary">{course.level}</span>
            )}
          </div>
          <h5 className="card-title">{course.title}</h5>
          <p className="card-text text-muted small flex-grow-1">
            {course.description?.length > 120
              ? `${course.description.slice(0, 120)}…`
              : course.description}
          </p>
          <p className="small text-muted mb-2">
            {lessons > 0 && `${lessons} lesson${lessons !== 1 ? 's' : ''}`}
            {duration && ` · ${duration}`}
            {course.enrolledCount > 0 && ` · ${course.enrolledCount} enrolled`}
          </p>
          <div className="d-grid gap-2">
            {showEnroll ? (
              <EnrollButton
                courseSlug={course.slug}
                isEnrolled={isEnrolled}
                className="w-100"
                onEnrolled={() => window.location.reload()}
              />
            ) : null}
            <Link
              to={`/courses/${course.slug}`}
              className="btn btn-sm btn-outline-primary w-100"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
