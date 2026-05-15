import React, { useEffect, useState } from 'react';
import { FaBookOpen, FaSearch } from 'react-icons/fa';
import { listCourses, listCategories } from '../api/courses';
import CourseCard from './CourseCard';

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const loadCourses = async (opts = {}) => {
    setLoading(true);
    setError('');
    try {
      const res = await listCourses({
        category: opts.category || undefined,
        search: opts.search || undefined,
      });
      setCourses(res.data || []);
    } catch (err) {
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
    loadCourses();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    loadCourses({ category, search: searchInput.trim() });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    loadCourses({ category: value, search });
  };

  return (
    <div className="course-section py-5" style={{ background: '#f8f9fa', minHeight: '70vh' }}>
      <div className="container">
        <div className="text-center mb-5">
          <FaBookOpen size={40} className="text-primary mb-3" />
          <h1 className="display-5 fw-bold">All Courses</h1>
          <p className="lead text-muted">
            Browse published courses from StudyHub instructors.
          </p>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <select
              className="form-select"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-8">
            <form className="d-flex gap-2" onSubmit={handleSearch}>
              <input
                type="search"
                className="form-control"
                placeholder="Search courses…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                <FaSearch /> Search
              </button>
            </form>
          </div>
        </div>

        {loading && <p className="text-center">Loading courses…</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && courses.length === 0 && (
          <div className="alert alert-info text-center">
            No courses found. Run <code>npm run seed:courses</code> in the backend folder to add sample courses.
          </div>
        )}

        <div className="row g-4">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesList;
