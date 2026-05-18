/**
 * @file ForgotPasswordPage.jsx
 * @description صفحة "نسيت كلمة السر".
 * المستخدم يدخل بريده، اسم المستخدم، ورقم الهاتف.
 * إذا كانت البيانات صحيحة، يظهر له نموذج تغيير كلمة السر فوراً.
 */

import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { forgotPassword, resetPassword } from "../features/auth/authSlice";

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // الحالة لإدارة الخطوات
  const [step, setStep] = useState(1); // 1: التحقق، 2: تعيين باسورد جديد
  
  // بيانات التحقق
  const [verifyData, setVerifyData] = useState({ email: "", username: "", phoneNumber: "" });
  
  // بيانات الباسورد الجديد
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // معالجة التحقق (الخطوة 1)
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // تنظيف اسم المستخدم من علامة @
    const cleanUsername = verifyData.username.startsWith("@") 
      ? verifyData.username.substring(1) 
      : verifyData.username;

    try {
      const response = await dispatch(forgotPassword({ ...verifyData, username: cleanUsername })).unwrap();
      setResetToken(response.resetToken);
      setStep(2); // الانتقال لخطوة تغيير الباسورد
    } catch (err) {
      setError(err || "Verification failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  // معالجة تغيير الباسورد (الخطوة 2)
  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError(null);

    try {
      await dispatch(resetPassword({ resetToken, password: newPassword })).unwrap();
      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err || "Failed to update password");
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
                <h4 className="text-muted">
                  {step === 1 ? "Verify Identity" : "New Password"}
                </h4>
                <p className="small text-muted">
                  {step === 1 
                    ? "Enter your account details to continue" 
                    : "Create a strong password for your account"}
                </p>
              </div>

              {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
              {success && <Alert variant="success" className="py-2 small">{success}</Alert>}

              {step === 1 && !success && (
                <Form onSubmit={handleVerify}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={verifyData.email}
                      onChange={(e) => setVerifyData({ ...verifyData, email: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">Username</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      placeholder="@username"
                      value={verifyData.username}
                      onChange={(e) => setVerifyData({ ...verifyData, username: e.target.value })}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold">Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      required
                      placeholder="+20..."
                      value={verifyData.phoneNumber}
                      onChange={(e) => setVerifyData({ ...verifyData, phoneNumber: e.target.value })}
                    />
                  </Form.Group>

                  <Button 
                    className="w-100 py-2 fw-bold" 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" className="me-2" /> : "Verify Details"}
                  </Button>
                </Form>
              )}

              {step === 2 && !success && (
                <Form onSubmit={handleReset}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">New Password</Form.Label>
                    <Form.Control
                      type="password"
                      required
                      minLength={6}
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold">Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Form.Group>

                  <Button 
                    className="w-100 py-2 fw-bold" 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" className="me-2" /> : "Update Password"}
                  </Button>
                </Form>
              )}

              <div className="text-center mt-4">
                <p className="small mb-0">
                  Remembered? <Link to="/login" className="fw-bold text-decoration-none">Back to Login</Link>
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
