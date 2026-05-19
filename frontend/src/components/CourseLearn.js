import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCheckCircle, FaCircle } from 'react-icons/fa';
import FlashcardQuiz from './FlashcardQuiz';
import { getCourse } from '../api/courses';
import {
  getCourseProgress,
  markLessonComplete,
  setLastLesson,
} from '../api/progress';
import { getAccessToken, getStoredUser } from '../utils/auth';
import { isStudent } from '../utils/rbac';

function youtubeEmbedUrl(url) {
  if (!url) return null;
  if (url.includes('embed/')) return url;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function lessonKey(lesson, mi, li) {
  return lesson._id?.toString() || `${mi}-${li}-${lesson.order}`;
}

const CourseLearn = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const flatLessons = useMemo(() => {
    if (!course?.modules) return [];
    const items = [];
    course.modules
      .slice()
      .sort((a, b) => a.order - b.order)
      .forEach((mod, mi) => {
        (mod.lessons || [])
          .slice()
          .sort((a, b) => a.order - b.order)
          .forEach((lesson, li) => {
            items.push({
              key: lessonKey(lesson, mi, li),
              lesson,
              moduleTitle: mod.title,
            });
          });
      });
    return items;
  }, [course]);

  const completedSet = useMemo(
    () => new Set(progress?.completedLessonIds || []),
    [progress]
  );

  const loadProgress = () =>
    getCourseProgress(slug)
      .then((res) => setProgress(res.data))
      .catch(() => {});

  useEffect(() => {
    if (!getAccessToken()) {
      navigate(`/login?redirect=/courses/${slug}/learn`);
      return;
    }
    if (!isStudent(getStoredUser())) {
      navigate(`/courses/${slug}`);
      return;
    }

    Promise.all([getCourse(slug), getCourseProgress(slug)])
      .then(([courseRes, progRes]) => {
        if (!courseRes.data.enrolled) {
          toast.info('Enroll first');
          navigate(`/courses/${slug}`);
          return;
        }
        const c = courseRes.data.course;
        setCourse(c);
        setEnrolled(true);
        setProgress(progRes.data);

        const lastId = progRes.data?.lastLessonId;
        const fromLast = flatLessonsFromCourse(c).find((x) => x.key === lastId);
        const first = flatLessonsFromCourse(c)[0];
        setActiveKey(fromLast?.key || first?.key || null);
      })
      .catch((err) => {
        toast.error(err.message);
        navigate('/courses');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!activeKey || !enrolled) return;
    setLastLesson(slug, activeKey).then((res) => setProgress(res.data)).catch(() => {});
  }, [activeKey, enrolled, slug]);

  const active = flatLessons.find((x) => x.key === activeKey) || flatLessons[0];
  const isComplete = active && completedSet.has(active.key);

  const handleMarkComplete = async () => {
    if (!active) return;
    setMarking(true);
    try {
      const res = await markLessonComplete(slug, active.key);
      setProgress(res.data);
      if (res.data.isComplete) {
        toast.success('Course completed! 🎉');
      } else {
        toast.success('Lesson marked complete');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setMarking(false);
    }
  };

  const renderLessonBody = (lesson) => {
    const { content } = lesson;
    if (!content) return <p className="text-muted">No content for this lesson.</p>;

    if (content.provider === 'youtube' && content.url) {
      return (
        <div className="ratio ratio-16x9 bg-dark rounded overflow-hidden">
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
      if (lesson.type === 'quiz') {
        try {
          const quiz = JSON.parse(content.markdown);
          if (quiz.format === 'flashcard' && quiz.cards) {
            return <FlashcardQuiz cards={quiz.cards} />;
          }
        } catch {
          // fall through to plain text rendering
        }
      }
      return (
        <div className="p-4 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
          {content.markdown}
        </div>
      );
    }

    if (content.url) {
      return (
        <a href={content.url} target="_blank" rel="noreferrer" className="btn btn-primary">
          Open lesson resource
        </a>
      );
    }

    return <p className="text-muted">Unsupported lesson format.</p>;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading course…</p>
      </div>
    );
  }

  if (!course || !enrolled) return null;

  const pct = progress?.percentComplete ?? 0;

  return (
    <div className="container-fluid py-4">
      <div className="mb-3">
        <div className="d-flex justify-content-between small mb-1">
          <span>Your progress</span>
          <span>{pct}%</span>
        </div>
        <div className="progress" style={{ height: 8 }}>
          <div
            className="progress-bar bg-success"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
          />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4 col-xl-3">
          <Link
            to={`/courses/${slug}`}
            className="small text-decoration-none d-inline-flex align-items-center gap-1 mb-3"
          >
            <FaArrowLeft /> Course overview
          </Link>
          <h2 className="h5">{course.title}</h2>
          <p className="small text-muted">
            {progress?.completedLessons || 0} / {progress?.totalLessons || 0} lessons
          </p>
          <div className="list-group shadow-sm">
            {flatLessons.map((item) => {
              const done = completedSet.has(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`list-group-item list-group-item-action text-start ${
                    active?.key === item.key ? 'active' : ''
                  }`}
                  onClick={() => setActiveKey(item.key)}
                >
                  <div className="d-flex align-items-start gap-2">
                    {done ? (
                      <FaCheckCircle className="mt-1 text-success flex-shrink-0" />
                    ) : (
                      <FaCircle className="mt-1 flex-shrink-0" size={12} />
                    )}
                    <div>
                      <div className="small opacity-75">{item.moduleTitle}</div>
                      <div className="fw-semibold">{item.lesson.title}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-lg-8 col-xl-9">
          {active ? (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <span className="badge bg-primary me-2 text-capitalize">
                    {active.lesson.type}
                  </span>
                  <h1 className="h4 mb-0 d-inline">{active.lesson.title}</h1>
                </div>
                <button
                  type="button"
                  className={`btn btn-sm ${isComplete ? 'btn-success' : 'btn-outline-success'}`}
                  disabled={marking || isComplete}
                  onClick={handleMarkComplete}
                >
                  {isComplete ? 'Completed' : 'Mark as complete'}
                </button>
              </div>
              <div className="card-body">{renderLessonBody(active.lesson)}</div>
            </div>
          ) : (
            <p className="text-muted">No lessons in this course yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

function flatLessonsFromCourse(course) {
  const items = [];
  (course.modules || [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((mod, mi) => {
      (mod.lessons || [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .forEach((lesson, li) => {
          items.push({
            key: lessonKey(lesson, mi, li),
            lesson,
            moduleTitle: mod.title,
          });
        });
    });
  return items;
}

export default CourseLearn;
