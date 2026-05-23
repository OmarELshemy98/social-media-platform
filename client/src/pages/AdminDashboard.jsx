/**
 * @file AdminDashboard.jsx
 * @description لوحة تحكم الآدمن لإدارة المستخدمين والمحتوى.
 */

import { useEffect, useState } from "react";
import { Container, Table, Button, Badge, Card, Row, Col, Alert, Form, Modal } from "react-bootstrap";
import api from "../services/api";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassModal, setShowPassModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      fetchUsers();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure? This will delete the user and ALL their posts!")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        alert("Error deleting user");
      }
    }
  };

  const handleMakeAdmin = async (userId) => {
    if (window.confirm("Promote this user to Admin?")) {
      try {
        await api.put(`/admin/users/${userId}/make-admin`);
        fetchUsers();
      } catch (err) {
        alert("Error promoting user");
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Container className="py-5 text-center"><h3>Loading Dashboard...</h3></Container>;

  return (
    <Container className="py-4">
      <Card className="dashboard-card border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-1">Admin Dashboard</h3>
              <p className="text-muted small mb-0">Manage users, view credentials, and moderate content.</p>
            </div>
            <Badge bg="primary" className="rounded-pill px-3 py-2">Total Users: {users.length}</Badge>
          </div>

          <Form.Control 
            type="text" 
            placeholder="Search by name, username or email..." 
            className="mb-4 rounded-pill border-0 bg-light px-4 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr className="text-muted small text-uppercase">
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Password (Hashed)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img 
                          src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}&background=random`} 
                          className="rounded-circle" 
                          style={{ width: '32px', height: '32px', objectFit: 'cover' }} 
                        />
                        <div>
                          <div className="fw-bold small">@{u.username}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge bg={u.role === 'admin' ? 'dark' : 'secondary'} className="rounded-pill">
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={u.status === 'active' ? 'success' : 'danger'} className="rounded-pill">
                        {u.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-decoration-none p-0 text-truncate" 
                        style={{ maxWidth: '100px', fontSize: '0.7rem' }}
                        onClick={() => { setSelectedUser(u); setShowPassModal(true); }}
                      >
                        View Hash
                      </Button>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant={u.status === 'active' ? "outline-warning" : "outline-success"} 
                          size="sm" 
                          className="rounded-pill"
                          onClick={() => handleToggleStatus(u._id)}
                        >
                          {u.status === 'active' ? "Suspend" : "Activate"}
                        </Button>
                        {u.role !== 'admin' && (
                          <Button 
                            variant="outline-dark" 
                            size="sm" 
                            className="rounded-pill"
                            onClick={() => handleMakeAdmin(u._id)}
                          >
                            Admin
                          </Button>
                        )}
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="rounded-pill"
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Password View Modal */}
      <Modal show={showPassModal} onHide={() => setShowPassModal(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fs-6 fw-bold">User Security Info</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="bg-light p-3 rounded-3 mb-3">
            <small className="text-muted d-block mb-1">Username</small>
            <div className="fw-bold">@{selectedUser?.username}</div>
          </div>
          <div className="bg-dark text-light p-3 rounded-3" style={{ wordBreak: 'break-all' }}>
            <small className="text-muted d-block mb-2 text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>Bcrypt Password Hash (Secure)</small>
            <code className="text-info" style={{ fontSize: '0.8rem' }}>{selectedUser?.password}</code>
          </div>
          <Alert variant="info" className="mt-3 small py-2">
            Note: Passwords are encrypted for security. You can see the hash but not the plain text.
          </Alert>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
