import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCourses } from '../api/courses';
import { getAccessToken } from '../utils/auth';
import Signup from './Signup';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [courseLinks, setCourseLinks] = useState([]);
  const isLoggedIn = Boolean(getAccessToken());

  useEffect(() => {
    listCourses()
      .then((res) => setCourseLinks((res.data || []).slice(0, 8)))
      .catch(() => setCourseLinks([]));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/courses?search=${encodeURIComponent(q)}` : '/courses');
    setIsOpen(false);
  };

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [isLoggedIn]);

  useEffect(() => {
    listCourses()
      .then((res) => setCourseLinks((res.data || []).slice(0, 8)))
      .catch(() => setCourseLinks([]));
  }, []);

  const dashPath = user ? dashboardPathForRole(user.role) : '/dashboard';

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top bg-gray shadow-sm">
        <div className="container-fluid d-flex align-items-center">
          <Link className="navbar-brand" to="/">
            <img src="/studyhub_logo.png" alt="StudyHub Logo" height="50" />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`collapse navbar-collapse${isOpen ? ' show' : ''}`}>
            <ul className="navbar-nav me-3 mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/courses">
                  Courses
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/team">
                  Team
                </Link>
              </li>
              <li className="nav-item dropdown">
                <button
                  type="button"
                  className="nav-link dropdown-toggle btn btn-link"
                  onClick={toggleDropdown}
                  aria-expanded={dropdownOpen}
                  style={{ textDecoration: 'none' }}
                >
                  Browse
                </button>
                <ul className={`dropdown-menu${dropdownOpen ? ' show' : ''}`}>
                  {courseLinks.length === 0 && (
                    <li>
                      <span className="dropdown-item text-muted">Loading…</span>
                    </li>
                  )}
                  {courseLinks.map((course) => (
                    <li key={course._id}>
                      <Link
                        className="dropdown-item"
                        to={`/courses/${course.slug}`}
                        onClick={() => setDropdownOpen(false)}
                      >
                        {course.title}
                      </Link>
                    </li>
                  ))}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/courses">
                      View all courses
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>

            <form
              className="d-flex flex-grow-1 mx-lg-3 my-2 my-lg-0"
              role="search"
              onSubmit={handleSearch}
            >
              <input
                type="search"
                placeholder="Search on courses page"
                aria-label="Search"
                onFocus={() => window.location.assign('/courses')}
              />
            </form>

            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              {isLoggedIn ? (
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className="nav-link btn btn-link"
                      onClick={openSignup}
                      style={{ textDecoration: 'none' }}
                    >
                      Sign Up
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {showSignup && (
        <div className="signup-overlay">
          <div className="signup-modal">
            <button type="button" className="btn-close float-end" onClick={closeSignup} aria-label="Close" />
            <Signup />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
