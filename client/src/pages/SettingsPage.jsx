/**
 * @file SettingsPage.jsx
 * @description صفحة "الإعدادات" (Settings).
 */

import { useEffect, useState, useCallback } from "react";
// مكونات React-Bootstrap.
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge, Alert, Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// استيراد الـ API عشان نبعت طلبات مباشرة للسيرفر (زي تغيير الباسورد).
import api from "../services/api";
// أمر تسجيل الخروج.
import { logout } from "../features/auth/authSlice";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // States لتغيير كلمة السر.
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });

  // قائمة المستخدمين المحظورين.
  const [blockedUsers, setBlockedUsers] = useState([]);
  
  // States للتحكم في النوافذ المنبثقة (Modals) لتأكيد مسح الحساب.
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  /**
   * وظيفة جلب قائمة المحظورين من السيرفر
   */
  const fetchBlockedUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/profiles/me/blocked-users");
      setBlockedUsers(data.blockedUsers);
    } catch (err) {
      console.error("Failed to fetch blocked users", err);
    }
  }, []);

  // أول ما الصفحة تفتح بنجيب الناس اللي عملنا لهم بلوك.
  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  /**
   * وظيفة فك الحظر عن يوزر
   */
  const handleUnblock = async (userId) => {
    try {
      await api.post(`/profiles/${userId}/unblock`);
      fetchBlockedUsers(); // تحديث القائمة بعد فك الحظر.
    } catch (err) {
      console.error("Failed to unblock user", err);
    }
  };

  /**
   * وظيفة تغيير كلمة السر
   */
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    // بنشيك إن الباسورد الجديد هو نفسه التأكيد.
    if (passwords.next !== passwords.confirm) {
      return setPassMsg({ type: "danger", text: "New passwords do not match" });
    }
    try {
      // بنبعت الباسورد القديم والجديد للسيرفر.
      await api.put("/profiles/me/update-password", {
        currentPassword: passwords.current,
        newPassword: passwords.next
      });
      setPassMsg({ type: "success", text: "Password updated successfully!" });
      setPasswords({ current: "", next: "", confirm: "" }); // بنصفر الفورم.
    } catch (err) {
      setPassMsg({ type: "danger", text: err.response?.data?.message || "Failed to update password" });
    }
  };

  const handleDisableAccount = async () => {
    try {
      await api.put("/profiles/me/disable");
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      console.error("Failed to disable account", err);
      alert("Failed to disable account");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete("/profiles/me/delete");
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      console.error("Failed to delete account", err);
      alert("Failed to delete account");
    }
  };

  return (
    <Container className="py-4">
      <h3 className="fw-bold mb-4">Settings</h3>
      
      <Row className="g-4">
        {/* Left Column: Navigation/Tabs (Simulated with layout) */}
        <Col xs={12} lg={4}>
          <Card className="dashboard-card border-0 shadow-sm mb-4">
            <ListGroup variant="flush">
              <ListGroup.Item action href="#password" className="py-3 fw-semibold">Security & Password</ListGroup.Item>
              <ListGroup.Item action href="#blocking" className="py-3 fw-semibold">Blocking</ListGroup.Item>
              <ListGroup.Item action href="#account" className="py-3 fw-semibold text-danger">Account Management</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        {/* Right Column: Content Sections */}
        <Col xs={12} lg={8}>
          {/* Password Section */}
          <Card id="password" className="dashboard-card border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4">Change Password</h5>
              {passMsg.text && <Alert variant={passMsg.type}>{passMsg.text}</Alert>}
              <Form onSubmit={handleUpdatePassword}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Current Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={passwords.next}
                    onChange={(e) => setPasswords({...passwords, next: e.target.value})}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">Confirm New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    required
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="rounded-pill px-4">Update Password</Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Blocking Section */}
          <Card id="blocking" className="dashboard-card border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-2">Blocking</h5>
              <p className="text-muted small mb-4">Once you block someone, that person can no longer see things you post on your timeline.</p>
              
              {blockedUsers.length === 0 ? (
                <p className="text-center py-3 text-muted small">No blocked users.</p>
              ) : (
                <ListGroup variant="flush">
                  {blockedUsers.map(u => (
                    <ListGroup.Item key={u._id} className="d-flex align-items-center justify-content-between py-3 px-0 border-top">
                      <div className="d-flex align-items-center">
                        <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || 'User')}&background=random`} className="rounded-circle me-3" style={{width:'40px', height:'40px'}} />
                        <span className="fw-bold">@{u.username}</span>
                      </div>
                      <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => handleUnblock(u._id)}>Unblock</Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>

          {/* Account Management */}
          <Card id="account" className="dashboard-card border-0 shadow-sm mb-4 border-danger">
            <Card.Body className="p-4">
              <h5 className="fw-bold text-danger mb-4">Account Management</h5>
              <div className="d-flex flex-column gap-3">
                <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1 fw-bold">Disable Account</h6>
                    <p className="mb-0 small text-muted">Temporarily hide your profile and posts.</p>
                  </div>
                  <Button variant="outline-warning" className="rounded-pill" onClick={() => setShowDisableModal(true)}>Disable</Button>
                </div>

                <div className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1 fw-bold text-danger">Delete Account</h6>
                    <p className="mb-0 small text-muted">Permanently remove all your data. This cannot be undone.</p>
                  </div>
                  <Button variant="danger" className="rounded-pill" onClick={() => setShowDeleteModal(true)}>Delete</Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      <Modal show={showDisableModal} onHide={() => setShowDisableModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Disable Account?</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to disable your account? You can reactivate it later by logging in.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDisableModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleDisableAccount}>Yes, Disable</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="text-danger">Delete Permanently?</Modal.Title></Modal.Header>
        <Modal.Body>This action is irreversible. All your posts, messages, and profile data will be deleted forever.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteAccount}>Delete My Account</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SettingsPage;
