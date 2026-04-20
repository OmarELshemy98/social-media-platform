import { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { runGlobalSearch } from "../features/search/searchSlice";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const { users, posts, status } = useSelector((state) => state.search);

  return (
    <Row>
      <Col lg={12}>
        <Card className="dashboard-card mb-3">
          <Card.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                dispatch(runGlobalSearch(query));
              }}
              className="d-flex gap-2"
            >
              <Form.Control
                placeholder="Search users or posts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button type="submit">Search</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={4}>
        <Card className="dashboard-card">
          <Card.Body>
            <h5>Users</h5>
            {status === "loading" && <p>Searching...</p>}
            {users.map((u) => (
              <p key={u._id} className="mb-1">
                <Link to={`/profile/${u.username}`}>@{u.username}</Link> - {u.name}
              </p>
            ))}
          </Card.Body>
        </Card>
      </Col>
      <Col lg={8}>
        <Card className="dashboard-card">
          <Card.Body>
            <h5>Posts</h5>
            {posts.map((p) => (
              <div key={p._id} className="border-bottom py-2">
                <strong>@{p.author?.username}</strong>
                <p className="mb-0">{p.content}</p>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SearchPage;
