import { useEffect } from "react";
import { Alert, Card, Col, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import PostComposer from "../components/posts/PostComposer";
import PostCard from "../components/posts/PostCard";
import {
  addCommentToPost,
  createPost,
  deletePost,
  fetchFeedPosts,
  optimisticToggleLike,
  toggleLikePost,
} from "../features/posts/postsSlice";

const FeedPage = () => {
  const dispatch = useDispatch();
  const { posts, status, error } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchFeedPosts());
    const interval = setInterval(() => {
      dispatch(fetchFeedPosts());
    }, 12000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLike = async (postId) => {
    dispatch(optimisticToggleLike({ postId, userId: user.id || user._id }));
    await dispatch(toggleLikePost(postId));
  };

  return (
    <Row className="g-4">
      <Col xs={12} lg={8}>
        <PostComposer onCreate={(payload) => dispatch(createPost(payload))} />
        {error && <Alert variant="danger" className="my-3">{error}</Alert>}
        {status === "loading" && posts.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-2">Loading your feed...</p>
          </div>
        ) : (
          <div className="posts-container">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?.id || user?._id}
                onLike={handleLike}
                onComment={(postId, content) => dispatch(addCommentToPost({ postId, content }))}
                onDelete={(postId) => dispatch(deletePost(postId))}
              />
            ))}
            {posts.length === 0 && status !== "loading" && (
              <Card className="dashboard-card text-center py-5">
                <Card.Body>
                  <h5 className="text-muted">No posts yet</h5>
                  <p className="small mb-0">Follow someone or search for tags to see posts here!</p>
                </Card.Body>
              </Card>
            )}
          </div>
        )}
      </Col>
      <Col xs={12} lg={4} className="d-none d-lg-block">
        <div className="sticky-top" style={{ top: '2rem', zIndex: 10 }}>
          <Card className="dashboard-card border-0 shadow-sm mb-3">
            <Card.Body>
              <h5 className="fw-bold mb-3">Quick Stats</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Total posts</span>
                <span className="fw-bold small">{posts.length}</span>
              </div>
              <hr />
              <p className="small text-muted mb-0">
                Tip: Use the search page to find users and trending tags.
              </p>
            </Card.Body>
          </Card>
          
          <Card className="dashboard-card border-0 shadow-sm">
            <Card.Body>
              <h6 className="fw-bold mb-2">Suggestions</h6>
              <p className="small text-muted">Coming soon: People you might know.</p>
            </Card.Body>
          </Card>
        </div>
      </Col>
    </Row>
  );
};

export default FeedPage;
