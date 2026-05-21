const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  getDiscussions,
  getCategories,
  getPopularTags,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  voteDiscussion,
  pinDiscussion,
  closeDiscussion,
} = require('../controllers/discussionController');
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  voteComment,
  acceptComment,
} = require('../controllers/commentController');

// Public
router.get('/', getDiscussions);
router.get('/categories', getCategories);
router.get('/tags/popular', getPopularTags);
router.get('/:slug', getDiscussion);
router.get('/:slug/comments', getComments);

// Authenticated
router.post('/', protect, createDiscussion);
router.put('/:slug', protect, updateDiscussion);
router.delete('/:slug', protect, deleteDiscussion);
router.post('/:slug/vote', protect, voteDiscussion);
router.post('/:slug/close', protect, closeDiscussion);

// Admin only
router.post('/:slug/pin', protect, requireRole('admin'), pinDiscussion);

// Comments — authenticated
router.post('/:slug/comments', protect, createComment);
router.put('/:slug/comments/:commentId', protect, updateComment);
router.delete('/:slug/comments/:commentId', protect, deleteComment);
router.post('/:slug/comments/:commentId/vote', protect, voteComment);
router.post('/:slug/comments/:commentId/accept', protect, acceptComment);

module.exports = router;
