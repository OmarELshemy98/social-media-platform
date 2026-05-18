/**
 * @file RegisterPage.jsx
 * @description صفحة "إنشاء حساب جديد" (Sign Up).
 * هنا اليوزر بيملا بياناته (الاسم، الايميل، التليفون، الباسورد) عشان ينضم للمنصة.
 * فيها نظام Validation عشان نتأكد إن كل حاجة مكتوبة صح قبل ما نبعتها للسيرفر.
 */

import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, registerUser } from "../features/auth/authSlice";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, status, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(registerUser(formData));
  };

  return (
    <Container className="auth-page py-5">
      <Row className="justify-content-center w-100 m-0">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="auth-card border-0 shadow-lg">
            <Card.Body className="p-4 p-sm-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary mb-2">SocialSphere</h2>
                <h4 className="text-muted">Create Account</h4>
                <p className="small">Join our community today</p>
              </div>

              {error && (
                <Alert variant="danger" className="py-2 small">
                  {Array.isArray(error) ? (
                    <ul className="mb-0 ps-3">
                      {error.map((err, index) => (
                        <li key={index}>{err.msg}</li>
                      ))}
                    </ul>
                  ) : (
                    error
                  )}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-semibold">Full Name</Form.Label>
                      <Form.Control
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-semibold">Username</Form.Label>
                      <Form.Control
                        required
                        placeholder="johndoe123"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    required
                    placeholder="+201234567890"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold">Password</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </Form.Group>

                <Button 
                  className="w-100 py-2 fw-bold" 
                  type="submit" 
                  variant="primary"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Creating account...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="small mb-0">
                  Already have an account? <Link to="/login" className="fw-bold text-decoration-none">Login</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
