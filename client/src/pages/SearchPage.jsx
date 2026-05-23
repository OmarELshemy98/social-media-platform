/**
 * @file SearchPage.jsx
 * @description صفحة "البحث" (The Search Page).
 */

import { useState } from "react";
// مكونات React-Bootstrap.
import { Button, Card, Col, Form, Row, Badge, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
// استيراد أمر تنفيذ البحث من الـ searchSlice.
import { runGlobalSearch } from "../features/search/searchSlice";
// مكون عرض البوستات.
import PostCard from "../components/posts/PostCard";

import { 
  addCommentToPost, 
  deletePost
} from "../features/posts/postsSlice";

import { motion, AnimatePresence } from "framer-motion";

const SearchPage = () => {
  const [query, setQuery] = useState(""); // كلمة البحث اللي اليوزر بيكتبها.
  const dispatch = useDispatch();
  
  // سحب نتائج البحث وحالة التحميل.
  const { users, posts, status } = useSelector((state) => state.search);
  const { user: currentUser } = useSelector((state) => state.auth);

  /**
   * وظيفة تنفيذ البحث لما اليوزر يدوس Enter أو زرار البحث
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(runGlobalSearch(query.trim()));
    }
  };

  return (
    <div className="search-page pb-5">
      <Row className="justify-content-center mb-5">
        <Col xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="dashboard-card border-0 shadow-lg overflow-hidden p-0">
              <Card.Body className="p-4 p-md-5 bg-primary text-white text-center">
                <h2 className="fw-800 mb-3 text-white" style={{ letterSpacing: '-2px' }}>Explore Crew</h2>
                <p className="opacity-75 mb-4">Discover the elite community and trending stories</p>
                <Form onSubmit={handleSearch} className="position-relative">
                  <Form.Control
                    size="lg"
                    placeholder="Search people, #tags, or posts..."
                    className="bg-white border-0 px-5 py-3 rounded-pill shadow-lg"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ fontSize: '1rem' }}
                  />
                  <Button 
                    type="submit" 
                    variant="dark" 
                    className="position-absolute end-0 top-50 translate-middle-y me-2 rounded-pill px-4 fw-bold shadow-none"
                    style={{ height: '42px' }}
                  >
                    Search
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Users Section */}
        <Col xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="dashboard-card border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">People</h5>
                  {status !== "loading" && users.length > 0 && <Badge bg="accent" className="text-primary">{users.length}</Badge>}
                </div>
                
                {status === "loading" && (
                  <div className="text-center py-5">
                    <Spinner animation="border" size="sm" variant="primary" />
                  </div>
                )}

                {!query && status !== "loading" && (
                  <div className="text-center py-5 text-muted">
                    <div className="fs-1 mb-2">🔍</div>
                    <p className="small mb-0">Try searching for "omar" or "admin"</p>
                  </div>
                )}

                {status !== "loading" && users.length === 0 && query && (
                  <p className="text-muted small text-center py-5">No people found for "{query}"</p>
                )}

                <div className="users-list">
                  {users.map((u) => (
                    <motion.div 
                      key={u._id} 
                      whileHover={{ x: 5 }}
                      className="d-flex align-items-center mb-3 p-2 hover-bg rounded-4 transition bg-light border-0"
                    >
                      <img 
                        src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || u.name || 'User')}&background=random`} 
                        alt="avatar" 
                        className="rounded-circle me-3 border shadow-sm"
                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1 overflow-hidden">
                        <Link to={`/profile/${u.username}`} className="fw-bold d-block text-decoration-none text-dark text-truncate">
                          @{u.username}
                        </Link>
                        <span className="small text-muted text-truncate d-block">{u.name}</span>
                      </div>
                      <Button as={Link} to={`/profile/${u.username}`} variant="outline-primary" size="sm" className="rounded-pill px-3">
                        View
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        {/* Posts Section */}
        <Col xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="dashboard-card border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">Posts</h5>
                  {status !== "loading" && posts.length > 0 && <Badge bg="accent" className="text-primary">{posts.length}</Badge>}
                </div>

                {status === "loading" && (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                )}

                {!query && status !== "loading" && (
                  <div className="text-center py-5 text-muted">
                    <div className="fs-1 mb-2">📰</div>
                    <p className="small mb-0">Find interesting posts by keywords or #tags</p>
                  </div>
                )}

                {status !== "loading" && posts.length === 0 && query && (
                  <p className="text-muted text-center py-5">No posts found matching your search.</p>
                )}

                <div className="posts-list">
                  <AnimatePresence>
                    {posts.map((p, index) => (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <PostCard 
                          post={p} 
                          currentUserId={currentUser?.id || currentUser?._id}
                          onComment={(postId, content) => dispatch(addCommentToPost({ postId, content }))}
                          onDelete={(postId) => dispatch(deletePost(postId))}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default SearchPage;
