import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
} from '../../api/courses';
import { getStoredUser } from '../../utils/auth';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const LESSON_TYPES = ['video', 'note', 'assignment', 'quiz'];
const PROVIDERS = ['youtube', 'inline', 's3'];

function emptyLesson(order = 1) {
  return {
    title: '',
    type: 'video',
    order,
    isPreviewable: false,
    content: { provider: 'youtube', url: '', markdown: '' },
  };
}

function emptyModule(order = 1) {
  return {
    title: '',
    description: '',
    order,
    lessons: [emptyLesson(1)],
  };
}

function courseToForm(course) {
  if (!course) {
    return {
      title: '',
      description: '',
      category: '',
      level: 'All Levels',
      thumbnail: '',
      price: 0,
      tags: '',
      published: false,
      modules: [emptyModule(1)],
    };
  }
  return {
    title: course.title || '',
    description: course.description || '',
    category: course.category || '',
    level: course.level || 'All Levels',
    thumbnail: course.thumbnail || '',
    price: course.price || 0,
    tags: (course.tags || []).join(', '),
    published: Boolean(course.published),
    modules: (course.modules || []).length
      ? course.modules.map((m, mi) => ({
          title: m.title || '',
          description: m.description || '',
          order: m.order ?? mi + 1,
          lessons: (m.lessons || []).map((l, li) => ({
            title: l.title || '',
            type: l.type || 'video',
            order: l.order ?? li + 1,
            isPreviewable: Boolean(l.isPreviewable),
            content: {
              provider: l.content?.provider || 'youtube',
              url: l.content?.url || '',
              markdown: l.content?.markdown || '',
              durationSec: l.content?.durationSec || '',
            },
          })),
        }))
      : [emptyModule(1)],
  };
}

const CourseEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(slug);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(courseToForm(null));


  useEffect(() => {
    if (!isEdit) return;
    getCourse(slug)
      .then((res) => {
        const course = res.data.course;
        const user = getStoredUser();
        const isOwner =
          user?.role === 'admin' ||
          (user?.role === 'instructor' &&
            course.instructor &&
            (course.instructor._id === user._id || course.instructor === user._id));
        if (!isOwner && user?.role !== 'admin') {
          toast.error('You can only edit your own courses');
          navigate('/instructor');
          return;
        }
        setForm(courseToForm(course));

      })
      .catch((err) => {
        toast.error(err.message);
        navigate('/instructor');
      })
      .finally(() => setLoading(false));
  }, [slug, isEdit, navigate]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateModule = (mi, field, value) => {
    setForm((prev) => {
      const modules = [...prev.modules];
      modules[mi] = { ...modules[mi], [field]: value };
      return { ...prev, modules };
    });
  };

  const updateLesson = (mi, li, field, value) => {
    setForm((prev) => {
      const modules = [...prev.modules];
      const lessons = [...modules[mi].lessons];
      if (field.startsWith('content.')) {
        const ck = field.split('.')[1];
        lessons[li] = {
          ...lessons[li],
          content: { ...lessons[li].content, [ck]: value },
        };
      } else {
        lessons[li] = { ...lessons[li], [field]: value };
      }
      modules[mi] = { ...modules[mi], lessons };
      return { ...prev, modules };
    });
  };

  const addModule = () => {
    setForm((prev) => ({
      ...prev,
      modules: [...prev.modules, emptyModule(prev.modules.length + 1)],
    }));
  };

  const removeModule = (mi) => {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== mi),
    }));
  };

  const addLesson = (mi) => {
    setForm((prev) => {
      const modules = [...prev.modules];
      const order = modules[mi].lessons.length + 1;
      modules[mi] = {
        ...modules[mi],
        lessons: [...modules[mi].lessons, emptyLesson(order)],
      };
      return { ...prev, modules };
    });
  };

  const removeLesson = (mi, li) => {
    setForm((prev) => {
      const modules = [...prev.modules];
      modules[mi] = {
        ...modules[mi],
        lessons: modules[mi].lessons.filter((_, i) => i !== li),
      };
      return { ...prev, modules };
    });
  };

  const buildPayload = () => {
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const modules = form.modules.map((mod, mi) => ({
      title: mod.title,
      description: mod.description,
      order: Number(mod.order) || mi + 1,
      lessons: mod.lessons.map((lesson, li) => {
        const content = {
          provider: lesson.content.provider,
          url: lesson.content.url || undefined,
          markdown: lesson.content.markdown || undefined,
        };
        if (lesson.content.durationSec) {
          content.durationSec = Number(lesson.content.durationSec);
        }
        return {
          title: lesson.title,
          type: lesson.type,
          order: Number(lesson.order) || li + 1,
          isPreviewable: Boolean(lesson.isPreviewable),
          content,
        };
      }),
    }));

    return {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      level: form.level,
      thumbnail: form.thumbnail.trim() || undefined,
      price: Number(form.price) || 0,
      tags,
      published: form.published,
      modules,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        const res = await updateCourse(slug, payload);
        toast.success('Course updated');
        navigate(`/instructor/courses/${res.data.slug}/edit`, { replace: true });
      } else {
        const res = await createCourse(payload);
        toast.success('Course created');
        navigate(`/instructor/courses/${res.data.slug}/edit`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this course permanently?')) return;
    try {
      await deleteCourse(slug);
      toast.success('Course deleted');
      navigate('/instructor');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading course editor…</p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 900 }}>
      <Link to="/instructor" className="text-decoration-none small">
        ← Back to instructor dashboard
      </Link>
      <h1 className="mt-2 mb-4">{isEdit ? 'Edit course' : 'Create new course'}</h1>

      <form onSubmit={handleSubmit}>
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h5">Basic information</h2>
            <div className="mb-3">
              <label className="form-label">Title *</label>
              <input
                className="form-control"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description *</label>
              <textarea
                className="form-control"
                rows={4}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                required
              />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Category</label>
                <input
                  className="form-control"
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  placeholder="e.g. Web Development"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Level</label>
                <select
                  className="form-select"
                  value={form.level}
                  onChange={(e) => setField('level', e.target.value)}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label">Thumbnail URL</label>
                <input
                  className="form-control"
                  value={form.thumbnail}
                  onChange={(e) => setField('thumbnail', e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Price (₹ INR)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  className="form-control"
                  value={form.tags}
                  onChange={(e) => setField('tags', e.target.value)}
                />
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="published"
                    checked={form.published}
                    onChange={(e) => setField('published', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="published">
                    Publish course (visible to students)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="h5 mb-3">Modules & lessons</h2>
        {form.modules.map((mod, mi) => (
          <div key={mi} className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Module {mi + 1}</strong>
                {form.modules.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeModule(mi)}
                  >
                    Remove module
                  </button>
                )}
              </div>
              <input
                className="form-control mb-2"
                placeholder="Module title"
                value={mod.title}
                onChange={(e) => updateModule(mi, 'title', e.target.value)}
              />
              <textarea
                className="form-control mb-3"
                placeholder="Module description"
                rows={2}
                value={mod.description}
                onChange={(e) => updateModule(mi, 'description', e.target.value)}
              />

              {mod.lessons.map((lesson, li) => (
                <div key={li} className="border rounded p-3 mb-2 bg-light">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small fw-bold">Lesson {li + 1}</span>
                    {mod.lessons.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger"
                        onClick={() => removeLesson(mi, li)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    className="form-control form-control-sm mb-2"
                    placeholder="Lesson title"
                    value={lesson.title}
                    onChange={(e) => updateLesson(mi, li, 'title', e.target.value)}
                  />
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <select
                        className="form-select form-select-sm"
                        value={lesson.type}
                        onChange={(e) => updateLesson(mi, li, 'type', e.target.value)}
                      >
                        {LESSON_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <select
                        className="form-select form-select-sm"
                        value={lesson.content.provider}
                        onChange={(e) =>
                          updateLesson(mi, li, 'content.provider', e.target.value)
                        }
                      >
                        {PROVIDERS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {lesson.content.provider === 'inline' ? (
                    <textarea
                      className="form-control form-control-sm mb-2"
                      placeholder="Markdown notes"
                      rows={3}
                      value={lesson.content.markdown}
                      onChange={(e) =>
                        updateLesson(mi, li, 'content.markdown', e.target.value)
                      }
                    />
                  ) : (
                    <input
                      className="form-control form-control-sm mb-2"
                      placeholder="Video URL (YouTube) or file URL"
                      value={lesson.content.url}
                      onChange={(e) => updateLesson(mi, li, 'content.url', e.target.value)}
                    />
                  )}
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`preview-${mi}-${li}`}
                      checked={lesson.isPreviewable}
                      onChange={(e) =>
                        updateLesson(mi, li, 'isPreviewable', e.target.checked)
                      }
                    />
                    <label className="form-check-label small" htmlFor={`preview-${mi}-${li}`}>
                      Free preview (visible without enrollment)
                    </label>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => addLesson(mi)}
              >
                + Add lesson
              </button>
            </div>
          </div>
        ))}

        <button type="button" className="btn btn-outline-secondary mb-4" onClick={addModule}>
          + Add module
        </button>

        <div className="d-flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create course'}
          </button>
          {isEdit && (
            <>
              <Link to={`/courses/${slug}`} className="btn btn-outline-secondary">
                Preview
              </Link>
              <button
                type="button"
                className="btn btn-outline-danger ms-auto"
                onClick={handleDelete}
              >
                Delete course
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default CourseEditor;
