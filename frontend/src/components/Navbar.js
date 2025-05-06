import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // <-- Important! // Optional if you have custom styles

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleNavbar = () => setIsOpen(!isOpen);
  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top bg-gray shadow-sm">
      <div className="container-fluid d-flex align-items-center">
        <Link className="navbar-brand" to="/">
          <img src="/studyhub_logo.png" alt="StudyHub Logo" height="50" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarSupportedContent"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse${isOpen ? ' show' : ''}`}
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav me-3 mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/team">
                Team
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                onClick={toggleDropdown}
                aria-expanded={dropdownOpen}
              >
                Courses
              </a>
              <ul
                className={`dropdown-menu${dropdownOpen ? ' show' : ''}`}
                aria-labelledby="navbarDropdown"
              >
                {[
                  'Artificial Intelligence',
                  'Software Engineering',
                  'Data Science',
                  'Web Development',
                  'Mobile Development',
                  'Cloud Computing',
                  'Cyber Security',
                  'Blockchain',
                  'Internet of Things',
                  'Game Development',
                  'DevOps',
                  'Augmented Reality',
                  'Virtual Reality',
                  'More...',
                ].map((course, index) =>
                  course === 'Data Science' ? (
                    <React.Fragment key={index}>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <a className="dropdown-item" href="#">
                          {course}
                        </a>
                      </li>
                    </React.Fragment>
                  ) : (
                    <li key={index}>
                      <a className="dropdown-item" href="#">
                        {course}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </li>
          </ul>

          {/* Centered Search */}
          <form
            className="d-flex mx-auto"
            role="search"
            style={{ maxWidth: '600px', width: '100%' }}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
            <button className="btn btn-outline-success" type="submit">
              Search
            </button>
          </form>

          {/* Right-aligned */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/login">
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/signup">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar
