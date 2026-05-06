/**
 * @file PostCard.jsx
 * @description مكون لعرض منشور فردي، مع إمكانية الإعجاب، التعليق، والحذف.
 */

import { useState } from "react";
import { Badge, Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

const PostCard = ({ post, currentUserId, onLike, onComment, onDelete }) => {
  const [comment, setComment] = useState("");
  
  // التحقق مما إذا كان المستخدم الحالي قد أعجب بالمنشور
  const liked = post.likes?.some((id) => String(id) === String(currentUserId));
  
  // التحقق مما إذا كان المستخدم الحالي هو صاحب المنشور
  const isOwner = String(post.author?._id || post.author) === String(currentUserId);

  /**
   * إرسال تعليق جديد
   */
  const submitComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onComment(post._id, comment.trim());
    setComment(""); // تفريغ الحقل بعد الإرسال
  };

  return (
    <Card className="dashboard-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            {/* رابط لملف الكاتب الشخصي */}
            <Link to={`/profile/${post.author?.username}`} className="fw-semibold">
              @{post.author?.username}
            </Link>
            <p className="mb-1">{post.content}</p>
            {/* عرض الصورة إن وجدت */}
            {post.imageUrl && <img src={post.imageUrl} alt="post" className="post-image mb-2" />}
          </div>
          {/* زر الحذف يظهر لصاحب المنشور فقط */}
          {isOwner && (
            <Button size="sm" variant="outline-danger" onClick={() => onDelete(post._id)}>
              Delete
            </Button>
          )}
        </div>

        {/* عرض الوسوم (Tags) */}
        <div className="d-flex gap-2 mb-2">
          {(post.tags || []).map((tag) => (
            <Badge key={`${post._id}-${tag}`} bg="secondary">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* أزرار التفاعل (إعجاب وتعليق) */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <Button size="sm" variant={liked ? "primary" : "outline-primary"} onClick={() => onLike(post._id)}>
            {liked ? "Unlike" : "Like"} ({post.likes?.length || 0})
          </Button>
          <span className="small text-muted">Comments: {post.comments?.length || 0}</span>
        </div>

        {/* نموذج كتابة تعليق */}
        <Form onSubmit={submitComment} className="mb-2">
          <div className="d-flex gap-2">
            <Form.Control
              size="sm"
              value={comment}
              placeholder="Write a comment..."
              onChange={(e) => setComment(e.target.value)}
            />
            <Button type="submit" size="sm">
              Send
            </Button>
          </div>
        </Form>

        {/* عرض آخر 3 تعليقات */}
        <div className="small">
          {(post.comments || []).slice(0, 3).map((c) => (
            <div key={c._id} className="py-1 border-top">
              <Link 
                to={`/profile/${c.author?.username}`} 
                className="fw-bold text-decoration-none text-dark me-1"
              >
                @{c.author?.username}
              </Link> 
              {c.content}
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PostCard;
