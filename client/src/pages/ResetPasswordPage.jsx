/**
 * @file ResetPasswordPage.jsx
 * @description صفحة "تغيير كلمة السر".
 * دي اللي بتفتح لليوزر لما يدوس على اللينك اللي جاله في الإيميل عشان يكتب الباسورد الجديد بتاعه.
 */

import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetPassword } from "../features/auth/authSlice";

const ResetPasswordPage = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError(null);
    
    try {
      await dispatch(resetPassword({ resetToken, password })).unwrap();
      alert("Password updated successfully! Please login with your new password.");
      navigate("/login");
    } catch (err) {
      setError(err || "Failed to reset password");
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
                <h1 className="fw-800 text-primary mb-2" style={{ letterSpacing: '-2px' }}>Crew</h1>
                <h4 className="text-muted">Set New Password</h4>
                <p className="small">Please enter your new password below</p>
              </div>

              {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">New Password</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold">Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    placeholder="Confirm new password"
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordPage;
