/**
 * @file ProfilePage.jsx
 * @description صفحة الملف الشخصي مع معرض الوسائط والتحسينات البصرية.
 */

import { useEffect, useState } from "react";
import { Button, Card, Form, Row, Col, Nav, Tab, Modal, Spinner, Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { 
  fetchProfileByUsername, 
  updateMyProfile,
  unfriendUser,
  sendFriendRequest,
  acceptFriendRequest
} from "../features/profile/profileSlice";
import { 
  sendMessage
} from "../features/messages/messagesSlice";
import { addCommentToPost, deletePost, createPost as createPostAction } from "../features/posts/postsSlice";
import api from "../services/api";
import { uploadImage } from "../services/uploadService";
import PostCard from "../components/posts/PostCard";
import PostComposer from "../components/posts/PostComposer";
import SEO from "../components/layout/SEO";
import { isOnline } from "../utils/timeUtils";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useParams();
  
  const { user: currentUser } = useSelector((state) => state.auth);
  const { profileUser, profilePosts, relationship, mutualFriends } = useSelector((state) => state.profile);
  const { messages } = useSelector((state) => state.messages);
  const mode = useSelector((state) => state.theme?.mode || "light");
  
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    bio: "", 
    avatarUrl: "", 
    coverUrl: "",
    about: { 
      work: "", 
      education: "", 
      location: "", 
      relationship: "",
      city: "",
      governorate: "",
      country: "",
      birthday: "",
      gender: "",
      contactInfo: "",
      links: []
    }
  });
  const [isUploading, setIsUploading] = useState(false);
  
  // Media Gallery States
  const [activeAlbum, setActiveAlbum] = useState("all");
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [newAlbumData, setNewAlbumData] = useState({ name: "", description: "" });

  const targetUsername = username || currentUser?.username;
  const isOwner = targetUsername === currentUser?.username;

  useEffect(() => {
    if (targetUsername) dispatch(fetchProfileByUsername(targetUsername));
  }, [dispatch, targetUsername]);

  useEffect(() => {
    if (profileUser) {
      setForm({
        name: profileUser.name || "",
        bio: profileUser.bio || "",
        avatarUrl: profileUser.avatarUrl || "",
        coverUrl: profileUser.coverUrl || "",
        about: {
          work: profileUser.about?.work || "",
          education: profileUser.about?.education || "",
          location: profileUser.about?.location || "",
          relationship: profileUser.about?.relationship || "",
          city: profileUser.about?.city || "",
          governorate: profileUser.about?.governorate || "",
          country: profileUser.about?.country || "",
          birthday: profileUser.about?.birthday ? new Date(profileUser.about.birthday).toISOString().split('T')[0] : "",
          gender: profileUser.about?.gender || "",
          contactInfo: profileUser.about?.contactInfo || "",
          links: profileUser.about?.links || []
        }
      });
    }
  }, [profileUser]);

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
      
      // تحديث بيانات البروفايل مع إضافة الصورة للألبوم المناسب
      const updatedForm = { 
        ...form, 
        [type]: url 
      };
      
      // لو بنرفع صورة بروفايل أو كفر، بنضيفها في ألبوم خاص في الباك إند (عبر الـ API)
      await api.post("/profiles/me/media", {
        url,
        type: file.type.startsWith("video") ? "video" : "image",
        albumName: type === "avatarUrl" ? "Profile Pictures" : "Cover Photos"
      });

      await dispatch(updateMyProfile(updatedForm));
      setForm(updatedForm);
      
      // جلب البروفايل مرة أخرى لتحديث الألبومات والميديا
      dispatch(fetchProfileByUsername(currentUser.username));
    } catch (err) {
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    try {
      await api.post("/profiles/me/albums", newAlbumData);
      setShowAddAlbum(false);
      setNewAlbumData({ name: "", description: "" });
      dispatch(fetchProfileByUsername(targetUsername));
    } catch (err) {
      alert("Failed to create album");
    }
  };

  const handleAddMediaToAlbum = async (e, albumName) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      await api.post("/profiles/me/media", {
        url,
        type: file.type.startsWith("video") ? "video" : "image",
        albumName
      });
      dispatch(fetchProfileByUsername(targetUsername));
    } catch (err) {
      alert("Failed to add media");
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
      <SEO 
        title={profileUser ? `${profileUser.name} (@${profileUser.username})` : "Profile"} 
        description={profileUser?.bio || `View ${profileUser?.name}'s profile on Crew.`}
        image={profileUser?.avatarUrl}
        schemaType="Person"
        schemaData={profileUser ? {
          "@type": "Person",
          "name": profileUser.name,
          "alternateName": profileUser.username,
          "image": profileUser.avatarUrl,
          "url": `https://crew-socialmedia.up.railway.app/profile/${profileUser.username}`,
          "description": profileUser.bio,
          "knowsLanguage": ["ar", "en"]
        } : {}}
      />
      {/* Profile Header */}
      <Card className="dashboard-card border-0 shadow-2xl overflow-hidden mb-5 p-0 rounded-5 glass-panel">
        {/* Cover Photo */}
        <div className="profile-cover-container position-relative" style={{ height: '350px', background: 'var(--accent)' }}>
          <img 
            src={profileUser?.coverUrl || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"} 
            className="w-100 h-100 object-fit-cover" 
            alt="cover" 
          />
          <div className="position-absolute inset-0 bg-gradient-to-t from-black opacity-30" />
          {isOwner && (
            <label className="glass-btn btn-sm position-absolute bottom-0 end-0 m-4 rounded-pill px-4 py-2 shadow-2xl cursor-pointer">
              <input type="file" hidden onChange={(e) => handleImageUpload(e, 'coverUrl')} disabled={isUploading} />
              {isUploading ? <Spinner size="sm" animation="grow" /> : "✨ Edit Canvas"}
            </label>
          )}
        </div>

        <Card.Body className="p-4 pt-0 position-relative" style={{ background: mode === 'dark' ? 'var(--surface)' : '#fff' }}>
          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-end gap-4" style={{ marginTop: '-85px' }}>
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="profile-avatar-wrapper position-relative"
              style={{ zIndex: 10 }}
            >
              <div className="rounded-circle p-1 bg-gradient shadow-2xl">
                <img 
                  src={form.avatarUrl || profileUser?.avatarUrl || `https://ui-avatars.com/api/?name=${profileUser?.username}&background=random`} 
                  className="rounded-circle border border-4 border-white shadow-lg bg-white" 
                  style={{ width: '180px', height: '180px', objectFit: 'cover' }} 
                />
              </div>
              {isOwner && (
                <label className="luxury-send-btn btn-sm position-absolute bottom-0 end-0 rounded-circle p-2 shadow-2xl d-flex align-items-center justify-content-center border-4 border-white" style={{ width: '45px', height: '45px' }}>
                  <input type="file" hidden onChange={(e) => handleImageUpload(e, 'avatarUrl')} disabled={isUploading} />
                  {isUploading ? <Spinner size="sm" /> : "📸"}
                </label>
              )}
            </motion.div>
            
            <div className="flex-grow-1 mb-md-4 text-center text-md-start pt-3 pt-md-0">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-2">
                <h2 className="fw-900 mb-0 tracking-tight text-gradient">{profileUser?.name}</h2>
                {isOnline(profileUser?.lastActive) && (
                  <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 fw-800" style={{ fontSize: '0.65rem' }}>
                    ● ONLINE
                  </span>
                )}
              </div>
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-3">
                <span className="text-muted fw-800 small tracking-widest text-uppercase">@{profileUser?.username}</span>
                {!isOwner && mutualFriends?.length > 0 && (
                  <span className="badge rounded-pill bg-primary bg-opacity-5 text-primary border border-primary border-opacity-10 px-3 py-2 fw-bold" style={{ fontSize: '0.7rem' }}>
                    {mutualFriends.length} Mutual Connections
                  </span>
                )}
              </div>
              <p className="text-secondary mb-0 max-w-600 fw-medium opacity-75" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                {profileUser?.bio || "Crafting a unique story..."}
              </p>
            </div>

            <div className="mb-md-4 d-flex gap-2 flex-wrap justify-content-center">
              {isOwner ? (
                <Button 
                  variant={editing ? "outline-secondary" : "primary"} 
                  className="rounded-pill px-5 py-3 fw-900 shadow-lg luxury-send-btn border-0"
                  onClick={() => {
                    if (!editing) setForm({ name: profileUser.name, bio: profileUser.bio, avatarUrl: profileUser.avatarUrl, coverUrl: profileUser.coverUrl });
                    setEditing(!editing);
                  }}
                >
                  {editing ? "Cancel" : "Edit Universe"}
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  {relationship === "friends" ? (
                    <Dropdown>
                      <Dropdown.Toggle variant="light" className="rounded-pill px-4 py-3 fw-900 shadow-sm d-flex align-items-center gap-2 border-0 bg-light">
                        <span>✅ Crew</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="rounded-4 border-0 shadow-lg p-2 glass-panel">
                        <Dropdown.Item className="rounded-3 text-danger fw-bold py-2" onClick={() => dispatch(unfriendUser(profileUser._id))}>
                          Leave Crew
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : relationship === "request_sent" ? (
                    <Button variant="secondary" className="rounded-pill px-4 py-3 fw-900 shadow-sm border-0" disabled>
                      Pending Request
                    </Button>
                  ) : relationship === "request_received" ? (
                    <Button variant="success" className="rounded-pill px-4 py-3 fw-900 shadow-sm border-0" onClick={() => dispatch(acceptFriendRequest(profileUser._id))}>
                      Accept to Crew
                    </Button>
                  ) : (
                    <Button variant="primary" className="rounded-pill px-4 py-3 fw-900 shadow-lg luxury-send-btn border-0" onClick={() => dispatch(sendFriendRequest(profileUser._id))}>
                      Connect +
                    </Button>
                  )}
                  <Button variant="outline-primary" className="rounded-pill px-4 py-3 fw-900 border-2" onClick={() => navigate(`/messages?username=${profileUser.username}`)}>
                    Message
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Luxury Stats Bar */}
          <div className="profile-stats-bar mt-5 p-4 rounded-5 d-flex justify-content-around bg-light bg-opacity-50 border border-white border-opacity-20 shadow-inner">
             <div className="text-center px-4">
               <h4 className="fw-900 mb-0 text-gradient">{profilePosts?.length || 0}</h4>
               <small className="text-muted fw-800 text-uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>Moments</small>
             </div>
             <div className="vr opacity-10" />
             <div className="text-center px-4">
               <h4 className="fw-900 mb-0 text-gradient">{profileUser?.friends?.length || 0}</h4>
               <small className="text-muted fw-800 text-uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>Crew</small>
             </div>
             <div className="vr opacity-10" />
             <div className="text-center px-4">
               <h4 className="fw-900 mb-0 text-gradient">{profileUser?.albums?.length || 0}</h4>
               <small className="text-muted fw-800 text-uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>Albums</small>
             </div>
          </div>
        </Card.Body>
      </Card>

          {editing && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-4 border-top pt-4 bg-light p-4 rounded-4">
              <h5 className="fw-bold mb-4">Update Details</h5>
              <Form onSubmit={handleUpdateProfile}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">Full Name</Form.Label>
                      <Form.Control 
                        value={form.name} 
                        onChange={(e) => setForm({ ...form, name: e.target.value })} 
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">Bio</Form.Label>
                      <Form.Control 
                        value={form.bio} 
                        onChange={(e) => setForm({ ...form, bio: e.target.value })} 
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">Work</Form.Label>
                      <Form.Control 
                        value={form.about?.work} 
                        onChange={(e) => setForm({ ...form, about: { ...form.about, work: e.target.value } })} 
                        placeholder="Where do you work?"
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">Relationship</Form.Label>
                      <Form.Select 
                        value={form.about?.relationship} 
                        onChange={(e) => setForm({ ...form, about: { ...form.about, relationship: e.target.value } })}
                        className="rounded-3"
                      >
                        <option value="">Choose...</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="In a relationship">In a relationship</option>
                        <option value="Secret">Secret</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">Birthday</Form.Label>
                      <Form.Control 
                        type="date"
                        value={form.about?.birthday} 
                        onChange={(e) => setForm({ ...form, about: { ...form.about, birthday: e.target.value } })} 
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">City</Form.Label>
                      <Form.Control 
                        value={form.about?.city} 
                        onChange={(e) => setForm({ ...form, about: { ...form.about, city: e.target.value } })} 
                        placeholder="Your city"
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">Governorate</Form.Label>
                      <Form.Control 
                        value={form.about?.governorate} 
                        onChange={(e) => setForm({ ...form, about: { ...form.about, governorate: e.target.value } })} 
                        placeholder="Your governorate"
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">Country</Form.Label>
                      <Form.Control 
                        value={form.about?.country} 
                        onChange={(e) => setForm({ ...form, about: { ...form.about, country: e.target.value } })} 
                        placeholder="Your country"
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">Gender</Form.Label>
                      <Form.Select 
                        value={form.about?.gender} 
                        onChange={(e) => setForm({ ...form, about: { ...form.about, gender: e.target.value } })}
                        className="rounded-3"
                      >
                        <option value="">Choose...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold">Contact Info (Phone/Email)</Form.Label>
                      <Form.Control 
                        value={form.about?.contactInfo} 
                        onChange={(e) => setForm({ ...form, about: { ...form.about, contactInfo: e.target.value } })} 
                        placeholder="e.g., +20 123 456 789"
                        className="rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Label className="small fw-bold">Social Links</Form.Label>
                    {(form.about?.links || []).map((link, idx) => (
                      <div key={idx} className="d-flex gap-2 mb-2">
                        <Form.Control 
                          placeholder="Platform (e.g., Facebook)" 
                          value={link.platform} 
                          onChange={(e) => {
                            const newLinks = [...form.about.links];
                            newLinks[idx] = { ...newLinks[idx], platform: e.target.value };
                            setForm({ ...form, about: { ...form.about, links: newLinks } });
                          }}
                          className="rounded-3"
                        />
                        <Form.Control 
                          placeholder="URL" 
                          value={link.url} 
                          onChange={(e) => {
                            const newLinks = [...form.about.links];
                            newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                            setForm({ ...form, about: { ...form.about, links: newLinks } });
                          }}
                          className="rounded-3"
                        />
                        <Button variant="outline-danger" className="rounded-circle" onClick={() => {
                          const newLinks = form.about.links.filter((_, i) => i !== idx);
                          setForm({ ...form, about: { ...form.about, links: newLinks } });
                        }}>×</Button>
                      </div>
                    ))}
                    <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => {
                      setForm({ ...form, about: { ...form.about, links: [...(form.about.links || []), { platform: "", url: "" }] } });
                    }}>+ Add Link</Button>
                  </Col>
                </Row>
                <div className="d-flex gap-2 justify-content-end mt-3">
                  <Button variant="light" className="rounded-pill px-4" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button variant="primary" type="submit" disabled={isUploading} className="rounded-pill px-4">
                    {isUploading ? <Spinner size="sm" /> : "Save Changes"}
                  </Button>
                </div>
              </Form>
            </motion.div>
          )}

      {/* Profile Content Tabs */}
      <Tab.Container defaultActiveKey="posts">
        <Nav variant="pills" className="justify-content-center gap-2 mb-4">
          <Nav.Item><Nav.Link eventKey="posts" className="rounded-pill px-4 fw-bold">Posts</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="about" className="rounded-pill px-4 fw-bold">About</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="media" className="rounded-pill px-4 fw-bold">Media</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="friends" className="rounded-pill px-4 fw-bold">Friends</Nav.Link></Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="posts">
            <Row className="g-4">
              <Col md={8}>
                {isOwner && (
                  <div className="mb-4">
                    <PostComposer 
                      onPostCreated={(payload) => {
                        dispatch(createPostAction(payload));
                        // إعادة جلب المنشورات للتأكد من ظهور الجديد
                        setTimeout(() => dispatch(fetchProfileByUsername(targetUsername)), 500);
                      }} 
                    />
                  </div>
                )}
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
                    <h6 className="fw-bold mb-3">Intro</h6>
                    <div className="d-flex flex-column gap-3">
                      {profileUser?.about?.work && (
                        <div className="d-flex align-items-center gap-2">
                          <span>💼</span>
                          <span className="small text-muted">Works at {profileUser.about.work}</span>
                        </div>
                      )}
                      {profileUser?.about?.education && (
                        <div className="d-flex align-items-center gap-2">
                          <span>🎓</span>
                          <span className="small text-muted">Studied at {profileUser.about.education}</span>
                        </div>
                      )}
                      <div className="d-flex align-items-center gap-2">
                        <span>📍</span>
                        <span className="small text-muted">
                          From {profileUser?.about?.city || profileUser?.about?.country || "Earth"}
                        </span>
                      </div>
                      {profileUser?.about?.relationship && (
                        <div className="d-flex align-items-center gap-2">
                          <span>❤️</span>
                          <span className="small text-muted">{profileUser.about.relationship}</span>
                        </div>
                      )}
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex gap-2 overflow-auto pb-2" style={{ maxWidth: '70%' }}>
                <Button 
                  variant={activeAlbum === "all" ? "primary" : "outline-primary"} 
                  className="rounded-pill px-3 py-1 small fw-bold"
                  onClick={() => setActiveAlbum("all")}
                >
                  All Media
                </Button>
                {(profileUser?.albums || []).map(album => (
                  <Button 
                    key={album._id}
                    variant={activeAlbum === album.name ? "primary" : "outline-primary"} 
                    className="rounded-pill px-3 py-1 small fw-bold text-nowrap"
                    onClick={() => setActiveAlbum(album.name)}
                  >
                    {album.name}
                  </Button>
                ))}
              </div>
              {isOwner && (
                <Button variant="dark" className="rounded-pill px-3 py-1 small fw-bold" onClick={() => setShowAddAlbum(true)}>
                  + New Album
                </Button>
              )}
            </div>

            <Row className="g-3">
              {/* عرض الميديا حسب الألبوم المختار */}
              {(() => {
                let displayMedia = [];
                if (activeAlbum === "all") {
                  // تجميع كل الميديا من كل الألبومات + البوستات
                  const albumMedia = (profileUser?.albums || []).flatMap(a => a.media.map(m => ({...m, albumName: a.name})));
                  const postMedia = mediaPosts.map(p => ({ url: p.imageUrl, type: "image", createdAt: p.createdAt, isPost: true }));
                  displayMedia = [...albumMedia, ...postMedia].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                } else {
                  const album = profileUser?.albums?.find(a => a.name === activeAlbum);
                  displayMedia = album?.media || [];
                }

                if (displayMedia.length === 0) {
                  return (
                    <Col xs={12}>
                      <div className="text-center py-5 text-muted">
                        <div className="fs-1 mb-2">🖼️</div>
                        <p>No media found in this category.</p>
                        {isOwner && activeAlbum !== "all" && (
                          <label className="btn btn-primary btn-sm rounded-pill px-4 mt-2">
                            <input type="file" hidden onChange={(e) => handleAddMediaToAlbum(e, activeAlbum)} />
                            Upload to {activeAlbum}
                          </label>
                        )}
                      </div>
                    </Col>
                  );
                }

                return displayMedia.map((item, idx) => (
                  <Col key={idx} xs={6} md={4} lg={3}>
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="ratio ratio-1x1 rounded-4 overflow-hidden shadow-sm bg-light group position-relative"
                    >
                      {item.type === "video" ? (
                        <video src={item.url} className="object-fit-cover" />
                      ) : (
                        <img src={item.url} className="object-fit-cover" alt="media" />
                      )}
                      <div className="position-absolute top-0 end-0 p-2 opacity-0 group-hover-opacity-100 transition">
                        <Button variant="glass" size="sm" className="rounded-circle p-1" onClick={() => window.open(item.url, '_blank')}>
                          🔍
                        </Button>
                      </div>
                    </motion.div>
                  </Col>
                ));
              })()}
              
              {isOwner && activeAlbum !== "all" && (
                <Col xs={6} md={4} lg={3}>
                  <label className="ratio ratio-1x1 rounded-4 border-2 border-dashed border-primary d-flex flex-column align-items-center justify-content-center cursor-pointer hover-bg-accent transition">
                    <input type="file" hidden onChange={(e) => handleAddMediaToAlbum(e, activeAlbum)} />
                    <span className="fs-2 text-primary">+</span>
                    <span className="small fw-bold text-primary">Add Media</span>
                  </label>
                </Col>
              )}
            </Row>
          </Tab.Pane>

          <Tab.Pane eventKey="about">
            <Card className="dashboard-card border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-800 mb-0">About @{profileUser?.username}</h5>
                  {isOwner && !editing && (
                    <Button variant="link" className="text-primary fw-bold p-0 text-decoration-none" onClick={() => setEditing(true)}>
                      Edit Details
                    </Button>
                  )}
                </div>
                
                <Row className="g-4">
                  <Col md={6}>
                    <div className="mb-4">
                      <label className="text-muted small fw-bold mb-2 uppercase" style={{ letterSpacing: '1px' }}>Bio</label>
                      <p className="fs-6">{profileUser?.bio || "No bio added yet."}</p>
                    </div>
                    <div className="mb-4">
                      <label className="text-muted small fw-bold mb-2 uppercase" style={{ letterSpacing: '1px' }}>Personal Info</label>
                      <div className="d-flex flex-column gap-2">
                        <p className="fs-6 mb-0">🎂 <b>Birthday:</b> {profileUser?.about?.birthday ? new Date(profileUser.about.birthday).toLocaleDateString() : "Not specified"}</p>
                        <p className="fs-6 mb-0">👤 <b>Gender:</b> {profileUser?.about?.gender || "Not specified"}</p>
                        <p className="fs-6 mb-0">❤️ <b>Relationship:</b> {profileUser?.about?.relationship || "Not specified"}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-muted small fw-bold mb-2 uppercase" style={{ letterSpacing: '1px' }}>Education & Work</label>
                      <div className="d-flex flex-column gap-2">
                        <p className="fs-6 mb-0">🎓 <b>Education:</b> {profileUser?.about?.education || "No education info"}</p>
                        <p className="fs-6 mb-0">💼 <b>Work:</b> {profileUser?.about?.work || "No work info"}</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-4">
                      <label className="text-muted small fw-bold mb-2 uppercase" style={{ letterSpacing: '1px' }}>Location</label>
                      <div className="d-flex flex-column gap-2">
                        <p className="fs-6 mb-0">📍 <b>Country:</b> {profileUser?.about?.country || "Earth"}</p>
                        <p className="fs-6 mb-0">🏙️ <b>Governorate:</b> {profileUser?.about?.governorate || "Not specified"}</p>
                        <p className="fs-6 mb-0">🏘️ <b>City:</b> {profileUser?.about?.city || "Not specified"}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-muted small fw-bold mb-2 uppercase" style={{ letterSpacing: '1px' }}>Contact & Links</label>
                      <div className="d-flex flex-column gap-2">
                        <p className="fs-6 mb-0">📞 <b>Contact:</b> {profileUser?.about?.contactInfo || "No contact info"}</p>
                        {(profileUser?.about?.links || []).length > 0 ? (
                          <div className="d-flex flex-wrap gap-2 mt-1">
                            {profileUser.about.links.map((link, idx) => (
                              <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                                🔗 {link.platform}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="fs-6 text-muted mb-0">No social links added.</p>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="text-muted small fw-bold mb-2 uppercase" style={{ letterSpacing: '1px' }}>Joined</label>
                      <p className="fs-6">📅 {new Date(profileUser?.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="friends">
            <Card className="dashboard-card border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-800 mb-0">Friends</h5>
                  <span className="badge bg-light text-primary rounded-pill px-3">{profileUser?.friends?.length || 0} Total</span>
                </div>
                
                <Row className="g-3">
                  {profileUser?.friends?.length === 0 ? (
                    <Col className="text-center py-5 text-muted">
                      <div className="fs-1 mb-2">👥</div>
                      <p>No friends to show.</p>
                    </Col>
                  ) : (
                    profileUser?.friends?.map(friend => (
                      <Col key={friend._id} md={6} lg={4}>
                        <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-white border hover-shadow-sm transition group">
                          <Link to={`/profile/${friend.username}`}>
                            <img 
                              src={friend.avatarUrl || `https://ui-avatars.com/api/?name=${friend.username}`} 
                              className="rounded-circle object-fit-cover shadow-sm" 
                              style={{ width: '60px', height: '60px' }} 
                            />
                          </Link>
                          <div className="flex-grow-1 overflow-hidden">
                            <Link to={`/profile/${friend.username}`} className="fw-bold text-decoration-none text-dark d-block text-truncate">
                              {friend.name}
                            </Link>
                            <small className="text-muted d-block text-truncate">@{friend.username}</small>
                          </div>
                          
                          <Dropdown align="end">
                            <Dropdown.Toggle variant="light" className="btn-sm rounded-circle p-1 border-0 no-caret">
                              <span className="fs-5">⋮</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="rounded-4 border-0 shadow-lg p-2">
                              <Dropdown.Item className="rounded-3 py-2 px-3 small fw-bold" onClick={() => navigate(`/profile/${friend.username}`)}>
                                👤 View Profile
                              </Dropdown.Item>
                              <Dropdown.Item className="rounded-3 py-2 px-3 small fw-bold" onClick={() => {
                                // Logic to start chat or navigate to messages
                                navigate(`/messages?username=${friend.username}`);
                              }}>
                                💬 Message
                              </Dropdown.Item>
                              {isOwner && (
                                <>
                                  <Dropdown.Divider />
                                  <Dropdown.Item 
                                    className="rounded-3 py-2 px-3 small fw-bold text-danger" 
                                    onClick={() => {
                                      if(window.confirm(`Are you sure you want to unfriend ${friend.name}?`)) {
                                        dispatch(unfriendUser(friend._id));
                                      }
                                    }}
                                  >
                                    👋 Unfriend
                                  </Dropdown.Item>
                                </>
                              )}
                            </Dropdown.Menu>
                          </Dropdown>
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
      {/* Add Album Modal */}
      <Modal show={showAddAlbum} onHide={() => setShowAddAlbum(false)} centered contentClassName="rounded-5 border-0 shadow-lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-800">Create New Album</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-4">
          <Form onSubmit={handleCreateAlbum}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Album Name</Form.Label>
              <Form.Control 
                required
                placeholder="e.g., Summer Trip 2026" 
                className="rounded-4 bg-light border-0 shadow-none py-2"
                value={newAlbumData.name}
                onChange={(e) => setNewAlbumData({ ...newAlbumData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Description (Optional)</Form.Label>
              <Form.Control 
                as="textarea"
                rows={2}
                placeholder="What is this album about?" 
                className="rounded-4 bg-light border-0 shadow-none py-2"
                value={newAlbumData.description}
                onChange={(e) => setNewAlbumData({ ...newAlbumData, description: e.target.value })}
              />
            </Form.Group>
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAddAlbum(false)}>Cancel</Button>
              <Button variant="primary" type="submit" className="rounded-pill px-5 fw-bold">Create Album</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style>{`
        .profile-cover-container img {
          transition: transform 0.8s ease;
        }
        .profile-cover-container:hover img {
          transform: scale(1.05);
        }
        .btn-glass {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
        }
        .btn-glass:hover {
          background: rgba(255, 255, 255, 0.3);
          color: white;
        }
        .group:hover .group-hover-opacity-100 {
          opacity: 1 !important;
        }
        .no-caret::after {
          display: none !important;
        }
        .hover-shadow-sm:hover {
          box-shadow: 0 .125rem .25rem rgba(0,0,0,.075) !important;
        }
        .transition {
          transition: all 0.3s ease;
        }
        .x-small { font-size: 0.7rem; }
        .max-w-500 { max-width: 500px; }
      `}</style>
    </motion.div>
  );
};

export default ProfilePage;
