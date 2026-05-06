import { useEffect, useState } from "react";
import { Button, Card, Form, Row, Col, Nav, Tab, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { 
  fetchProfileByUsername, 
  updateMyProfile,
  sendFriendRequest,
  acceptFriendRequest,
  unfriendUser,
  blockUser
} from "../features/profile/profileSlice";
import { 
  startConversationWithUser,
  fetchConversationMessages,
  sendMessage
} from "../features/messages/messagesSlice";
import { 
  addCommentToPost, 
  deletePost, 
  optimisticToggleLike, 
  toggleLikePost 
} from "../features/posts/postsSlice";
import { uploadImage } from "../services/uploadService";
import PostCard from "../components/posts/PostCard";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { profileUser, profilePosts, relationship } = useSelector((state) => state.profile);
  const { messages, activeConversationId } = useSelector((state) => state.messages);
  
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", avatarUrl: "", coverUrl: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // States for Quick Chat Popup
  const [showChatModal, setShowNewChatModal] = useState(false);
  const [chatDraft, setChatDraft] = useState("");

  const targetUsername = username || currentUser?.username;
  const isOwner = targetUsername === currentUser?.username;

  useEffect(() => {
    if (targetUsername) dispatch(fetchProfileByUsername(targetUsername));
  }, [dispatch, targetUsername]);

  // Interval for refreshing messages when popup is open
  useEffect(() => {
    let interval;
    if (showChatModal && activeConversationId) {
      interval = setInterval(() => {
        dispatch(fetchConversationMessages(activeConversationId));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [dispatch, showChatModal, activeConversationId]);

  const handleLike = async (postId) => {
    dispatch(optimisticToggleLike({ postId, userId: currentUser.id || currentUser._id }));
    await dispatch(toggleLikePost(postId));
  };

  const handleMessageClick = async () => {
    if (profileUser?.username) {
      const result = await dispatch(startConversationWithUser(profileUser.username)).unwrap();
      await dispatch(fetchConversationMessages(result._id));
      setShowNewChatModal(true);
    }
  };

  const handleSendQuickMessage = async (e) => {
    e.preventDefault();
    if (!chatDraft.trim() || !profileUser?._id) return;
    await dispatch(sendMessage({ receiverId: profileUser._id, content: chatDraft.trim() }));
    setChatDraft("");
  };

  return (
    <div className="profile-page pb-5">
      {/* Quick Chat Modal */}
      <Modal 
        show={showChatModal} 
        onHide={() => setShowNewChatModal(false)}
        centered
        size="md"
        className="quick-chat-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5 fw-bold">
            Chat with @{profileUser?.username}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <div 
            className="quick-messages-box mb-3 overflow-auto" 
            style={{ height: '350px', padding: '10px', background: '#f8f9fa', borderRadius: '12px' }}
          >
            {messages.length === 0 ? (
              <div className="h-100 d-flex align-items-center justify-content-center text-muted small">
                No messages yet. Say hi!
              </div>
            ) : (
              messages.map((m) => (
                <div 
                  key={m._id} 
                  className={`chat-bubble-row ${String(m.sender?._id) === String(currentUser.id || currentUser._id) ? 'chat-bubble-row--mine' : ''}`}
                >
                  <div className={`chat-bubble ${String(m.sender?._id) === String(currentUser.id || currentUser._id) ? 'chat-bubble--mine' : 'chat-bubble--other'}`}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
          </div>
          <Form onSubmit={handleSendQuickMessage}>
            <div className="d-flex gap-2">
              <Form.Control 
                placeholder="Type a message..."
                className="rounded-pill px-3"
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
              />
              <Button type="submit" variant="primary" className="rounded-pill px-4">Send</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Profile Header Card */}
      <Card className="dashboard-card border-0 shadow-sm overflow-hidden mb-4">
        <div 
          className="profile-cover" 
          style={{ 
            height: '220px', 
            backgroundImage: profileUser?.coverUrl ? `url(${profileUser.coverUrl})` : 'linear-gradient(45deg, #0d6efd, #6610f2)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        ></div>
        <Card.Body className="px-4 pt-0">
          <Row>
            <Col xs={12} md={4} lg={3} className="text-center text-md-start">
              <div 
                className="profile-avatar-wrapper shadow"
                style={{ 
                  marginTop: '-75px',
                  display: 'inline-block',
                  padding: '5px',
                  background: 'var(--surface)',
                  borderRadius: '50%',
                  position: 'relative',
                  zIndex: 10
                }}
              >
                <img 
                  src={profileUser?.avatarUrl || "https://via.placeholder.com/150"} 
                  alt="avatar" 
                  className="rounded-circle"
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    objectFit: 'cover',
                  }}
                />
              </div>
            </Col>
            <Col xs={12} md={8} lg={9} className="pt-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start">
                <div className="text-center text-md-start mb-3 mb-md-0">
                  <h2 className="fw-bold mb-1">{profileUser?.name}</h2>
                  <p className="text-muted fs-5 mb-2">@{profileUser?.username}</p>
                  <div className="d-flex gap-4 justify-content-center justify-content-md-start mb-3">
                    <div className="text-center">
                      <span className="fw-bold d-block">{profilePosts.length}</span>
                      <span className="small text-muted">Posts</span>
                    </div>
                    <div className="text-center">
                      <span className="fw-bold d-block">{profileUser?.friends?.length || 0}</span>
                      <span className="small text-muted">Friends</span>
                    </div>
                  </div>
                </div>
                
                <div className="d-flex gap-2 mt-3 mt-sm-0">
                  {isOwner ? (
                    <Button
                      variant={editing ? "outline-secondary" : "primary"}
                      className="rounded-pill px-4 fw-bold"
                      disabled={isUploading}
                      onClick={() => {
                        if (!editing && profileUser) {
                          setForm({
                            name: profileUser.name || "",
                            bio: profileUser.bio || "",
                            avatarUrl: profileUser.avatarUrl || "",
                            coverUrl: profileUser.coverUrl || "",
                          });
                        }
                        setEditing((prev) => !prev);
                      }}
                    >
                      {editing ? "Cancel" : "Edit Profile"}
                    </Button>
                  ) : (
                    <>
                      {relationship === "friends" && (
                        <div className="d-flex gap-2">
                          <Button 
                            variant="success" 
                            className="rounded-pill px-4 fw-bold" 
                            disabled 
                          >
                            ✓ Friends
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            className="rounded-pill px-4 fw-bold"
                            onClick={handleMessageClick}
                          >
                            Message
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            className="rounded-pill px-4 fw-bold"
                            onClick={() => dispatch(unfriendUser(profileUser._id))}
                          >
                            Unfriend
                          </Button>
                        </div>
                      )}
                      {relationship === "request_sent" && (
                        <Button variant="secondary" className="rounded-pill px-4 fw-bold" disabled>
                          Request Sent
                        </Button>
                      )}
                      {relationship === "request_received" && (
                        <Button 
                          variant="primary" 
                          className="rounded-pill px-4 fw-bold"
                          onClick={() => dispatch(acceptFriendRequest(profileUser._id))}
                        >
                          Accept Request
                        </Button>
                      )}
                      {relationship === "none" && (
                        <Button 
                          variant="primary" 
                          className="rounded-pill px-4 fw-bold"
                          onClick={() => dispatch(sendFriendRequest(profileUser._id))}
                        >
                          Add Friend
                        </Button>
                      )}
                      {relationship !== "blocked" && (
                        <Button 
                          variant="outline-dark" 
                          className="rounded-pill px-4 fw-bold"
                          onClick={() => dispatch(blockUser(profileUser._id))}
                        >
                          Block
                        </Button>
                      )}
                      {relationship === "blocked" && (
                        <Button variant="danger" className="rounded-pill px-4 fw-bold" disabled>
                          Blocked
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          <div className="mt-4 mb-2">
            <h5 className="fw-bold small text-uppercase text-muted mb-2">About</h5>
            <p className="lead fs-6">
              {profileUser?.bio || (isOwner ? "Add a bio to express yourself!" : "This user hasn't added a bio yet.")}
            </p>
          </div>

          {isOwner && editing && (
            <Form
              className="mt-4 p-4 border rounded-3 bg-light shadow-sm"
              onSubmit={(e) => {
                e.preventDefault();
                const submit = async () => {
                  try {
                    setIsUploading(true);
                    let avatarUrl = form.avatarUrl;
                    let coverUrl = form.coverUrl;

                    if (avatarFile) {
                      avatarUrl = await uploadImage(avatarFile);
                    }
                    if (coverFile) {
                      coverUrl = await uploadImage(coverFile);
                    }

                    await dispatch(updateMyProfile({ ...form, avatarUrl, coverUrl })).unwrap();
                    setEditing(false);
                    dispatch(fetchProfileByUsername(targetUsername));
                    setAvatarFile(null);
                    setCoverFile(null);
                  } catch (err) {
                    console.error("Upload failed:", err);
                    alert("Failed to update profile. Please try again.");
                  } finally {
                    setIsUploading(false);
                  }
                };
                submit();
              }}
            >
              <h5 className="fw-bold mb-4">Update Profile</h5>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Display Name</Form.Label>
                    <Form.Control
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Avatar URL</Form.Label>
                    <Form.Control
                      value={form.avatarUrl}
                      onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Cover URL</Form.Label>
                    <Form.Control
                      value={form.coverUrl}
                      onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      placeholder="Tell the world about yourself..."
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Change Profile Picture</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Change Cover Photo</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-4 d-grid">
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  className="rounded-pill fw-bold"
                  disabled={isUploading}
                >
                  {isUploading ? "Saving Changes..." : "Save All Changes"}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>

      {/* Profile Content Tabs */}
      <Tab.Container defaultActiveKey="posts">
        <Nav variant="tabs" className="mb-4 border-bottom-0 justify-content-center justify-content-md-start px-2">
          <Nav.Item>
            <Nav.Link eventKey="posts" className="px-4 fw-bold">Posts</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="media" className="px-4 fw-bold">Media</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="posts">
            <Row>
              <Col xs={12} lg={8}>
                {profilePosts.length === 0 ? (
                  <Card className="dashboard-card border-0 shadow-sm text-center py-5">
                    <Card.Body>
                      <h4 className="text-muted">No posts yet</h4>
                      <p className="mb-0">When {isOwner ? 'you share' : `@${profileUser?.username} shares`} posts, they will appear here.</p>
                    </Card.Body>
                  </Card>
                ) : (
                  profilePosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      currentUserId={currentUser?.id || currentUser?._id}
                      onLike={handleLike}
                      onComment={(postId, content) => dispatch(addCommentToPost({ postId, content }))}
                      onDelete={(postId) => dispatch(deletePost(postId))}
                    />
                  ))
                )}
              </Col>
              <Col lg={4} className="d-none d-lg-block">
                <Card className="dashboard-card border-0 shadow-sm">
                  <Card.Body>
                    <h6 className="fw-bold mb-3">You might like</h6>
                    <p className="small text-muted">Discover more people to follow on the Search page.</p>
                    <Button variant="outline-primary" size="sm" className="w-100 rounded-pill">Find People</Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>
          <Tab.Pane eventKey="media">
            <div className="text-center py-5 bg-white rounded shadow-sm">
              <h5 className="text-muted">Media Gallery coming soon!</h5>
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default ProfilePage;
