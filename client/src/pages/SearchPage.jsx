import { useState } from "react";
import { Button, Card, Col, Form, Row, Badge, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { runGlobalSearch } from "../features/search/searchSlice";
import PostCard from "../components/posts/PostCard";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const { users, posts, status } = useSelector((state) => state.search);
  const { user: currentUser } = useSelector((state) => state.auth);

  return (
    <div className="search-page pb-5">
      <Row className="justify-content-center mb-4">
        <Col xs={12} lg={10}>
          <Card className="dashboard-card border-0 shadow-sm">
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-3">Search SocialSphere</h4>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (query.trim()) dispatch(runGlobalSearch(query));
                }}
                className="d-flex gap-2"
              >
                <Form.Control
                  size="lg"
                  placeholder="Find people, posts, or #tags..."
                  className="bg-light border-0 px-4 rounded-pill"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button type="submit" variant="primary" className="px-4 rounded-pill">
                  Search
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Users Section */}
        <Col xs={12} lg={4}>
          <Card className="dashboard-card border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="fw-bold mb-4 d-flex align-items-center">
                People
                {status !== "loading" && <Badge bg="secondary" className="ms-2 small">{users.length}</Badge>}
              </h5>
              
              {status === "loading" && (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              )}

              {status !== "loading" && users.length === 0 && query && (
                <p className="text-muted small text-center">No people found.</p>
              )}

              <div className="users-list">
                {users.map((u) => (
                  <div key={u._id} className="d-flex align-items-center mb-3 p-2 hover-bg rounded transition">
                    <img 
                      src={u.avatarUrl || "https://via.placeholder.com/40"} 
                      alt="avatar" 
                      className="rounded-circle me-3"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                      <Link to={`/profile/${u.username}`} className="fw-bold d-block text-decoration-none">
                        @{u.username}
                      </Link>
                      <span className="small text-muted">{u.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Posts Section */}
        <Col xs={12} lg={8}>
          <Card className="dashboard-card border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-4 d-flex align-items-center">
                Posts
                {status !== "loading" && <Badge bg="secondary" className="ms-2 small">{posts.length}</Badge>}
              </h5>

              {status === "loading" && (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              )}

              {status !== "loading" && posts.length === 0 && query && (
                <p className="text-muted text-center py-4">No posts found matching your search.</p>
              )}

              <div className="posts-list">
                {posts.map((p) => (
                  <PostCard 
                    key={p._id} 
                    post={p} 
                    currentUserId={currentUser?.id || currentUser?._id}
                    onLike={() => {}} // Could be implemented
                    onComment={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SearchPage;
