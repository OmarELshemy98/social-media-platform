/**
 * @file PostCard.jsx
 * @description كارت المنشور مع التفاعلات والتعليقات والأنيميشن.
 */

import { useState } from "react";
import { Badge, Button, Card, Form, Dropdown, ButtonGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { toggleReaction, updateComment, deleteComment } from "../../features/posts/postsSlice";

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like", color: "text-primary" },
  { type: "love", emoji: "❤️", label: "Love", color: "text-danger" },
  { type: "sad", emoji: "😢", label: "Sad", color: "text-warning" },
  { type: "angry", emoji: "😠", label: "Angry", color: "text-danger" },
];

const PostCard = ({ post, currentUserId, onComment, onDelete }) => {
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showReactions, setShowReactions] = useState(false);

  const myReaction = post?.reactions?.find(r => String(r.user) === String(currentUserId));
  const isOwner = String(post?.author?._id || post?.author) === String(currentUserId);

  const handleReaction = (type) => {
    if (!post?._id) return;
    dispatch(toggleReaction({ postId: post._id, type }));
    setShowReactions(false);
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!comment.trim() || !post?._id) return;
    onComment(post._id, comment.trim());
    setComment("");
  };

  const handleEditComment = (cId, content) => {
    setEditingCommentId(cId);
    setEditContent(content);
  };

  const saveEditComment = (cId) => {
    if (!post?._id) return;
    dispatch(updateComment({ postId: post._id, commentId: cId, content: editContent }));
    setEditingCommentId(null);
  };

  const handleDeleteComment = (cId) => {
    if (!post?._id) return;
    if (window.confirm("Delete this comment?")) {
      dispatch(deleteComment({ postId: post._id, commentId: cId }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="dashboard-card border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <img 
                src={post.author?.avatarUrl || "https://via.placeholder.com/40"} 
                className="rounded-circle border" 
                style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
              />
              <div>
                <Link to={`/profile/${post?.author?.username}`} className="fw-bold text-decoration-none text-primary d-block">
                  @{post?.author?.username || "unknown"}
                </Link>
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
                </small>
              </div>
            </div>
            {isOwner && (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="text-muted p-0 shadow-none no-caret">
                  ⋮
                </Dropdown.Toggle>
                <Dropdown.Menu className="border-0 shadow-sm">
                  <Dropdown.Item onClick={() => onDelete(post?._id)} className="text-danger small fw-bold">
                    Delete Post
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>

          <div className="post-content-area mb-3">
            <p className="fs-5 mb-3" style={{ whiteSpace: 'pre-wrap' }}>{post?.content}</p>
            {post?.imageUrl && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="rounded-4 overflow-hidden border shadow-sm"
              >
                <img src={post.imageUrl} alt="post" className="w-100" style={{ maxHeight: '500px', objectFit: 'cover' }} />
              </motion.div>
            )}
          </div>

          <div className="d-flex flex-wrap gap-2 mb-3">
            {(post.tags || []).map((tag) => (
              <Badge key={`${post._id}-${tag}`} bg="accent" className="text-primary border-0 fw-semibold px-3 py-1 rounded-pill">
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="d-flex align-items-center justify-content-between border-top border-bottom py-2 mb-3">
            <div className="d-flex gap-4">
              <div className="position-relative">
                <div 
                  className={`d-flex align-items-center gap-1 cursor-pointer fw-bold ${myReaction ? REACTIONS.find(r => r.type === myReaction.type)?.color : 'text-secondary'}`}
                  onMouseEnter={() => setShowReactions(true)}
                  onMouseLeave={() => setShowReactions(false)}
                  onClick={() => handleReaction("like")}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {myReaction ? REACTIONS.find(r => r.type === myReaction.type)?.emoji : '🤍'} {post.reactions?.length || 0}
                </div>

                <AnimatePresence>
                  {showReactions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -45, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      onMouseEnter={() => setShowReactions(true)}
                      onMouseLeave={() => setShowReactions(false)}
                      className="position-absolute bg-surface border rounded-pill shadow-lg p-1 d-flex gap-2 z-3"
                      style={{ left: '-10px' }}
                    >
                      {REACTIONS.map(r => (
                        <motion.span
                          key={r.type}
                          whileHover={{ scale: 1.3 }}
                          onClick={() => handleReaction(r.type)}
                          className="fs-4 cursor-pointer"
                          title={r.label}
                          style={{ cursor: 'pointer' }}
                        >
                          {r.emoji}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="d-flex align-items-center gap-1 text-secondary fw-bold">
                💬 {post.comments?.length || 0}
              </div>
            </div>
          </div>

          <Form onSubmit={submitComment} className="mb-3">
            <div className="comment-input-wrapper">
              <Form.Control
                className="bg-transparent border-0 shadow-none px-3"
                value={comment}
                placeholder="Share your thoughts..."
                onChange={(e) => setComment(e.target.value)}
              />
              <Button type="submit" variant="primary" className="rounded-pill px-4 fw-bold">
                Post
              </Button>
            </div>
          </Form>

          <div className="comments-section">
            <AnimatePresence>
              {(post.comments || []).map((c) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={c._id} 
                  className="comment-item"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex gap-2 w-100">
                      <img src={c.author?.avatarUrl || "https://via.placeholder.com/24"} className="rounded-circle" style={{ width: '24px', height: '24px' }} />
                      <div className="w-100">
                        <Link to={`/profile/${c.author?.username}`} className="fw-bold text-decoration-none text-primary small">
                          @{c.author?.username}
                        </Link>
                        {editingCommentId === c._id ? (
                          <div className="mt-1">
                            <Form.Control 
                              size="sm" 
                              value={editContent} 
                              onChange={(e) => setEditContent(e.target.value)} 
                              className="mb-2 bg-surface text-text"
                            />
                            <Button size="sm" onClick={() => saveEditComment(c._id)} className="me-2">Save</Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <div className="small mt-1">
                            {c.content}
                            {c.isEdited && <span className="ms-2 text-muted" style={{ fontSize: '0.6rem' }}>(edited)</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    {String(c.author?._id || c.author) === String(currentUserId) && editingCommentId !== c._id && (
                      <Dropdown align="end">
                        <Dropdown.Toggle variant="link" className="text-muted p-0 shadow-none no-caret small">
                          ⋮
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="border-0 shadow-sm">
                          <Dropdown.Item onClick={() => handleEditComment(c._id, c.content)} className="small">Edit</Dropdown.Item>
                          <Dropdown.Item onClick={() => handleDeleteComment(c._id)} className="small text-danger">Delete</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default PostCard;
