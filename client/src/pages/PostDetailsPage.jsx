/**
 * @file PostDetailsPage.jsx
 * @description صفحة عرض تفاصيل منشور واحد.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner, Button, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import PostCard from "../components/posts/PostCard";
import { 
  addCommentToPost, 
  deletePost, 
  optimisticToggleLike, 
  toggleLikePost 
} from "../features/posts/postsSlice";

const PostDetailsPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/posts/${postId}`);
      setPost(data.post);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Post not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleLike = async (id) => {
    // We update local state for immediate feedback
    const liked = post.likes.some(uid => String(id) === String(user.id || user._id));
    const newLikes = liked 
      ? post.likes.filter(uid => String(uid) !== String(user.id || user._id))
      : [...post.likes, user.id || user._id];
    
    setPost({ ...post, likes: newLikes });
    await dispatch(toggleLikePost(id));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="dashboard-card text-center py-5">
        <Card.Body>
          <h5 className="text-danger">{error}</h5>
          <Button variant="primary" onClick={() => navigate("/")} className="mt-3">
            Back to Home
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} lg={8}>
          <Button 
            variant="link" 
            className="mb-3 p-0 text-decoration-none" 
            onClick={() => navigate(-1)}
          >
            ← Back
          </Button>
          {post && (
            <PostCard
              post={post}
              currentUserId={user?.id || user?._id}
              onLike={handleLike}
              onComment={(postId, content) => {
                dispatch(addCommentToPost({ postId, content })).then(() => fetchPost());
              }}
              onDelete={(postId) => {
                dispatch(deletePost(postId)).then(() => navigate("/"));
              }}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PostDetailsPage;
