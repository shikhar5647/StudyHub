import React, { useEffect, useState } from 'react';
import { uploadCourseFile, listCourseFiles, signCourseFile, deleteCourseFile } from '../api/storage';
import { getAccessToken } from '../utils/auth';

function StorageManager() {
  const [accessToken, setAccessToken] = useState(() => getAccessToken() || '');
  const [courseSlug, setCourseSlug] = useState('demo-course');
  const [prefix, setPrefix] = useState('');
  const [files, setFiles] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [subfolder, setSubfolder] = useState('notes');

  const canUpload = true; // client demo; server enforces role

  const refreshList = async () => {
    if (!accessToken || !courseSlug) return;
    const res = await listCourseFiles({ token: accessToken, courseSlug, prefix });
    if (res && res.success) {
      setFiles(res.data || []);
    } else {
      setFiles([]);
    }
  };

  useEffect(() => {
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, courseSlug, prefix]);

  const onUpload = async () => {
    if (!accessToken || !fileToUpload) return;
    await uploadCourseFile({ token: accessToken, file: fileToUpload, courseSlug, subfolder });
    setFileToUpload(null);
    await refreshList();
  };

  const onOpen = async (name) => {
    const key = `${courseSlug}/${prefix ? prefix + '/' : ''}${name}`;
    const res = await signCourseFile({ token: accessToken, key, expiresInSec: 3600 });
    if (res && res.success && res.data && res.data.signedUrl) {
      window.open(res.data.signedUrl, '_blank');
    }
  };

  const onDelete = async (name) => {
    const key = `${courseSlug}/${prefix ? prefix + '/' : ''}${name}`;
    await deleteCourseFile({ token: accessToken, key });
    await refreshList();
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Storage Manager</h2>
      <p>Paste a valid JWT access token from your login. Upload, list and open files from Supabase bucket.</p>

      <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        <label>
          Access Token (JWT):
          <textarea value={accessToken} onChange={e => setAccessToken(e.target.value)} rows={4} style={{ width: '100%' }} />
        </label>
        <label>
          Course Slug:
          <input value={courseSlug} onChange={e => setCourseSlug(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>
          Folder Prefix (e.g. notes, assignments, videos, or empty):
          <input value={prefix} onChange={e => setPrefix(e.target.value)} style={{ width: '100%' }} />
        </label>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <select value={subfolder} onChange={e => setSubfolder(e.target.value)}>
          <option value="notes">notes</option>
          <option value="assignments">assignments</option>
          <option value="videos">videos</option>
          <option value="misc">misc</option>
        </select>
        <input type="file" onChange={e => setFileToUpload(e.target.files && e.target.files[0])} />
        <button onClick={onUpload} disabled={!fileToUpload || !canUpload}>Upload</button>
        <button onClick={refreshList}>Refresh</button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Files</h3>
        <ul>
          {files.map((f) => (
            <li key={f.name} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>{f.name}</span>
              {f.metadata && typeof f.metadata.size === 'number' && (
                <em style={{ color: '#666' }}>({Math.round(f.metadata.size/1024)} KB)</em>
              )}
              <button onClick={() => onOpen(f.name)}>Open</button>
              <button onClick={() => onDelete(f.name)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Save a YouTube link into bucket metadata (recommended)</h3>
        <p>
          You generally should not upload YouTube video files to your bucket. Instead, store the YouTube URL
          (or id) in your course content. If you must keep a copy, you can upload any file above and manage it
          like others. For rendering, use the signed URL or the YouTube embed URL on the frontend.
        </p>
      </div>
    </div>
  );
}

export default StorageManager;


