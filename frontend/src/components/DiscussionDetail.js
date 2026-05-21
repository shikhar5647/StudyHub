import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaCaretUp,
  FaCaretDown,
  FaComments,
  FaEye,
  FaReply,
  FaCheck,
  FaTrash,
  FaEdit,
  FaThumbtack,
  FaLock,
  FaClock,
  FaStar,
} from 'react-icons/fa';
import {
  getDiscussion,
  getDiscussionComments,
  voteDiscussion,
  createComment,
  voteComment,
  deleteComment,
  deleteDiscussion,
  acceptComment,
} from '../api/discussions';
import { getAccessToken, getStoredUser } from '../utils/auth';

const CATEGORY_LABELS = {
  general: { label: 'General', color: 'secondary' },
  help: { label: 'Help', color: 'danger' },
  'course-discussion': { label: 'Course', color: 'primary' },
  feedback: { label: 'Feedback', color: 'warning' },
  resource: { label: 'Resource', color: 'success' },
  career: { label: 'Career', color: 'info' },
};

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function VoteButtons({ score, upvotes = [], downvotes = [], onVote, userId, vertical = true }) {
  const userVote = upvotes.some((id) => id === userId)
    ? 'up'
    : downvotes.some((id) => id === userId)
      ? 'down'
      : 'none';

  const cls = vertical
    ? 'd-flex flex-column align-items-center gap-0'
    : 'd-flex align-items-center gap-1';

  return (
    <div className={cls}>
      <button
        type="button"
        className={`btn btn-sm p-0 border-0 ${userVote === 'up' ? 'text-success' : 'text-muted'}`}
        onClick={() => onVote(userVote === 'up' ? 'none' : 'up')}
        title="Upvote"
      >
        <FaCaretUp size={vertical ? 24 : 18} />
      </button>
      <span
        className={`fw-bold ${score > 0 ? 'text-success' : score < 0 ? 'text-danger' : 'text-muted'}`}
        style={{ fontSize: vertical ? 15 : 13, lineHeight: 1 }}
      >
        {score}
      </span>
      <button
        type="button"
        className={`btn btn-sm p-0 border-0 ${userVote === 'down' ? 'text-danger' : 'text-muted'}`}
        onClick={() => onVote(userVote === 'down' ? 'none' : 'down')}
        title="Downvote"
      >
        <FaCaretDown size={vertical ? 24 : 18} />
      </button>
    </div>
  );
}

function CommentItem({ comment, slug, userId, isDiscussionAuthor, onRefresh, depth = 0 }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isOwner = comment.author?._id === userId;
  const isLoggedIn = Boolean(userId);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setSubmitting(true);
    try {
      await createComment(slug, { body: replyBody, parent: comment._id });
      setReplyBody('');
      setReplyOpen(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (vote) => {
    if (!isLoggedIn) return toast.info('Log in to vote');
    try {
      await voteComment(slug, comment._id, vote);
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(slug, comment._id);
      toast.success('Comment deleted');
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptComment(slug, comment._id);
      onRefresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const authorName = comment.author?.name || 'Anonymous';
  const initial = authorName.charAt(0).toUpperCase();
  const maxDepth = 3;

  return (
    <div
      className={`d-flex gap-2 ${depth > 0 ? 'ms-4 ps-3 border-start' : ''}`}
      style={{ marginTop: depth > 0 ? 12 : 16 }}
    >
      <VoteButtons
        score={comment.voteScore}
        upvotes={comment.upvotes || []}
        downvotes={comment.downvotes || []}
        onVote={handleVote}
        userId={userId}
      />

      <div className="flex-grow-1">
        <div
          className={`p-3 rounded ${comment.isAccepted ? 'border border-success bg-success bg-opacity-10' : 'bg-light'}`}
        >
          {comment.isAccepted && (
            <div className="d-flex align-items-center gap-1 text-success small fw-semibold mb-2">
              <FaCheck /> Accepted Answer
            </div>
          )}

          <div className="d-flex align-items-center gap-2 mb-2">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
              style={{ width: 24, height: 24, fontSize: 11 }}
            >
              {initial}
            </span>
            <span className="fw-semibold small">{authorName}</span>
            {comment.author?.role === 'admin' && (
              <span className="badge bg-danger" style={{ fontSize: 9 }}>Admin</span>
            )}
            {comment.author?.role === 'instructor' && (
              <span className="badge bg-info" style={{ fontSize: 9 }}>Instructor</span>
            )}
            <span className="text-muted small">
              <FaClock size={10} className="me-1" />
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
            {comment.body}
          </div>

          <div className="d-flex gap-3 mt-2">
            {isLoggedIn && (
              <button
                type="button"
                className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                onClick={() => setReplyOpen(!replyOpen)}
              >
                <FaReply size={11} className="me-1" /> Reply
              </button>
            )}
            {isDiscussionAuthor && !comment.parent && (
              <button
                type="button"
                className={`btn btn-sm btn-link p-0 text-decoration-none ${comment.isAccepted ? 'text-success' : 'text-muted'}`}
                onClick={handleAccept}
                title={comment.isAccepted ? 'Unaccept answer' : 'Accept as answer'}
              >
                <FaStar size={11} className="me-1" />
                {comment.isAccepted ? 'Accepted' : 'Accept'}
              </button>
            )}
            {(isOwner || (getStoredUser()?.role === 'admin')) && (
              <button
                type="button"
                className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                onClick={handleDelete}
              >
                <FaTrash size={10} className="me-1" /> Delete
              </button>
            )}
          </div>
        </div>

        {replyOpen && (
          <form onSubmit={handleReply} className="mt-2">
            <textarea
              className="form-control form-control-sm"
              rows={2}
              placeholder="Write a reply..."
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
            />
            <div className="d-flex gap-2 mt-1">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting || !replyBody.trim()}
              >
                {submitting ? 'Posting...' : 'Reply'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setReplyOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {depth < maxDepth &&
          comment.replies?.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              slug={slug}
              userId={userId}
              isDiscussionAuthor={isDiscussionAuthor}
              onRefresh={onRefresh}
              depth={depth + 1}
            />
          ))}
      </div>
    </div>
  );
}

const DiscussionDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentSort, setCommentSort] = useState('best');
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isLoggedIn = Boolean(getAccessToken());
  const user = getStoredUser();
  const userId = user?._id || user?.id || null;
  const isAuthor = discussion?.author?._id === userId;
  const isAdmin = user?.role === 'admin';

  const loadDiscussion = useCallback(() => {
    getDiscussion(slug)
      .then((res) => setDiscussion(res.data))
      .catch((err) => {
        toast.error(err.message);
        navigate('/discussions');
      })
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const loadComments = useCallback(() => {
    getDiscussionComments(slug, commentSort)
      .then((res) => setComments(res.data || []))
      .catch(() => setComments([]));
  }, [slug, commentSort]);

  useEffect(() => {
    loadDiscussion();
  }, [loadDiscussion]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleVoteDiscussion = async (vote) => {
    if (!isLoggedIn) return toast.info('Log in to vote');
    try {
      const res = await voteDiscussion(slug, vote);
      setDiscussion((prev) => ({ ...prev, ...res.data }));
      loadDiscussion();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await createComment(slug, { body: newComment });
      setNewComment('');
      loadComments();
      loadDiscussion();
      toast.success('Comment posted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!window.confirm('Delete this discussion and all its comments?')) return;
    try {
      await deleteDiscussion(slug);
      toast.success('Discussion deleted');
      navigate('/discussions');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p>Loading discussion...</p>
      </div>
    );
  }

  if (!discussion) return null;

  const cat = CATEGORY_LABELS[discussion.category] || CATEGORY_LABELS.general;
  const authorName = discussion.author?.name || 'Anonymous';
  const initial = authorName.charAt(0).toUpperCase();

  return (
    <div className="container py-4" style={{ maxWidth: 860 }}>
      {/* Back link */}
      <Link
        to="/discussions"
        className="small text-decoration-none d-inline-flex align-items-center gap-1 mb-3"
      >
        <FaArrowLeft /> Back to discussions
      </Link>

      {/* Discussion card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex gap-3">
            {/* Vote column */}
            <div className="flex-shrink-0">
              <VoteButtons
                score={discussion.voteScore}
                upvotes={discussion.upvotes || []}
                downvotes={discussion.downvotes || []}
                onVote={handleVoteDiscussion}
                userId={userId}
              />
            </div>

            {/* Content */}
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                {discussion.isPinned && (
                  <span className="badge bg-warning text-dark">
                    <FaThumbtack className="me-1" size={10} /> Pinned
                  </span>
                )}
                {discussion.isClosed && (
                  <span className="badge bg-secondary">
                    <FaLock className="me-1" size={10} /> Closed
                  </span>
                )}
                <span className={`badge bg-${cat.color}`}>{cat.label}</span>
                {discussion.tags?.map((tag) => (
                  <Link
                    key={tag}
                    to={`/discussions?tag=${tag}`}
                    className="badge bg-light text-dark border text-decoration-none"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>

              <h1 className="h4 mb-3">{discussion.title}</h1>

              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.97rem' }}>
                {discussion.body}
              </div>

              {discussion.course && (
                <div className="mt-3">
                  <Link
                    to={`/courses/${discussion.course.slug}`}
                    className="badge bg-primary bg-opacity-10 text-primary text-decoration-none border px-3 py-2"
                  >
                    Related course: {discussion.course.title}
                  </Link>
                </div>
              )}

              <hr />

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center gap-3 small text-muted">
                  <span className="d-flex align-items-center gap-1">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                      style={{ width: 24, height: 24, fontSize: 11 }}
                    >
                      {initial}
                    </span>
                    <span className="fw-semibold">{authorName}</span>
                  </span>
                  <span>
                    <FaClock size={10} className="me-1" />
                    {timeAgo(discussion.createdAt)}
                  </span>
                  <span>
                    <FaEye size={11} className="me-1" />
                    {discussion.viewCount} views
                  </span>
                  <span>
                    <FaComments size={11} className="me-1" />
                    {discussion.commentCount} comments
                  </span>
                </div>

                {(isAuthor || isAdmin) && (
                  <div className="d-flex gap-2">
                    <Link
                      to={`/discussions/${slug}/edit`}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      <FaEdit size={11} className="me-1" /> Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleDeleteDiscussion}
                    >
                      <FaTrash size={11} className="me-1" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          {discussion.commentCount} Comment{discussion.commentCount !== 1 ? 's' : ''}
        </h5>
        <div className="d-flex gap-1">
          {['best', 'newest', 'oldest'].map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm ${commentSort === s ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setCommentSort(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Comment form */}
      {isLoggedIn && !discussion.isClosed ? (
        <form onSubmit={handleSubmitComment} className="card border shadow-sm mb-4">
          <div className="card-body p-3">
            <textarea
              className="form-control mb-2"
              rows={3}
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : discussion.isClosed ? (
        <div className="alert alert-secondary text-center mb-4">
          <FaLock className="me-1" /> This discussion is closed for new comments.
        </div>
      ) : (
        <div className="alert alert-info text-center mb-4">
          <Link to="/login">Log in</Link> to join the discussion.
        </div>
      )}

      {/* Comments list */}
      <div>
        {comments.length === 0 && (
          <p className="text-muted text-center py-4">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            slug={slug}
            userId={userId}
            isDiscussionAuthor={isAuthor}
            onRefresh={() => {
              loadComments();
              loadDiscussion();
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DiscussionDetail;
