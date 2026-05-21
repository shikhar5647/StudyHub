import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaComments,
  FaEye,
  FaCaretUp,
  FaSearch,
  FaPlus,
  FaThumbtack,
  FaLock,
  FaFire,
  FaClock,
  FaSortAmountDown,
  FaTag,
  FaFilter,
} from 'react-icons/fa';
import { listDiscussions, getPopularTags } from '../api/discussions';
import { getAccessToken } from '../utils/auth';

const CATEGORY_LABELS = {
  general: { label: 'General', color: 'secondary' },
  help: { label: 'Help', color: 'danger' },
  'course-discussion': { label: 'Course', color: 'primary' },
  feedback: { label: 'Feedback', color: 'warning' },
  resource: { label: 'Resource', color: 'success' },
  career: { label: 'Career', color: 'info' },
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', icon: FaClock },
  { value: 'most_votes', label: 'Most Votes', icon: FaFire },
  { value: 'most_comments', label: 'Most Replies', icon: FaComments },
  { value: 'most_views', label: 'Most Views', icon: FaEye },
];

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function DiscussionRow({ discussion }) {
  const cat = CATEGORY_LABELS[discussion.category] || CATEGORY_LABELS.general;
  const authorName = discussion.author?.name || 'Anonymous';
  const initial = authorName.charAt(0).toUpperCase();

  return (
    <div className="discussion-row d-flex align-items-start gap-3 p-3 border-bottom">
      {/* Vote score */}
      <div className="d-flex flex-column align-items-center flex-shrink-0" style={{ minWidth: 48 }}>
        <FaCaretUp className="text-muted" />
        <span
          className={`fw-bold ${discussion.voteScore > 0 ? 'text-success' : discussion.voteScore < 0 ? 'text-danger' : 'text-muted'}`}
          style={{ fontSize: 15 }}
        >
          {discussion.voteScore}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-grow-1 min-width-0">
        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
          {discussion.isPinned && (
            <FaThumbtack className="text-warning" size={12} title="Pinned" />
          )}
          {discussion.isClosed && (
            <FaLock className="text-muted" size={12} title="Closed" />
          )}
          <Link
            to={`/discussions/${discussion.slug}`}
            className="fw-semibold text-decoration-none discussion-title"
            style={{ fontSize: '1.02rem' }}
          >
            {discussion.title}
          </Link>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className={`badge bg-${cat.color}`} style={{ fontSize: 11 }}>
            {cat.label}
          </span>
          {discussion.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="badge bg-light text-dark border" style={{ fontSize: 10 }}>
              {tag}
            </span>
          ))}
          {discussion.course && (
            <Link
              to={`/courses/${discussion.course.slug}`}
              className="badge bg-primary bg-opacity-10 text-primary text-decoration-none border"
              style={{ fontSize: 10 }}
            >
              {discussion.course.title}
            </Link>
          )}
        </div>

        <div className="d-flex align-items-center gap-3 mt-2 small text-muted">
          <span className="d-flex align-items-center gap-1">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
              style={{ width: 20, height: 20, fontSize: 10 }}
            >
              {initial}
            </span>
            {authorName}
          </span>
          <span>{timeAgo(discussion.createdAt)}</span>
          <span className="d-flex align-items-center gap-1">
            <FaComments size={12} /> {discussion.commentCount}
          </span>
          <span className="d-flex align-items-center gap-1">
            <FaEye size={12} /> {discussion.viewCount}
          </span>
        </div>
      </div>
    </div>
  );
}

const DiscussionList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [discussions, setDiscussions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const currentSort = searchParams.get('sort') || 'newest';
  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const [searchInput, setSearchInput] = useState(currentSearch);

  const isLoggedIn = Boolean(getAccessToken());

  const loadDiscussions = useCallback(() => {
    setLoading(true);
    const params = { page: currentPage, sort: currentSort };
    if (currentCategory) params.category = currentCategory;
    if (currentTag) params.tag = currentTag;
    if (currentSearch) params.search = currentSearch;

    listDiscussions(params)
      .then((res) => {
        setDiscussions(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => setDiscussions([]))
      .finally(() => setLoading(false));
  }, [currentSort, currentCategory, currentTag, currentSearch, currentPage]);

  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions]);

  useEffect(() => {
    getPopularTags()
      .then((res) => setTags(res.data || []))
      .catch(() => {});
  }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 d-flex align-items-center gap-2">
            <FaComments className="text-primary" /> Discussions
          </h1>
          <p className="text-muted mb-0 small">
            Ask questions, share resources, and discuss with the community
          </p>
        </div>
        {isLoggedIn && (
          <Link to="/discussions/new" className="btn btn-primary d-flex align-items-center gap-2">
            <FaPlus /> New Post
          </Link>
        )}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-3">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <FaSearch className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search discussions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setSearchInput('');
                updateParam('search', '');
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Sort tabs + filter toggle */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-1 flex-wrap">
          {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`btn btn-sm ${currentSort === value ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => updateParam('sort', value)}
            >
              <Icon className="me-1" size={12} />
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter className="me-1" size={12} /> Filters
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card border mb-3">
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold mb-1">
                  <FaSortAmountDown className="me-1" size={12} /> Category
                </label>
                <div className="d-flex gap-1 flex-wrap">
                  <button
                    type="button"
                    className={`btn btn-sm ${!currentCategory ? 'btn-dark' : 'btn-outline-secondary'}`}
                    onClick={() => updateParam('category', '')}
                  >
                    All
                  </button>
                  {Object.entries(CATEGORY_LABELS).map(([key, { label, color }]) => (
                    <button
                      key={key}
                      type="button"
                      className={`btn btn-sm ${currentCategory === key ? `btn-${color}` : `btn-outline-${color}`}`}
                      onClick={() => updateParam('category', key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold mb-1">
                  <FaTag className="me-1" size={12} /> Popular Tags
                </label>
                <div className="d-flex gap-1 flex-wrap">
                  {currentTag && (
                    <button
                      type="button"
                      className="btn btn-sm btn-dark"
                      onClick={() => updateParam('tag', '')}
                    >
                      {currentTag} &times;
                    </button>
                  )}
                  {tags
                    .filter((t) => t.tag !== currentTag)
                    .slice(0, 10)
                    .map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => updateParam('tag', t.tag)}
                      >
                        {t.tag}
                        <span className="ms-1 badge bg-light text-dark">{t.count}</span>
                      </button>
                    ))}
                  {tags.length === 0 && (
                    <span className="text-muted small">No tags yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active filter badges */}
      {(currentCategory || currentTag || currentSearch) && (
        <div className="d-flex gap-2 mb-3 flex-wrap align-items-center">
          <span className="small text-muted">Active filters:</span>
          {currentSearch && (
            <span className="badge bg-primary">
              Search: "{currentSearch}"{' '}
              <button
                type="button"
                className="btn-close btn-close-white ms-1"
                style={{ fontSize: 8 }}
                onClick={() => { setSearchInput(''); updateParam('search', ''); }}
                aria-label="Remove"
              />
            </span>
          )}
          {currentCategory && (
            <span className={`badge bg-${CATEGORY_LABELS[currentCategory]?.color || 'secondary'}`}>
              {CATEGORY_LABELS[currentCategory]?.label}{' '}
              <button
                type="button"
                className="btn-close btn-close-white ms-1"
                style={{ fontSize: 8 }}
                onClick={() => updateParam('category', '')}
                aria-label="Remove"
              />
            </span>
          )}
          {currentTag && (
            <span className="badge bg-dark">
              #{currentTag}{' '}
              <button
                type="button"
                className="btn-close btn-close-white ms-1"
                style={{ fontSize: 8 }}
                onClick={() => updateParam('tag', '')}
                aria-label="Remove"
              />
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="small text-muted mb-2">
        {pagination.total} discussion{pagination.total !== 1 ? 's' : ''} found
      </div>

      {/* Discussion list */}
      <div className="card border shadow-sm">
        {loading ? (
          <div className="p-5 text-center text-muted">Loading discussions...</div>
        ) : discussions.length === 0 ? (
          <div className="p-5 text-center">
            <FaComments size={40} className="text-muted mb-3 d-block mx-auto" />
            <p className="text-muted mb-2">No discussions found</p>
            {isLoggedIn ? (
              <Link to="/discussions/new" className="btn btn-primary btn-sm">
                Start the first discussion
              </Link>
            ) : (
              <Link to="/login" className="btn btn-outline-primary btn-sm">
                Log in to start a discussion
              </Link>
            )}
          </div>
        ) : (
          discussions.map((d) => <DiscussionRow key={d._id} discussion={d} />)
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <nav className="d-flex justify-content-center mt-4">
          <ul className="pagination pagination-sm">
            <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => updateParam('page', String(currentPage - 1))}
              >
                Prev
              </button>
            </li>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= pagination.pages - 3) {
                pageNum = pagination.pages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }
              return (
                <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => updateParam('page', String(pageNum))}
                  >
                    {pageNum}
                  </button>
                </li>
              );
            })}
            <li className={`page-item ${currentPage >= pagination.pages ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => updateParam('page', String(currentPage + 1))}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default DiscussionList;
