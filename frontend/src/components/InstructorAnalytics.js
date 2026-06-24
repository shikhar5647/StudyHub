import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import {
  FaChartBar, FaUsers, FaStar, FaBookOpen, FaArrowLeft,
  FaChartPie, FaLayerGroup, FaTrophy, FaChartLine,
} from 'react-icons/fa';
import { getCourseAnalytics, getInstructorOverview } from '../api/analytics';
import './StudentAnalytics.css'; // shared styles

const COLORS = ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#0984e3', '#d63031', '#00cec9', '#e84393'];
const RATING_COLORS = { 5: '#00b894', 4: '#00cec9', 3: '#fdcb6e', 2: '#e17055', 1: '#d63031' };

/* ── Stat Card (reused) ── */
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="analytics-stat-card">
      <div className="stat-card-icon" style={{ color }}>{icon}</div>
      <div className="stat-card-info">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
        {sub && <div className="stat-card-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ── Completion Gauge ── */
function CompletionGauge({ percent }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="gauge-container">
      <svg width={150} height={150} viewBox="0 0 150 150">
        <circle cx={75} cy={75} r={radius} fill="none" stroke="var(--chart-grid)" strokeWidth={10} />
        <circle
          cx={75} cy={75} r={radius} fill="none"
          stroke={percent >= 70 ? '#00b894' : percent >= 40 ? '#fdcb6e' : '#e17055'}
          strokeWidth={10} strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 75 75)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x={75} y={75} textAnchor="middle" dominantBaseline="middle" className="gauge-text" fill="var(--chart-text)" fontSize={24} fontWeight="bold">
          {percent}%
        </text>
      </svg>
      <div className="gauge-label">Avg. Completion</div>
    </div>
  );
}

/* ── Course Detail Analytics ── */
const CourseAnalyticsDetail = ({ slug }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCourseAnalytics(slug)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="analytics-loading"><div className="spinner-border text-primary" role="status" /><p>Loading course analytics...</p></div>;
  if (error) return <div className="analytics-error"><h4>Error</h4><p>{error}</p></div>;
  if (!data) return null;

  const { courseInfo, enrollmentTrend, dropOff, ratingBreakdown, dailyActivity, lessonTypeDist, topStudents } = data;

  const ratingData = Object.entries(ratingBreakdown)
    .map(([stars, count]) => ({ name: `${stars} Star`, value: count, stars: parseInt(stars) }))
    .filter((d) => d.value > 0);

  const lessonTypeData = Object.entries(lessonTypeDist)
    .map(([type, count]) => ({ name: type.charAt(0).toUpperCase() + type.slice(1), value: count }))
    .filter((d) => d.value > 0);

  return (
    <>
      {/* Stats */}
      <div className="analytics-stats-grid">
        <StatCard icon={<FaUsers size={24} />} label="Total Enrolled" value={courseInfo.totalEnrolled} color="#6c5ce7" />
        <StatCard icon={<FaTrophy size={24} />} label="Completed" value={courseInfo.totalCompleted} sub={`${courseInfo.avgProgress}% avg progress`} color="#00b894" />
        <StatCard icon={<FaStar size={24} />} label="Avg Rating" value={courseInfo.avgRating.toFixed(1)} sub={`${courseInfo.totalRatings} reviews`} color="#fdcb6e" />
        <StatCard icon={<FaBookOpen size={24} />} label="Total Lessons" value={courseInfo.totalLessons} color="#0984e3" />
      </div>

      {/* Enrollment Trend + Completion Gauge */}
      <div className="analytics-charts-row">
        <div className="analytics-card" style={{ flex: 2 }}>
          <h5 className="analytics-card-title"><FaChartLine className="me-2" />Active Students (Monthly)</h5>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={enrollmentTrend || []}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="month" stroke="var(--chart-text)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--chart-text)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-text)' }} />
              <Area type="monotone" dataKey="activeStudents" name="Active Students" stroke="#6c5ce7" fill="url(#enrollGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="analytics-card analytics-card-center" style={{ flex: 1 }}>
          <h5 className="analytics-card-title">Completion Rate</h5>
          <CompletionGauge percent={courseInfo.avgProgress} />
        </div>
      </div>

      {/* Drop-off + Ratings */}
      <div className="analytics-charts-row">
        <div className="analytics-card">
          <h5 className="analytics-card-title"><FaLayerGroup className="me-2" />Lesson Completion Rates</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dropOff || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis type="number" domain={[0, 100]} stroke="var(--chart-text)" tick={{ fontSize: 11 }} />
              <YAxis dataKey="title" type="category" width={120} stroke="var(--chart-text)" tick={{ fontSize: 10 }} tickFormatter={(v) => v.length > 15 ? v.substring(0, 15) + '...' : v} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-text)' }} formatter={(val) => `${val}%`} />
              <Bar dataKey="completionRate" name="Completion %" fill="#6c5ce7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card">
          <h5 className="analytics-card-title"><FaChartPie className="me-2" />Rating Distribution</h5>
          {ratingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={ratingData} cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {ratingData.map((entry) => (
                    <Cell key={entry.stars} fill={RATING_COLORS[entry.stars]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-text)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-empty-chart"><p>No ratings yet</p></div>
          )}
        </div>
      </div>

      {/* Daily Activity */}
      <div className="analytics-card analytics-card-full">
        <h5 className="analytics-card-title">Daily Activity (Last 30 Days)</h5>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={dailyActivity || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="date" stroke="var(--chart-text)" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis stroke="var(--chart-text)" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-text)' }} />
            <Legend />
            <Line type="monotone" dataKey="activeStudents" name="Active Students" stroke="#6c5ce7" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="lessonsCompleted" name="Lessons" stroke="#00b894" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Lesson Type + Top Students */}
      <div className="analytics-charts-row">
        {lessonTypeData.length > 0 && (
          <div className="analytics-card">
            <h5 className="analytics-card-title">Content Distribution</h5>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={lessonTypeData} cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {lessonTypeData.map((_, idx) => (<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-text)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="analytics-card">
          <h5 className="analytics-card-title"><FaTrophy className="me-2" />Top Students</h5>
          <div className="analytics-table-wrapper">
            <table className="analytics-table analytics-table-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Lessons Done</th>
                  <th>Status</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {(topStudents || []).map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.completedLessons}</td>
                    <td>
                      <span className={`analytics-status ${s.isComplete ? 'analytics-status-complete' : 'analytics-status-progress'}`}>
                        {s.isComplete ? 'Done' : 'Active'}
                      </span>
                    </td>
                    <td>{s.lastAccessed ? new Date(s.lastAccessed).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
                {(!topStudents || topStudents.length === 0) && (
                  <tr><td colSpan={4} className="text-center text-muted py-3">No student data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Main Instructor Analytics Page ── */
const InstructorAnalytics = () => {
  const { slug } = useParams();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(slug || null);

  useEffect(() => {
    if (!slug) {
      getInstructorOverview()
        .then((res) => setOverview(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner-border text-primary" role="status" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">
            <FaChartBar className="me-2" />
            {selectedCourse ? 'Course Analytics' : 'Instructor Dashboard'}
          </h2>
          <p className="analytics-subtitle">
            {selectedCourse ? 'Detailed insights for your course' : 'Overview of all your courses'}
          </p>
        </div>
        <div className="d-flex gap-2">
          {selectedCourse && (
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedCourse(null)}>
              <FaArrowLeft className="me-1" /> All Courses
            </button>
          )}
          <Link to="/instructor" className="btn btn-outline-secondary btn-sm">
            Back to Instructor Hub
          </Link>
        </div>
      </div>

      {selectedCourse ? (
        <CourseAnalyticsDetail slug={selectedCourse} />
      ) : (
        <>
          {/* Overview Stats */}
          {overview && (
            <>
              <div className="analytics-stats-grid">
                <StatCard icon={<FaBookOpen size={24} />} label="Total Courses" value={overview.summary.totalCourses} color="#6c5ce7" />
                <StatCard icon={<FaUsers size={24} />} label="Total Students" value={overview.summary.totalStudents} color="#00b894" />
                <StatCard icon={<FaStar size={24} />} label="Avg Rating" value={overview.summary.avgRating.toFixed(1)} color="#fdcb6e" />
                <StatCard icon={<FaLayerGroup size={24} />} label="Total Lessons" value={overview.summary.totalLessons} color="#0984e3" />
              </div>

              {/* Courses Table */}
              <div className="analytics-card analytics-card-full">
                <h5 className="analytics-card-title">
                  <FaBookOpen className="me-2" />
                  Your Courses
                </h5>
                <div className="analytics-table-wrapper">
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Lessons</th>
                        <th>Enrolled</th>
                        <th>Rating</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.courses.map((c) => (
                        <tr key={c.courseId}>
                          <td className="fw-semibold">{c.title}</td>
                          <td>{c.totalLessons}</td>
                          <td>{c.enrolledCount}</td>
                          <td>
                            <span className="text-warning me-1"><FaStar size={12} /></span>
                            {c.avgRating.toFixed(1)} ({c.totalRatings})
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedCourse(c.slug)}>
                              View Analytics
                            </button>
                          </td>
                        </tr>
                      ))}
                      {overview.courses.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-muted py-4">
                            No courses created yet. <Link to="/instructor/courses/new">Create one</Link>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Enrollment Comparison Chart */}
              {overview.courses.length > 0 && (
                <div className="analytics-card analytics-card-full">
                  <h5 className="analytics-card-title">Enrollment Comparison</h5>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={overview.courses}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                      <XAxis dataKey="title" stroke="var(--chart-text)" tick={{ fontSize: 11 }} tickFormatter={(v) => v.length > 15 ? v.substring(0, 15) + '...' : v} />
                      <YAxis stroke="var(--chart-text)" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-text)' }} />
                      <Legend />
                      <Bar dataKey="enrolledCount" name="Students" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="totalLessons" name="Lessons" fill="#00b894" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default InstructorAnalytics;
