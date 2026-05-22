/**
 * @file LoginPage.jsx
 * @description صفحة "تسجيل الدخول".
 * هنا اليوزر بيكتب بياناته (الايميل والباسورد) عشان يدخل على حسابه.
 * لو البيانات صح، بيتم تحويله فوراً للصفحة الرئيسية.
 */

import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, loginUser } from "../features/auth/authSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, status, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <Container className="auth-page py-5">
      <Row className="justify-content-center w-100 m-0">
        <Col xs={12} sm={10} md={8} lg={5} xl={4}>
          <Card className="auth-card border-0 shadow-lg" style={{ borderRadius: '2rem' }}>
            <Card.Body className="p-4 p-sm-5">
              <div className="text-center mb-5">
                <h1 className="fw-800 text-primary mb-2" style={{ letterSpacing: '-2px' }}>Crew</h1>
                <h4 className="fw-bold">Welcome Back</h4>
                <p className="text-muted small">Elevate your social experience</p>
              </div>

              {error && (
                <Alert variant="danger" className="py-2 small border-0 rounded-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
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

                <Form.Group className="mb-4">
                  <div className="d-flex justify-content-between px-2">
                    <Form.Label className="small fw-bold">Password</Form.Label>
                    <Link to="/forgot-password" style={{ fontSize: '0.75rem' }} className="text-decoration-none fw-bold text-primary">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      required
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
                      Authenticating...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-5">
                <p className="small text-muted mb-0">
                  New here? <Link to="/register" className="fw-bold text-primary text-decoration-none ms-1">Create an account</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
