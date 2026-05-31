import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlayCircle, FaAward } from 'react-icons/fa';
import { getMyProgress, downloadCertificate } from '../../api/progress';
import ProfileHeader from '../ProfileHeader';

const StudentDashboard = ({ user, onLogout }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProgress()
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-5">
      <ProfileHeader
        user={user}
        onLogout={onLogout}
        subtitle="Student dashboard — continue where you left off."
      />

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link to="/courses" className="btn btn-primary">
          Browse courses
        </Link>
        <Link to="/analytics" className="btn btn-outline-primary">
          Study Analytics
        </Link>
        <Link to="/profile" className="btn btn-outline-secondary">
          My profile
        </Link>
      </div>

      <h3 className="h5 mb-3">My learning</h3>
      {loading && <p className="text-muted">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="text-muted">
          You are not enrolled yet. <Link to="/courses">Find a course</Link>
        </p>
      )}

      <div className="row g-4">
        {items.map(({ course, progress }) => {
          const pct = progress?.percentComplete ?? 0;
          const learnUrl = `/courses/${course.slug}/learn`;

          return (
            <div key={course._id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt=""
                    className="card-img-top"
                    style={{ height: 140, objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="card-img-top bg-primary d-flex align-items-center justify-content-center text-white"
                    style={{ height: 140 }}
                  >
                    <span className="px-3 text-center fw-semibold">{course.title}</span>
                  </div>
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{course.title}</h5>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <p className="small text-muted mb-3">
                    {progress?.completedLessons ?? 0} / {progress?.totalLessons ?? 0}{' '}
                    lessons
                    {progress?.isComplete && (
                      <span className="badge bg-success ms-2">Completed</span>
                    )}
                  </p>
                  <div className="mt-auto d-grid gap-2">
                    <Link to={learnUrl} className="btn btn-primary btn-sm">
                      <FaPlayCircle className="me-1" />
                      {pct > 0 && !progress?.isComplete
                        ? 'Continue learning'
                        : progress?.isComplete
                          ? 'Review course'
                          : 'Start learning'}
                    </Link>
                    {progress?.isComplete && (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          downloadCertificate(course.slug)
                            .then((blob) => {
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `StudyHub_Certificate_${course.slug}.pdf`;
                              a.click();
                              URL.revokeObjectURL(url);
                            })
                            .catch((err) => alert(err.message));
                        }}
                      >
                        <FaAward className="me-1" />
                        Download Certificate
                      </button>
                    )}
                    <Link
                      to={`/courses/${course.slug}`}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Course overview
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDashboard;
