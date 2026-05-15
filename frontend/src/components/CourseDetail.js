import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaBook, FaClock, FaUser, FaUsers } from 'react-icons/fa';
import { getCourse, enrollInCourse, unenrollFromCourse } from '../api/courses';
import { getAccessToken } from '../utils/auth';

function youtubeEmbedUrl(url) {
  if (!url) return null;
  if (url.includes('embed/')) return url;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function formatDuration(seconds) {
  if (!seconds) return null;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

const LessonContent = ({ lesson, canView }) => {
  if (!canView && !lesson.isPreviewable) {
    return (
      <p className="text-muted small mb-0">Enroll to access this lesson.</p>
    );
  }

  const { content } = lesson;
  if (!content) return null;

  if (content.provider === 'youtube' && content.url) {
    return (
      <div className="ratio ratio-16x9 mt-2">
        <iframe
          src={youtubeEmbedUrl(content.url)}
          title={lesson.title}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  if (content.provider === 'inline' && content.markdown) {
    return (
      <div
        className="mt-2 p-3 bg-light rounded small"
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {content.markdown}
      </div>
    );
  }

  if (content.url) {
    return (
      <a href={content.url} target="_blank" rel="noreferrer" className="small">
        Open resource
      </a>
    );
  }

  return null;
};

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
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

  const handleEnroll = async () => {
    if (!getAccessToken()) {
      toast.info('Please log in to enroll');
      navigate('/login');
      return;
    }
    setActionLoading(true);
    try {
      await enrollInCourse(slug);
      setEnrolled(true);
      toast.success('You are enrolled!');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnenroll = async () => {
    setActionLoading(true);
    try {
      await unenrollFromCourse(slug);
      setEnrolled(false);
      toast.success('Unenrolled from course');
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

  return (
    <div className="pb-5">
      <div
        className="py-5 text-white"
        style={{
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        }}
      >
        <div className="container">
          <Link to="/courses" className="text-white text-decoration-none small d-inline-flex align-items-center gap-2 mb-3">
            <FaArrowLeft /> Back to courses
          </Link>
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="mb-2">
                {course.category && (
                  <span className="badge bg-light text-dark me-2">{course.category}</span>
                )}
                <span className="badge bg-warning text-dark">{course.level}</span>
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
          <div className="mt-4">
            {enrolled ? (
              <button
                type="button"
                className="btn btn-outline-light"
                disabled={actionLoading}
                onClick={handleUnenroll}
              >
                {actionLoading ? 'Processing…' : 'Unenroll'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-light btn-lg"
                disabled={actionLoading}
                onClick={handleEnroll}
              >
                {actionLoading ? 'Processing…' : 'Enroll for free'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-5">
        <h2 className="h4 mb-4">Course content</h2>
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
                  const canView = enrolled || lesson.isPreviewable;
                  return (
                    <li key={lesson._id || lesson.order} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <strong>{lesson.title}</strong>
                          <span className="badge bg-secondary ms-2 text-capitalize">
                            {lesson.type}
                          </span>
                          {lesson.isPreviewable && !enrolled && (
                            <span className="badge bg-info ms-1">Preview</span>
                          )}
                        </div>
                        {lesson.content?.durationSec > 0 && (
                          <small className="text-muted">
                            {formatDuration(lesson.content.durationSec)}
                          </small>
                        )}
                      </div>
                      <LessonContent lesson={lesson} canView={canView} />
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
