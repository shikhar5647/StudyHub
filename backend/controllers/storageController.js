const getSupabase = require('../services/supabase');
const asyncHandler = require('../middleware/asyncHandler');

const BUCKET = process.env.SUPABASE_BUCKET || 'Study Hub';

function makeObjectKey(courseSlug, subfolder, originalname) {
  const safeSlug = String(courseSlug || 'course').replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
  const safeSub = String(subfolder || 'misc').replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
  const ts = Date.now();
  return `${safeSlug}/${safeSub}/${ts}_${originalname}`;
}

// POST /api/storage/upload (multipart/form-data: file, courseSlug, subfolder)
const uploadFile = asyncHandler(async (req, res) => {
  const { courseSlug, subfolder } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ success: false, message: 'File is required' });
  if (!courseSlug) return res.status(400).json({ success: false, message: 'courseSlug is required' });

  const key = makeObjectKey(courseSlug, subfolder, file.originalname);

  const { data, error } = await getSupabase().storage
    .from(BUCKET)
    .upload(key, file.buffer, { contentType: file.mimetype, upsert: false });

  if (error) return res.status(500).json({ success: false, message: error.message });

  const { data: urlData } = getSupabase().storage.from(BUCKET).getPublicUrl(key);

  return res.status(201).json({
    success: true,
    data: { key, publicUrl: urlData && urlData.publicUrl ? urlData.publicUrl : null, path: (data && data.path) ? data.path : key }
  });
});

// GET /api/storage/list?courseSlug=...&prefix=notes
const listFiles = asyncHandler(async (req, res) => {
  const { courseSlug, prefix = '' } = req.query;
  if (!courseSlug) return res.status(400).json({ success: false, message: 'courseSlug is required' });

  const basePrefix = `${courseSlug}/${prefix}`.replace(/\/+$/, '');
  const { data, error } = await getSupabase().storage.from(BUCKET).list(basePrefix, { limit: 100, offset: 0 });

  if (error) return res.status(500).json({ success: false, message: error.message });

  return res.status(200).json({ success: true, data: data || [] });
});

// POST /api/storage/sign  { key, expiresInSec? }
const signUrl = asyncHandler(async (req, res) => {
  const { key, expiresInSec = 3600 } = req.body;
  if (!key) return res.status(400).json({ success: false, message: 'key is required' });

  const { data, error } = await getSupabase().storage.from(BUCKET).createSignedUrl(key, expiresInSec);
  if (error) return res.status(500).json({ success: false, message: error.message });

  return res.status(200).json({ success: true, data });
});

// DELETE /api/storage/delete  { key }
const deleteFile = asyncHandler(async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ success: false, message: 'key is required' });

  const { data, error } = await getSupabase().storage.from(BUCKET).remove([key]);
  if (error) return res.status(500).json({ success: false, message: error.message });

  return res.status(200).json({ success: true, data });
});

module.exports = { uploadFile, listFiles, signUrl, deleteFile };


