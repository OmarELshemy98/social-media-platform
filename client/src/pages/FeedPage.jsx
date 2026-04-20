import { Card, Col, Row } from "react-bootstrap";

const FeedPage = () => {
  return (
    <Row>
      <Col lg={8}>
        <Card className="dashboard-card">
          <Card.Body>
            <h4>Your Feed</h4>
            <p className="text-muted mb-0">
              Feed, post CRUD, likes, nested comments, and optimistic updates will be added in the next step.
            </p>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={4}>
        <Card className="dashboard-card">
          <Card.Body>
            <h5>Trending</h5>
            <p className="text-muted mb-0">Search, notifications, and activity widgets go here.</p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default FeedPage;
