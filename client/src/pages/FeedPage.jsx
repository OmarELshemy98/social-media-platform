/**
 * @file FeedPage.jsx
 * @description دي "الصفحة الرئيسية" (The Home Feed).
 * هنا بيظهر صندوق كتابة البوستات الجديدة، وتحته كل البوستات بتاعة الناس.
 * بنستخدم مكتبات React و Redux و React-Bootstrap عشان نبني الواجهة.
 */

import { useEffect } from "react";
// مكتبة React-Bootstrap: بتدينا مكونات جاهزة وشكلها حلو زي Alert, Card, Row, Col, Spinner, Button.
import { Alert, Card, Col, Row, Spinner, Button } from "react-bootstrap";
// useDispatch: عشان نبعت أوامر (Actions) للـ Redux.
// useSelector: عشان نسحب بيانات من الـ Redux Store.
import { useDispatch, useSelector } from "react-redux";
// Link: عشان نتنقل بين الصفحات من غير ما الموقع يعمل ريفريش.
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// استيراد الأوامر (Actions) اللي هنحتاجها من الـ postsSlice.
import { 
  fetchFeedPosts, 
  createPost, 
  addCommentToPost,
  deletePost
} from "../features/posts/postsSlice";
// استيراد أمر جلب الاقتراحات من الـ profileSlice.
import { fetchSuggestions } from "../features/profile/profileSlice";
// استيراد المكونات الصغيرة اللي بنبني بيها الصفحة.
import PostCard from "../components/posts/PostCard";
import PostComposer from "../components/posts/PostComposer";
import StoriesSection from "../components/layout/StoriesSection";

const FeedPage = () => {
  const dispatch = useDispatch();
  
  // بنسحب بيانات البوستات وحالة التحميل من مخزن الـ posts.
  const { posts, status, error } = useSelector((state) => state.posts);
  // بنسحب بيانات اليوزر اللي مسجل دخول دلوقتي.
  const { user } = useSelector((state) => state.auth);
  // بنسحب قائمة الاقتراحات من مخزن الـ profile.
  const { suggestions } = useSelector((state) => state.profile);

  // الـ useEffect دي بتشتغل أول ما الصفحة تفتح.
  useEffect(() => {
    // بنطلب من السيرفر جلب البوستات والاقتراحات.
    dispatch(fetchFeedPosts());
    dispatch(fetchSuggestions());
  }, [dispatch]);

  return (
    <Row className="g-4">
      <Col xs={12} lg={8}>
        {/* قسم الستوري */}
        <div className="mb-4">
          <StoriesSection />
        </div>
        
        {/* صندوق كتابة بوست جديد */}
        <PostComposer 
          onPostCreated={(content, media) => dispatch(createPost({ content, media }))} 
        />

        {/* عرض البوستات أو رسالة تحميل أو خطأ */}
        {status === "loading" && posts.length === 0 ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="rounded-4 border-0 shadow-sm">{error}</Alert>
        ) : (
          <div className="posts-feed">
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard
                  post={post}
                  currentUserId={user?.id || user?._id}
                  onComment={(postId, content) => dispatch(addCommentToPost({ postId, content }))}
                  onDelete={(postId) => dispatch(deletePost(postId))}
                />
              </motion.div>
            ))}
            {posts.length === 0 && status !== "loading" && (
              <Card className="dashboard-card text-center py-5 border-0 shadow-sm">
                <Card.Body>
                  <div className="mb-3 fs-1">📭</div>
                  <h5 className="fw-bold">Your feed is empty</h5>
                  <p className="text-muted small mb-0">Follow some people to see their posts here!</p>
                </Card.Body>
              </Card>
            )}
          </div>
        )}
      </Col>
      <Col xs={12} lg={4} className="d-none d-lg-block">
        <div className="sticky-top" style={{ top: '6rem', zIndex: 10 }}>
          {/* Trending Section */}
          <Card className="dashboard-card border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <span>🔥</span> Trending Now
              </h5>
              <div className="trending-list">
                {[
                  { tag: "javascript", count: "1.2k" },
                  { tag: "reactjs", count: "850" },
                  { tag: "crew_platform", count: "420" },
                  { tag: "luxury_ui", count: "310" },
                ].map((item, i) => (
                  <div key={i} className="trending-item">
                    <span className="trending-tag">#{item.tag}</span>
                    <span className="trending-count">{item.count} posts</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Suggestions Section */}
          <Card className="dashboard-card border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-bold mb-0">Who to follow</h6>
                <Link to="/search" className="small text-decoration-none fw-bold">View all</Link>
              </div>
              {suggestions.length === 0 ? (
                <p className="small text-muted mb-0">No suggestions yet.</p>
              ) : (
                <div className="suggestions-list">
                  {suggestions.slice(0, 5).map((sug) => (
                    <div key={sug._id} className="d-flex align-items-center mb-3 p-2 hover-bg rounded-4 transition">
                      <img 
                        src={sug.avatarUrl || "https://via.placeholder.com/40"} 
                        alt="avatar" 
                        className="rounded-circle me-3 border"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1 overflow-hidden">
                        <Link to={`/profile/${sug.username}`} className="d-block small fw-bold text-decoration-none text-dark text-truncate">
                          @{sug.username}
                        </Link>
                        <span className="d-block text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
                          {sug.name}
                        </span>
                      </div>
                      <Button as={Link} to={`/profile/${sug.username}`} variant="outline-primary" size="sm" className="rounded-pill py-1 px-3" style={{ fontSize: '0.7rem' }}>
                        Profile
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
          
          <div className="mt-4 px-3">
            <p className="x-small text-muted mb-0" style={{ fontSize: '0.7rem' }}>
              © 2026 Crew Platform. Built for the elite.
            </p>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default FeedPage;
