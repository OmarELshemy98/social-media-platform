/**
 * @file ForgotPasswordPage.jsx
 * @description صفحة "نسيت كلمة السر".
 * اليوزر بيكتب هنا ايميله واليوزر نيم، والموقع بيبعتله لينك على الإيميل عشان يقدر يغير الباسورد لو نسيه.
 */

import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { forgotPassword } from "../features/auth/authSlice";

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: "", username: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const response = await dispatch(forgotPassword(formData)).unwrap();
      setMessage(response);
    } catch (err) {
      setError(err || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-page py-5">
      <Row className="justify-content-center w-100 m-0">
        <Col xs={12} sm={10} md={8} lg={5} xl={4}>
          <Card className="auth-card border-0 shadow-lg">
            <Card.Body className="p-4 p-sm-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary mb-2">SocialSphere</h2>
                <h4 className="text-muted">Reset Password</h4>
                <p className="small">Enter your email and username to receive a reset link</p>
              </div>

              {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
              {message && <Alert variant="success" className="py-2 small">{message}</Alert>}

              {!message && (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold">Username</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      placeholder="your_username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </Form.Group>

                  <Button 
                    className="w-100 py-2 fw-bold" 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" className="me-2" /> : "Send Reset Link"}
                  </Button>
                </Form>
              )}

              <div className="text-center mt-4">
                <p className="small mb-0">
                  Remember your password? <Link to="/login" className="fw-bold text-decoration-none">Back to Login</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPasswordPage;
