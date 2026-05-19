import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaBook, FaClock, FaPlay, FaUser, FaUsers } from 'react-icons/fa';
import { getCourse, unenrollFromCourse } from '../api/courses';
import { API_BASE } from '../config/api';
import { getAccessToken, getStoredUser, saveAuthSession } from '../utils/auth';
import { isAdmin, isInstructor, isStudent } from '../utils/rbac';
import EnrollButton from './EnrollButton';

function formatDuration(seconds) {
  if (!seconds) return null;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

const CourseDetail = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (token) {
        const meRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meData = await meRes.json();
        if (meRes.ok) {
          setUser(meData.data);
          saveAuthSession({ accessToken: token, user: meData.data });
        }
      }

      const res = await getCourse(slug);
      setCourse(res.data.course);
      setEnrolled(Boolean(res.data.enrolled));
    } catch (err) {
      toast.error(err.message || 'Course not found');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (searchParams.get('enroll') === '1' && user && isStudent(user) && !enrolled && !loading) {
      toast.info('Click Enroll for free to join this course');
    }
  }, [searchParams, user, enrolled, loading]);

  const handleUnenroll = async () => {
    setActionLoading(true);
    try {
      await unenrollFromCourse(slug);
      setEnrolled(false);
      toast.success('You left this course');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading course…</p>
      </div>
    );
  }

  if (!course) return null;

  const instructor = course.instructor;
  const modules = [...(course.modules || [])].sort((a, b) => a.order - b.order);
  const instructorId = instructor?._id?.toString?.() || instructor?._id;
  const canManage =
    isAdmin(user) ||
    (isInstructor(user) &&
      instructorId &&
      String(user?._id) === String(instructorId));

  return (
    <div className="pb-5">
      <div
        className="py-5 text-white"
        style={{
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        }}
      >
        <div className="container">
          <Link
            to="/courses"
            className="text-white text-decoration-none small d-inline-flex align-items-center gap-2 mb-3"
          >
            <FaArrowLeft /> Back to courses
          </Link>
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="mb-2">
                {course.category && (
                  <span className="badge bg-light text-dark me-2">{course.category}</span>
                )}
                <span className="badge bg-warning text-dark">{course.level}</span>
                {enrolled && isStudent(user) && (
                  <span className="badge bg-success ms-2">You are enrolled</span>
                )}
              </div>
              <h1 className="display-5 fw-bold">{course.title}</h1>
              <p className="lead mb-3">{course.description}</p>
              <div className="d-flex flex-wrap gap-3 small">
                {instructor && (
                  <span className="d-flex align-items-center gap-1">
                    <FaUser /> {instructor.name}
                  </span>
                )}
                <span className="d-flex align-items-center gap-1">
                  <FaBook /> {course.metadata?.totalLessons || 0} lessons
                </span>
                {course.metadata?.totalDurationSec > 0 && (
                  <span className="d-flex align-items-center gap-1">
                    <FaClock /> {formatDuration(course.metadata.totalDurationSec)}
                  </span>
                )}
                <span className="d-flex align-items-center gap-1">
                  <FaUsers /> {course.enrolledCount || 0} students
                </span>
              </div>
            </div>
            <div className="col-lg-4 text-lg-end">
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: 200 }}
                />
              )}
            </div>
          </div>

          <div className="mt-4 d-flex flex-wrap gap-2 align-items-center">
            {canManage && (
              <Link
                to={`/instructor/courses/${course.slug}/edit`}
                className="btn btn-warning"
              >
                Edit course
              </Link>
            )}

            {isStudent(user) && (
              <>
                <EnrollButton
                  courseSlug={course.slug}
                  isEnrolled={enrolled}
                  size="lg"
                  onEnrolled={load}
                />
                {enrolled && (
                  <Link
                    to={`/courses/${course.slug}/learn`}
                    className="btn btn-success btn-lg d-inline-flex align-items-center gap-2"
                  >
                    <FaPlay /> Start learning
                  </Link>
                )}
                {enrolled && (
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    disabled={actionLoading}
                    onClick={handleUnenroll}
                  >
                    {actionLoading ? '…' : 'Leave course'}
                  </button>
                )}
              </>
            )}

            {!getAccessToken() && (
              <div className="d-flex flex-wrap gap-2">
                <Link
                  to={`/login?redirect=/courses/${course.slug}`}
                  className="btn btn-light btn-lg"
                >
                  Log in to enroll
                </Link>
                <Link to="/signup" className="btn btn-outline-light btn-lg">
                  Sign up as student
                </Link>
              </div>
            )}

            {getAccessToken() && isInstructor(user) && !canManage && (
              <span className="text-white-50 small">
                Log in with a student account to enroll and learn.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container py-5">
        <h2 className="h4 mb-3">What you will learn</h2>
        <p className="text-muted mb-4">
          {enrolled
            ? 'Open the lesson player to watch videos and read materials.'
            : 'Preview lessons marked below, or enroll to unlock everything.'}
        </p>

        {modules.length === 0 && (
          <p className="text-muted">No modules published yet.</p>
        )}

        {modules.map((mod) => (
          <div key={mod._id || mod.order} className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h3 className="h5 mb-0">{mod.title}</h3>
              {mod.description && (
                <p className="text-muted small mb-0 mt-1">{mod.description}</p>
              )}
            </div>
            <ul className="list-group list-group-flush">
              {[...(mod.lessons || [])]
                .sort((a, b) => a.order - b.order)
                .map((lesson) => {
                  const locked = !enrolled && !lesson.isPreviewable;
                  return (
                    <li key={lesson._id || lesson.order} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{lesson.title}</strong>
                          <span className="badge bg-secondary ms-2 text-capitalize">
                            {lesson.type}
                          </span>
                          {lesson.isPreviewable && !enrolled && (
                            <span className="badge bg-info ms-1">Free preview</span>
                          )}
                          {locked && (
                            <span className="badge bg-light text-dark border ms-1">
                              Enroll to unlock
                            </span>
                          )}
                        </div>
                        {!locked && enrolled && (
                          <Link
                            to={`/courses/${course.slug}/learn`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Open
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetail;
