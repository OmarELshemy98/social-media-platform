/**
 * @file ProfilePage.jsx
 * @description صفحة الملف الشخصي مع معرض الوسائط والتحسينات البصرية.
 */

import { useEffect, useState } from "react";
import { Button, Card, Form, Row, Col, Nav, Tab, Modal, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

import { 
  fetchProfileByUsername, 
  updateMyProfile
} from "../features/profile/profileSlice";
import { 
  sendMessage
} from "../features/messages/messagesSlice";
import { 
  addCommentToPost, 
  deletePost
} from "../features/posts/postsSlice";

import { uploadImage } from "../services/uploadService";
import PostCard from "../components/posts/PostCard";
import { isOnline } from "../utils/timeUtils";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { username } = useParams();
  
  const { user: currentUser } = useSelector((state) => state.auth);
  const { profileUser, profilePosts } = useSelector((state) => state.profile);
  const { messages } = useSelector((state) => state.messages);
  
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", avatarUrl: "", coverUrl: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [showChatModal, setShowNewChatModal] = useState(false);
  const [chatDraft, setChatDraft] = useState("");

  const targetUsername = username || currentUser?.username;
  const isOwner = targetUsername === currentUser?.username;

  useEffect(() => {
    if (targetUsername) dispatch(fetchProfileByUsername(targetUsername));
  }, [dispatch, targetUsername]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    setIsUploading(true);
    try {
      await dispatch(updateMyProfile(form)).unwrap();
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setForm(prev => ({ ...prev, [type]: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // تصفية البوستات اللي فيها ميديا فقط للمعرض
  const mediaPosts = profilePosts.filter(post => post.imageUrl);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="profile-page pb-5"
    >
      {/* Quick Chat Modal */}
      <Modal show={showChatModal} onHide={() => setShowNewChatModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fs-5 fw-bold">Chat with @{profileUser?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="messages-box mb-3 overflow-auto" style={{ height: '300px' }}>
            {messages.map((m) => (
              <div key={m._id} className={`chat-bubble-row ${String(m.sender?._id) === String(currentUser.id || currentUser._id) ? 'chat-bubble-row--mine' : ''}`}>
                <div className={`chat-bubble ${String(m.sender?._id) === String(currentUser.id || currentUser._id) ? 'chat-bubble--mine' : 'chat-bubble--other'}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <Form onSubmit={async (e) => {
            e.preventDefault();
            if (!chatDraft.trim()) return;
            await dispatch(sendMessage({ receiverId: profileUser._id, content: chatDraft }));
            setChatDraft("");
          }}>
            <div className="d-flex gap-2">
              <Form.Control className="rounded-pill" value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} placeholder="Type..." />
              <Button type="submit" variant="primary" className="rounded-pill">Send</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Profile Header */}
      <Card className="dashboard-card border-0 shadow-sm overflow-hidden mb-4 p-0">
        <div 
          className="profile-cover position-relative" 
          style={{ 
            height: '250px', 
            background: profileUser?.coverUrl ? `url(${profileUser.coverUrl}) center/cover` : 'linear-gradient(45deg, #4f46e5, #818cf8)'
          }}
        >
          {editing && (
            <label className="btn btn-dark btn-sm position-absolute bottom-0 end-0 m-3 rounded-pill opacity-75">
              Change Cover
              <input type="file" className="d-none" onChange={(e) => handleImageUpload(e, 'coverUrl')} />
            </label>
          )}
        </div>
        <Card.Body className="px-4 pb-4">
          <Row>
            <Col xs={12} md={4} lg={3} className="text-center text-md-start">
              <div className="profile-avatar-wrapper shadow-lg" style={{ marginTop: '-80px', background: 'var(--surface)', padding: '5px', borderRadius: '50%', display: 'inline-block' }}>
                <img src={form.avatarUrl || profileUser?.avatarUrl || "https://via.placeholder.com/150"} className="rounded-circle object-fit-cover" style={{ width: '150px', height: '150px' }} />
                {editing && (
                  <label className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle p-2 shadow">
                    📷
                    <input type="file" className="d-none" onChange={(e) => handleImageUpload(e, 'avatarUrl')} />
                  </label>
                )}
              </div>
            </Col>
            <Col xs={12} md={8} lg={9} className="pt-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h2 className="fw-bold mb-0">{profileUser?.name}</h2>
                    {!isOwner && <span className={`badge rounded-pill ${isOnline(profileUser?.lastActive) ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.6rem' }}>{isOnline(profileUser?.lastActive) ? 'Online' : 'Offline'}</span>}
                  </div>
                  <p className="text-muted fw-bold mb-1">@{profileUser?.username}</p>
                  <p className="small text-muted mb-3">{profileUser?.bio || "No bio yet."}</p>
                </div>
                <div className="d-flex gap-2">
                  {isOwner ? (
                    <Button variant={editing ? "outline-secondary" : "primary"} className="rounded-pill px-4 fw-bold" onClick={() => {
                      if (!editing) setForm({ name: profileUser.name, bio: profileUser.bio, avatarUrl: profileUser.avatarUrl, coverUrl: profileUser.coverUrl });
                      setEditing(!editing);
                    }}>
                      {editing ? "Cancel" : "Edit Profile"}
                    </Button>
                  ) : (
                    <Button variant="primary" className="rounded-pill px-4 fw-bold" onClick={() => setShowNewChatModal(true)}>Message</Button>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          {editing && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-4 border-top pt-4">
              <Form onSubmit={handleUpdateProfile}>
                <Row className="g-3">
                  <Col md={6}><Form.Group><Form.Label className="small fw-bold">Full Name</Form.Label><Form.Control value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="rounded-3" /></Form.Group></Col>
                  <Col md={12}><Form.Group><Form.Label className="small fw-bold">Bio</Form.Label><Form.Control as="textarea" rows={2} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="rounded-3" /></Form.Group></Col>
                  <Col md={12}><Button type="submit" disabled={isUploading} className="w-100 rounded-pill fw-bold py-2">{isUploading ? <Spinner size="sm" /> : "Save Changes"}</Button></Col>
                </Row>
              </Form>
            </motion.div>
          )}
        </Card.Body>
      </Card>

      {/* Profile Content Tabs */}
      <Tab.Container defaultActiveKey="posts">
        <Nav variant="pills" className="justify-content-center gap-2 mb-4">
          <Nav.Item><Nav.Link eventKey="posts" className="rounded-pill px-4 fw-bold">Posts</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="media" className="rounded-pill px-4 fw-bold">Media Gallery</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="friends" className="rounded-pill px-4 fw-bold">Friends</Nav.Link></Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="posts">
            <Row className="g-4">
              <Col md={8}>
                {profilePosts.length === 0 ? (
                  <Card className="dashboard-card text-center py-5 border-0 shadow-sm">
                    <Card.Body>
                      <div className="fs-1 mb-3">📸</div>
                      <h5 className="fw-bold">No posts yet</h5>
                      <p className="text-muted small">When @{profileUser?.username} posts something, it will appear here.</p>
                    </Card.Body>
                  </Card>
                ) : (
                  profilePosts.map((post, index) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PostCard 
                        post={post} 
                        currentUserId={currentUser?._id || currentUser?.id}
                        onComment={(pid, content) => dispatch(addCommentToPost({ postId: pid, content }))}
                        onDelete={(pid) => window.confirm("Delete this post?") && dispatch(deletePost(pid))}
                      />
                    </motion.div>
                  ))
                )}
              </Col>
              <Col md={4} className="d-none d-md-block">
                <Card className="dashboard-card border-0 shadow-sm mb-4">
                  <Card.Body>
                    <h6 className="fw-bold mb-3">About</h6>
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <span>📍</span>
                        <span className="small text-muted">Earth</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span>📅</span>
                        <span className="small text-muted">Joined {new Date(profileUser?.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="dashboard-card border-0 shadow-sm">
                  <Card.Body>
                    <h6 className="fw-bold mb-3">Music Vibe 🎵</h6>
                    <div className="p-3 rounded-4 bg-accent border-0 d-flex align-items-center gap-3">
                      <div className="bg-primary rounded-3 p-2 text-white">
                        💿
                      </div>
                      <div>
                        <div className="small fw-bold">Midnight City</div>
                        <div className="x-small text-muted" style={{ fontSize: '0.7rem' }}>M83</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          <Tab.Pane eventKey="media">
            <Row className="g-3">
              {mediaPosts.length === 0 ? (
                <Col className="text-center py-5 text-muted">No media found.</Col>
              ) : (
                mediaPosts.map((post) => (
                  <Col key={post._id} xs={6} md={4} lg={3}>
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      className="rounded-4 overflow-hidden shadow-sm border h-100 bg-surface"
                      style={{ aspectRatio: '1/1', cursor: 'pointer' }}
                    >
                      <img src={post.imageUrl} className="w-100 h-100 object-fit-cover" alt="media" />
                    </motion.div>
                  </Col>
                ))
              )}
            </Row>
          </Tab.Pane>

          <Tab.Pane eventKey="friends">
            <Card className="dashboard-card border-0 shadow-sm">
              <Card.Body>
                <Row className="g-3">
                  {profileUser?.friends?.length === 0 ? (
                    <Col className="text-center py-4 text-muted">No friends yet.</Col>
                  ) : (
                    profileUser?.friends?.map(friend => (
                      <Col key={friend._id} md={6}>
                        <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light border">
                          <img src={friend.avatarUrl || "https://via.placeholder.com/50"} className="rounded-circle" style={{ width: '50px', height: '50px' }} />
                          <div>
                            <Link to={`/profile/${friend.username}`} className="fw-bold text-decoration-none text-dark d-block">@{friend.username}</Link>
                            <small className="text-muted">{friend.name}</small>
                          </div>
                        </div>
                      </Col>
                    ))
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </motion.div>
  );
};

export default ProfilePage;
