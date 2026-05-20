/**
 * @file FeedPage.jsx
 * @description دي "الصفحة الرئيسية" (The Home Feed).
 * هنا بيظهر صندوق كتابة البوستات الجديدة، وتحته كل البوستات بتاعة الناس.
 * بنستخدم مكتبات React و Redux و React-Bootstrap عشان نبني الواجهة.
 */

import { useEffect } from "react";
// مكتبة React-Bootstrap: بتدينا مكونات جاهزة وشكلها حلو زي Alert, Card, Row, Col, Spinner.
import { Alert, Card, Col, Row, Spinner } from "react-bootstrap";
// useDispatch: عشان نبعت أوامر (Actions) للـ Redux.
// useSelector: عشان نسحب بيانات من الـ Redux Store.
import { useDispatch, useSelector } from "react-redux";
// Link: عشان نتنقل بين الصفحات من غير ما الموقع يعمل ريفريش.
import { Link } from "react-router-dom";

// استيراد الأوامر (Actions) اللي هنحتاجها من الـ postsSlice.
import { 
  fetchFeedPosts, 
  createPost, 
  toggleReaction,
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

            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?.id || user?._id}
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
              <h6 className="fw-bold mb-3">People you might know</h6>
              {suggestions.length === 0 ? (
                <p className="small text-muted mb-0">No suggestions at the moment.</p>
              ) : (
                <div className="suggestions-list">
                  {suggestions.map((sug) => (
                    <div key={sug._id} className="d-flex align-items-center mb-3">
                      <img 
                        src={sug.avatarUrl || "https://via.placeholder.com/32"} 
                        alt="avatar" 
                        className="rounded-circle me-2"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1 overflow-hidden">
                        <Link to={`/profile/${sug.username}`} className="d-block small fw-bold text-decoration-none text-dark text-truncate">
                          @{sug.username}
                        </Link>
                        <span className="d-block x-small text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                          {sug.name}
                        </span>
                      </div>
                      <Link to={`/profile/${sug.username}`} className="btn btn-outline-primary btn-sm rounded-pill py-0 px-2" style={{ fontSize: '0.7rem' }}>
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </Col>
    </Row>
  );
};

export default FeedPage;
