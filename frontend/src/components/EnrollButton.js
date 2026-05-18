import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { enrollInCourse } from '../api/courses';
import { getAccessToken, getStoredUser } from '../utils/auth';
import { isStudent } from '../utils/rbac';

/**
 * Reusable enroll CTA — works on course cards and detail pages.
 */
const EnrollButton = ({
  courseSlug,
  isEnrolled = false,
  size = 'sm',
  className = '',
  onEnrolled,
  showContinue = true,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const user = getStoredUser();
  const token = getAccessToken();

  const handleEnroll = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!token) {
      toast.info('Log in as a student to enroll');
      navigate(`/login?redirect=/courses/${courseSlug}`);
      return;
    }

    if (!isStudent(user)) {
      toast.info('Only student accounts can enroll. Sign up as a student or use the demo student account.');
      return;
    }

    if (isEnrolled) {
      navigate(`/courses/${courseSlug}/learn`);
      return;
    }

    setLoading(true);
    try {
      await enrollInCourse(courseSlug);
      toast.success('You joined this course!');
      onEnrolled?.();
    } catch (err) {
      toast.error(err.message || 'Could not enroll');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Link
        to={`/login?redirect=/courses/${courseSlug}`}
        className={`btn btn-${size === 'lg' ? 'primary' : 'outline-primary'} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        Log in to enroll
      </Link>
    );
  }

  if (!isStudent(user)) {
    return null;
  }

  if (isEnrolled && showContinue) {
    return (
      <div className={`d-flex flex-column gap-1 ${className}`}>
        <span className="badge bg-success align-self-start">Enrolled</span>
        <Link
          to={`/courses/${courseSlug}/learn`}
          className={`btn btn-success btn-${size}`}
          onClick={(e) => e.stopPropagation()}
        >
          Continue learning
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`btn btn-primary btn-${size} ${className}`}
      disabled={loading}
      onClick={handleEnroll}
    >
      {loading ? 'Joining…' : isEnrolled ? 'Go to course' : 'Enroll for free'}
    </button>
  );
};

export default EnrollButton;
