import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaPen,
  FaTags,
  FaListUl,
} from 'react-icons/fa';
import {
  createDiscussion,
  getDiscussion,
  updateDiscussion,
} from '../api/discussions';
import { listCourses } from '../api/courses';
import { getAccessToken } from '../utils/auth';

const CATEGORIES = [
  { value: 'general', label: 'General', desc: 'Anything goes' },
  { value: 'help', label: 'Help', desc: 'Ask a question' },
  { value: 'course-discussion', label: 'Course Discussion', desc: 'About a specific course' },
  { value: 'feedback', label: 'Feedback', desc: 'Site feedback & suggestions' },
  { value: 'resource', label: 'Resource', desc: 'Share a useful resource' },
  { value: 'career', label: 'Career', desc: 'Career advice & discussion' },
];

const CreateDiscussion = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(slug);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('general');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [courses, setCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!getAccessToken()) {
      navigate('/login?redirect=/discussions/new');
      return;
    }

    listCourses()
      .then((res) => setCourses(res.data || []))
      .catch(() => {});

    if (isEdit) {
      getDiscussion(slug)
        .then((res) => {
          const d = res.data;
          setTitle(d.title);
          setBody(d.body);
          setCategory(d.category);
          setTags(d.tags || []);
          setCourseId(d.course?._id || '');
        })
        .catch((err) => {
          toast.error(err.message);
          navigate('/discussions');
        })
        .finally(() => setLoading(false));
    }
  }, [slug, isEdit, navigate]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      return toast.error('Title and body are required');
    }

    setSubmitting(true);
    try {
      const data = {
        title: title.trim(),
        body: body.trim(),
        category,
        tags,
        course: courseId || null,
      };

      let res;
      if (isEdit) {
        res = await updateDiscussion(slug, data);
        toast.success('Discussion updated');
      } else {
        res = await createDiscussion(data);
        toast.success('Discussion created!');
      }

      navigate(`/discussions/${res.data.slug}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 760 }}>
      <button
        type="button"
        className="btn btn-link text-decoration-none p-0 mb-3 d-inline-flex align-items-center gap-1 small"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft /> Back
      </button>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h1 className="h4 mb-0 d-flex align-items-center gap-2">
            <FaPen className="text-primary" />
            {isEdit ? 'Edit Discussion' : 'Start a New Discussion'}
          </h1>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="What's on your mind? Be specific."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
              <div className="form-text">{title.length}/200</div>
            </div>

            {/* Category */}
            <div className="mb-3">
              <label className="form-label fw-semibold d-flex align-items-center gap-1">
                <FaListUl size={13} /> Category
              </label>
              <div className="d-flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`btn btn-sm ${category === cat.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setCategory(cat.value)}
                    title={cat.desc}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Course (optional, for course-discussion) */}
            {category === 'course-discussion' && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Related Course</label>
                <select
                  className="form-select"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                >
                  <option value="">— Select a course (optional) —</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tags */}
            <div className="mb-3">
              <label className="form-label fw-semibold d-flex align-items-center gap-1">
                <FaTags size={13} /> Tags
                <span className="text-muted fw-normal ms-1">(up to 5)</span>
              </label>
              <div className="d-flex gap-2 flex-wrap mb-2">
                {tags.map((tag) => (
                  <span key={tag} className="badge bg-primary d-flex align-items-center gap-1">
                    #{tag}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-1"
                      style={{ fontSize: 7 }}
                      onClick={() => removeTag(tag)}
                      aria-label="Remove"
                    />
                  </span>
                ))}
              </div>
              <div className="input-group" style={{ maxWidth: 300 }}>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  disabled={tags.length >= 5}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={addTag}
                  disabled={tags.length >= 5 || !tagInput.trim()}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Body <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows={10}
                placeholder="Describe your question, idea, or topic in detail..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={10000}
              />
              <div className="form-text">{body.length}/10000</div>
            </div>

            {/* Submit */}
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={submitting || !title.trim() || !body.trim()}
              >
                {submitting
                  ? 'Posting...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Post Discussion'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDiscussion;
