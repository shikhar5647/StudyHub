import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import {
  FaChartLine, FaFire, FaTrophy, FaBookOpen, FaClock,
  FaBolt, FaMedal, FaGraduationCap, FaCalendarAlt, FaArrowUp,
} from 'react-icons/fa';
import { getStudentAnalytics } from '../api/analytics';
import './StudentAnalytics.css';

const COLORS = ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#0984e3', '#d63031', '#00cec9', '#e84393'];

/* ── GitHub-style Heatmap ── */
function StudyHeatmap({ data }) {
  const today = new Date();
  const cellSize = 13;
  const cellGap = 3;
  const totalDays = 365;
  const weeks = Math.ceil(totalDays / 7);

  const dateMap = useMemo(() => {
    const map = {};
    (data || []).forEach((d) => { map[d.date] = d.count; });
    return map;
  }, [data]);

  const cells = useMemo(() => {
    const result = [];
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const dayOffset = (weeks - 1 - w) * 7 + (6 - d);
        const cellDate = new Date(today);
        cellDate.setDate(today.getDate() - dayOffset);
        const key = cellDate.toISOString().split('T')[0];
        const count = dateMap[key] || 0;
        result.push({ x: w, y: d, date: key, count });
      }
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateMap, weeks]);

  const getColor = (count) => {
    if (count === 0) return 'var(--heatmap-empty)';
    if (count === 1) return 'var(--heatmap-l1)';
    if (count <= 3) return 'var(--heatmap-l2)';
    if (count <= 5) return 'var(--heatmap-l3)';
    return 'var(--heatmap-l4)';
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="heatmap-container">
      <div className="heatmap-months">
        {months.map((m) => (<span key={m} className="heatmap-month-label">{m}</span>))}
      </div>
      <svg
        width={weeks * (cellSize + cellGap) + 30}
        height={7 * (cellSize + cellGap) + 10}
        className="heatmap-svg"
      >
        {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, i) => (
          <text key={i} x={0} y={i * (cellSize + cellGap) + cellSize} className="heatmap-day-label" fontSize={9}>
            {label}
          </text>
        ))}
        {cells.map((cell, i) => (
          <rect
            key={i}
            x={cell.x * (cellSize + cellGap) + 28}
            y={cell.y * (cellSize + cellGap)}
            width={cellSize}
            height={cellSize}
            rx={2}
            fill={getColor(cell.count)}
            className="heatmap-cell"
          >
            <title>{`${cell.date}: ${cell.count} lesson${cell.count !== 1 ? 's' : ''}`}</title>
          </rect>
        ))}
      </svg>
      <div className="heatmap-legend">
        <span>Less</span>
        {[0, 1, 2, 4, 6].map((v) => (
          <span key={v} className="heatmap-legend-cell" style={{ backgroundColor: getColor(v) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="analytics-stat-card">
      <div className="stat-card-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-card-info">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
        {sub && <div className="stat-card-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ── Main Component ── */
const StudentAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStudentAnalytics()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner-border text-primary" role="status" />
        <p>Loading your analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <h4>Oops!</h4>
        <p>{error}</p>
        <Link to="/dashboard" className="btn btn-outline-primary">Back to Dashboard</Link>
      </div>
    );
  }

  if (!data) return null;

  const { heatmap, weeklyStudy, velocity, topicStrengths, courseProgress, streakInfo, lessonTypes } = data;

  const totalMinutes = (weeklyStudy || []).reduce((s, w) => s + w.totalMinutes, 0);
  const totalLessonsCompleted = (courseProgress || []).reduce((s, c) => s + c.completedLessons, 0);

  const lessonTypeData = [
    { name: 'Video', value: lessonTypes?.video || 0 },
    { name: 'Notes', value: lessonTypes?.note || 0 },
    { name: 'Quiz', value: lessonTypes?.quiz || 0 },
    { name: 'Assignment', value: lessonTypes?.assignment || 0 },
  ].filter((d) => d.value > 0);

  const radarData = (topicStrengths || []).slice(0, 8).map((t) => ({
    subject: t.category,
    score: t.score,
    fullMark: 100,
  }));

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">
            <FaChartLine className="me-2" />
            Study Analytics
          </h2>
          <p className="analytics-subtitle">Your personalized learning insights</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
          Back to Dashboard
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="analytics-stats-grid">
        <StatCard icon={<FaFire size={24} />} label="Current Streak" value={`${streakInfo.currentStreak} days`} sub={`Longest: ${streakInfo.longestStreak} days`} color="#e17055" />
        <StatCard icon={<FaBolt size={24} />} label="Total XP" value={streakInfo.totalXp.toLocaleString()} sub={`${streakInfo.badges?.length || 0} badges earned`} color="#fdcb6e" />
        <StatCard icon={<FaBookOpen size={24} />} label="Lessons Completed" value={totalLessonsCompleted} sub={`across ${streakInfo.totalCoursesEnrolled} courses`} color="#6c5ce7" />
        <StatCard icon={<FaClock size={24} />} label="Study Time" value={`${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m`} sub="last 12 weeks" color="#00b894" />
        <StatCard icon={<FaGraduationCap size={24} />} label="Courses Completed" value={streakInfo.totalCoursesCompleted} sub={`of ${streakInfo.totalCoursesEnrolled} enrolled`} color="#0984e3" />
        <StatCard icon={<FaMedal size={24} />} label="Badges" value={streakInfo.badges?.length || 0} sub={streakInfo.badges?.slice(-1)[0]?.name || 'Keep learning!'} color="#d63031" />
      </div>

      {/* ── Study Heatmap ── */}
      <div className="analytics-card analytics-card-full">
        <h5 className="analytics-card-title">
          <FaCalendarAlt className="me-2" />
          Study Activity
        </h5>
        <p className="analytics-card-desc">Your daily learning activity over the past year</p>
        <StudyHeatmap data={heatmap} />
      </div>

      {/* ── Charts Row: Weekly Study + Velocity ── */}
      <div className="analytics-charts-row">
        <div className="analytics-card">
          <h5 className="analytics-card-title">Weekly Study Time</h5>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyStudy || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="var(--chart-text)" tickFormatter={(v) => `W${v}`} />
              <YAxis stroke="var(--chart-text)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-text)' }} />
              <Bar dataKey="totalMinutes" name="Minutes" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lessonsCompleted" name="Lessons" fill="#00b894" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card">
          <h5 className="analytics-card-title">
            <FaArrowUp className="me-2" />
            Learning Velocity
          </h5>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={velocity || []}>
              <defs>
                <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="week" stroke="var(--chart-text)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--chart-text)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-text)' }} />
              <Area type="monotone" dataKey="lessonsPerWeek" name="Lessons/Week" stroke="#6c5ce7" fill="url(#velocityGrad)" strokeWidth={2} />
              <Line type="monotone" dataKey="minutesPerWeek" name="Minutes/Week" stroke="#00b894" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row: Topic Strengths + Lesson Types ── */}
      <div className="analytics-charts-row">
        {radarData.length > 2 && (
          <div className="analytics-card">
            <h5 className="analytics-card-title">
              <FaTrophy className="me-2" />
              Topic Strengths
            </h5>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--chart-grid)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--chart-text)" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--chart-grid)" />
                <Radar name="Score" dataKey="score" stroke="#6c5ce7" fill="#6c5ce7" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {lessonTypeData.length > 0 && (
          <div className="analytics-card">
            <h5 className="analytics-card-title">Lesson Type Breakdown</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={lessonTypeData} cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {lessonTypeData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: 8, color: 'var(--chart-text)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Course Progress Table ── */}
      <div className="analytics-card analytics-card-full">
        <h5 className="analytics-card-title">
          <FaBookOpen className="me-2" />
          Course Progress
        </h5>
        <div className="analytics-table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Progress</th>
                <th>Completed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(courseProgress || []).map((cp) => (
                <tr key={cp.courseId}>
                  <td>
                    <Link to={`/courses/${cp.slug}/learn`} className="analytics-course-link">
                      {cp.title}
                    </Link>
                  </td>
                  <td><span className="analytics-badge">{cp.category}</span></td>
                  <td>
                    <div className="analytics-progress-bar">
                      <div className="analytics-progress-fill" style={{ width: `${cp.percentComplete}%` }} />
                      <span className="analytics-progress-text">{cp.percentComplete}%</span>
                    </div>
                  </td>
                  <td>{cp.completedLessons} / {cp.totalLessons}</td>
                  <td>
                    {cp.isComplete ? (
                      <span className="analytics-status analytics-status-complete">Completed</span>
                    ) : (
                      <span className="analytics-status analytics-status-progress">In Progress</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!courseProgress || courseProgress.length === 0) && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No courses enrolled yet. <Link to="/courses">Browse courses</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Badges ── */}
      {streakInfo.badges?.length > 0 && (
        <div className="analytics-card analytics-card-full">
          <h5 className="analytics-card-title">
            <FaMedal className="me-2" />
            Badges Earned
          </h5>
          <div className="analytics-badges-grid">
            {streakInfo.badges.map((badge, i) => (
              <div key={i} className="analytics-badge-item">
                <div className="analytics-badge-icon">
                  <FaTrophy size={20} />
                </div>
                <div className="analytics-badge-name">{badge.name}</div>
                <div className="analytics-badge-date">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnalytics;
