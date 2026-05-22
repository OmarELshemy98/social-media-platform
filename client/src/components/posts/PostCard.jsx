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
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="dashboard-card border-0 mb-4 overflow-hidden">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <motion.img 
                whileHover={{ scale: 1.1 }}
                src={post.author?.avatarUrl || "https://via.placeholder.com/48"} 
                className="rounded-circle border" 
                style={{ width: '48px', height: '48px', objectFit: 'cover' }} 
              />
              <div>
                <Link to={`/profile/${post?.author?.username}`} className="fw-bold text-decoration-none text-dark d-block fs-6">
                  @{post?.author?.username || "unknown"}
                </Link>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
                </small>
              </div>
            </div>
            {isOwner && (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="text-muted p-0 shadow-none no-caret fs-5">
                  <motion.span whileHover={{ scale: 1.2 }}>⋮</motion.span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="border-0 shadow-lg p-2" style={{ borderRadius: '1rem' }}>
                  <Dropdown.Item onClick={() => onDelete(post?._id)} className="text-danger small fw-bold rounded-3">
                    Delete Post
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>

          <div className="post-content-area mb-4">
            <p className="fs-5 mb-3" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{post?.content}</p>
            
            <div className="d-flex flex-wrap gap-2 mb-3">
              {(post.tags || []).map((tag) => (
                <Badge key={`${post._id}-${tag}`} bg="light" className="text-primary border-0 fw-bold px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: '0.75rem' }}>
                  #{tag}
                </Badge>
              ))}
            </div>

            {post.imageUrl && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="rounded-4 overflow-hidden shadow-sm"
              >
                <img src={post.imageUrl} className="w-100 object-fit-cover" style={{ maxHeight: '500px' }} />
              </motion.div>
            )}
          </div>

          <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-2">
            <div className="d-flex gap-4">
              <div className="position-relative">
                <Button 
                  variant="link" 
                  className={`p-0 text-decoration-none d-flex align-items-center gap-1 fw-bold ${myReaction ? 'text-primary' : 'text-muted'}`}
                  onMouseEnter={() => setShowReactions(true)}
                  onClick={() => handleReaction(myReaction?.type || "like")}
                >
                  <span className="fs-5">{myReaction?.emoji || "👍"}</span>
                  <span style={{ fontSize: '0.85rem' }}>{post?.reactions?.length || 0}</span>
                </Button>

                <AnimatePresence>
                  {showReactions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -50, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      className="reactions-bar position-absolute start-0"
                      onMouseLeave={() => setShowReactions(false)}
                    >
                      {REACTIONS.map(r => (
                        <motion.span 
                          key={r.type}
                          whileHover={{ scale: 1.4, y: -5 }}
                          className="reaction-btn"
                          onClick={() => handleReaction(r.type)}
                          title={r.label}
                        >
                          {r.emoji}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button variant="link" className="p-0 text-decoration-none text-muted d-flex align-items-center gap-1 fw-bold">
                <span className="fs-5">💬</span>
                <span style={{ fontSize: '0.85rem' }}>{post?.comments?.length || 0}</span>
              </Button>
            </div>

            <Button variant="link" className="p-0 text-decoration-none text-muted">
              <span className="fs-5">🔖</span>
            </Button>
          </div>

          <div className="comments-section mt-4 pt-3">
            <Form onSubmit={submitComment} className="mb-4">
              <div className="d-flex gap-2">
                <Form.Control 
                  className="rounded-pill border-0 bg-light px-4 py-2" 
                  placeholder="Share your thoughts..." 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ fontSize: '0.9rem' }}
                />
                <Button type="submit" variant="primary" className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                  <span className="fs-5">🚀</span>
                </Button>
              </div>
            </Form>

            <div className="comments-list">
              <AnimatePresence>
                {post?.comments?.map((c) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={c._id} 
                    className="comment-item mb-3 p-3 rounded-4 bg-light border-0"
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <img src={c.author?.avatarUrl || "https://via.placeholder.com/28"} className="rounded-circle border" style={{ width: '28px', height: '28px' }} />
                        <Link to={`/profile/${c.author?.username}`} className="small fw-bold text-decoration-none text-dark">
                          @{c.author?.username}
                        </Link>
                      </div>
                      {String(c.author?._id || c.author) === String(currentUserId) && (
                        <Dropdown align="end">
                          <Dropdown.Toggle variant="link" className="text-muted p-0 shadow-none no-caret small">
                            ⋮
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="border-0 shadow-lg p-2" style={{ borderRadius: '1rem' }}>
                            <Dropdown.Item onClick={() => handleEditComment(c._id, c.content)} className="small rounded-3">Edit</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDeleteComment(c._id)} className="small text-danger rounded-3">Delete</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </div>
                    {editingCommentId === c._id ? (
                      <div className="d-flex gap-2 mt-2">
                        <Form.Control size="sm" className="rounded-pill px-3" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                        <Button size="sm" variant="primary" className="rounded-pill px-3" onClick={() => saveEditComment(c._id)}>Save</Button>
                      </div>
                    ) : (
                      <p className="small mb-0 ms-1 text-secondary" style={{ lineHeight: '1.5' }}>{c.content}</p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default PostCard;
