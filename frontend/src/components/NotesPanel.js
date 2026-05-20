import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getNotes, saveNote } from '../api/users';

const NotesPanel = ({ courseId, lessonId }) => {
  const [markdown, setMarkdown] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId || !lessonId) return;
    setLoading(true);
    getNotes()
      .then(res => {
        const notes = res.data || [];
        const note = notes.find(n => n.course?._id === courseId && n.lessonId === lessonId);
        setMarkdown(note ? note.markdown : '');
      })
      .catch(err => {
        toast.error('Failed to load notes');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  const handleSave = () => {
    setSaving(true);
    saveNote({
      course: courseId,
      lessonId,
      title: 'Note',
      markdown
    })
      .then(() => toast.success('Note saved!'))
      .catch(() => toast.error('Failed to save note'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="card shadow-sm border-0 mt-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">📝 Personal Notes</h5>
        <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
      <div className="card-body p-0">
        <textarea
          className="form-control border-0 rounded-bottom"
          rows="10"
          placeholder={loading ? "Loading notes..." : "Type your notes here... (Markdown supported)"}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          disabled={loading}
          style={{ resize: 'vertical' }}
        />
      </div>
    </div>
  );
};

export default NotesPanel;
