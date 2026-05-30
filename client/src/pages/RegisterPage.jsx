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
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { clearAuthError, registerUser, loginWithGoogle } from "../features/auth/authSlice";
import SEO from "../components/layout/SEO";

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

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // التوكن ده بنبعته للسيرفر عشان يتحقق منه
      dispatch(loginWithGoogle(tokenResponse.access_token));
    },
    onError: (error) => console.log('Google Login Failed:', error)
  });

  return (
    <Container className="auth-page py-5">
      <SEO 
        title="Join Crew" 
        description="Create your Crew account today. Join the elite social network for HD communication and real-time networking." 
      />
      <Row className="justify-content-center w-100 m-0">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Card className="auth-card border-0 shadow-lg" style={{ borderRadius: '2.5rem' }}>
              <Card.Body className="p-4 p-sm-5">
                <div className="text-center mb-5">
                  <motion.h1 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="fw-800 text-primary mb-2" 
                    style={{ letterSpacing: '-2px' }}
                  >
                    Crew
                  </motion.h1>
                  <h4 className="fw-bold">Join the Crew</h4>
                  <p className="text-muted small">Experience the next level of social elite</p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert variant="danger" className="py-2 small border-0 rounded-4 mb-4 shadow-sm">
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
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button 
                  variant="outline-dark" 
                  className="w-100 py-3 rounded-4 fw-bold mb-4 d-flex align-items-center justify-content-center gap-2 border-2 transition-all"
                  style={{ fontSize: '0.9rem' }}
                  onClick={handleGoogleSignup}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
                  Continue with Google
                </Button>

                <div className="position-relative mb-4">
                  <hr className="text-muted opacity-25" />
                  <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small fw-bold">OR</span>
                </div>

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

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
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
                  </motion.div>
                </Form>

                <div className="text-center mt-5">
                  <p className="small text-muted mb-0">
                    Already a member? <Link to="/login" className="fw-bold text-primary text-decoration-none ms-1">Login</Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
