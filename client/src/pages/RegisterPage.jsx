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
  const [showPassword, setShowPassword] = useState(false);

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
          <Card className="auth-card border-0 shadow-lg" style={{ borderRadius: '2rem' }}>
            <Card.Body className="p-4 p-sm-5">
              <div className="text-center mb-5">
                <h1 className="fw-800 text-primary mb-2" style={{ letterSpacing: '-2px' }}>SocialSphere</h1>
                <h4 className="fw-bold">Create Account</h4>
                <p className="text-muted small">Join our exclusive community today</p>
              </div>

              {error && (
                <Alert variant="danger" className="py-2 small border-0 rounded-3">
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
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold ms-2">Full Name</Form.Label>
                      <Form.Control
                        required
                        placeholder="John Doe"
                        className="py-3 px-4 rounded-4 bg-light border-0 shadow-none"
                        style={{ fontSize: '0.9rem' }}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold ms-2">Username</Form.Label>
                      <Form.Control
                        required
                        placeholder="johndoe"
                        className="py-3 px-4 rounded-4 bg-light border-0 shadow-none"
                        style={{ fontSize: '0.9rem' }}
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mt-3">
                  <Form.Label className="small fw-bold ms-2">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="py-3 px-4 rounded-4 bg-light border-0 shadow-none"
                    style={{ fontSize: '0.9rem' }}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label className="small fw-bold ms-2">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    required
                    placeholder="+20..."
                    className="py-3 px-4 rounded-4 bg-light border-0 shadow-none"
                    style={{ fontSize: '0.9rem' }}
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mt-3 mb-4">
                  <Form.Label className="small fw-bold ms-2">Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="py-3 px-4 rounded-4 bg-light border-0 shadow-none"
                      style={{ fontSize: '0.9rem', paddingRight: '3.5rem' }}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <div 
                      className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: 'pointer', zIndex: 10 }}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </div>
                  </div>
                </Form.Group>

                <Button 
                  className="w-100 py-3 fw-bold rounded-4 shadow-sm mt-2" 
                  type="submit" 
                  variant="primary"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-5">
                <p className="small text-muted mb-0">
                  Already a member? <Link to="/login" className="fw-bold text-primary text-decoration-none ms-1">Login</Link>
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
