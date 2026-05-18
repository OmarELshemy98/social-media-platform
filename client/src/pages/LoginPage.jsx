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
          <Card className="auth-card border-0 shadow-lg">
            <Card.Body className="p-4 p-sm-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary mb-2">SocialSphere</h2>
                <h4 className="text-muted">Welcome Back</h4>
                <p className="small">Please enter your details to sign in</p>
              </div>

              {error && (
                <Alert variant="danger" className="py-2 small">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="py-2"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <div className="d-flex justify-content-between">
                    <Form.Label className="small fw-semibold">Password</Form.Label>
                    <Link to="/forgot-password" style={{ fontSize: '0.75rem' }} className="text-decoration-none fw-semibold">
                      Forgot password?
                    </Link>
                  </div>
                  <Form.Control
                    type="password"
                    required
                    placeholder="Enter your password"
                    className="py-2"
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
                      Signing in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <p className="small mb-0">
                  New here? <Link to="/register" className="fw-bold text-decoration-none">Create an account</Link>
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
