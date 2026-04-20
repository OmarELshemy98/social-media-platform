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
    <Row>
      <Col lg={8}>
        <PostComposer onCreate={(payload) => dispatch(createPost(payload))} />
        {error && <Alert variant="danger">{error}</Alert>}
        {status === "loading" ? (
          <div className="text-center py-4">
            <Spinner />
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={user?.id || user?._id}
              onLike={handleLike}
              onComment={(postId, content) => dispatch(addCommentToPost({ postId, content }))}
              onDelete={(postId) => dispatch(deletePost(postId))}
            />
          ))
        )}
      </Col>
      <Col lg={4}>
        <Card className="dashboard-card">
          <Card.Body>
            <h5>Quick Stats</h5>
            <p className="text-muted mb-1">Total posts in feed: {posts.length}</p>
            <p className="text-muted mb-0">Use search page to find users and tags.</p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default FeedPage;
