/**
 * @file AppLayout.jsx
 * @description الفايل ده هو "الهيكل الأساسي" للموقع (The Shell).
 * ده اللي فيه الـ Navbar اللي ثابت فوق في كل الصفحات، وفيه الزراير اللي بنتنقل بيها.
 * كمان بيعمل تحديث تلقائي للإشعارات كل 15 ثانية عشان اليوزر يجيله تنبيهات أول بأول.
 * والـ Outlet اللي تحت ده هو المكان اللي "الصفحات المتغيرة" بتظهر فيه.
 */

import { useEffect } from "react";
import { Badge, Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../features/auth/authSlice";
import { toggleTheme } from "../../features/theme/themeSlice";
import { fetchNotifications } from "../../features/notifications/notificationsSlice";

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const { unreadCount } = useSelector((state) => state.notifications);

  // لتشغيل صوت الإشعارات
  const playNotificationSound = () => {
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => {
        // غالباً بيفشل لو اليوزر لسه معملش أي حركة في الموقع (Browser Policy)
        console.log("Audio play blocked by browser. Wait for user interaction.");
      });
    } catch (err) {
      console.error("Audio error:", err);
    }
  };

  useEffect(() => {
    if (!user) return; // لا نطلب إشعارات لو اليوزر مش مسجل
    
    dispatch(fetchNotifications());
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 15000);
    return () => clearInterval(interval);
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <Navbar expand="lg" className="dashboard-nav shadow-sm border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-3" style={{ letterSpacing: '-1px' }}>
            SocialSphere
          </Navbar.Brand>
          <Navbar.Toggle className="border-0 shadow-none" />
          <Navbar.Collapse>
            <Nav className="mx-auto gap-lg-2">
              <Nav.Link as={NavLink} to="/" className="px-3 rounded-pill fw-semibold">
                Feed
              </Nav.Link>
              <Nav.Link as={NavLink} to="/profile" className="px-3 rounded-pill fw-semibold">
                Profile
              </Nav.Link>
              <Nav.Link as={NavLink} to="/notifications" className="px-3 rounded-pill fw-semibold position-relative">
                Notifications
                {unreadCount > 0 && (
                  <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle border border-2 border-surface" style={{ fontSize: '0.65rem', padding: '0.35em 0.6em' }}>
                    {unreadCount}
                  </Badge>
                )}
              </Nav.Link>
              <Nav.Link as={NavLink} to="/messages" className="px-3 rounded-pill fw-semibold">
                Messages
              </Nav.Link>
            </Nav>
            <div className="d-flex align-items-center gap-3">
              <div className="user-nav-pill d-none d-xl-flex">
                <img 
                  src={user?.avatarUrl || "https://via.placeholder.com/32"} 
                  className="rounded-circle" 
                  style={{ width: '32px', height: '32px', objectFit: 'cover' }} 
                />
                <span className="small fw-bold">{user?.name}</span>
              </div>
              <Button 
                variant={mode === "light" ? "white" : "dark"} 
                size="sm" 
                className="rounded-circle border shadow-sm p-0 d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
                onClick={() => dispatch(toggleTheme())}
              >
                {mode === "light" ? "🌙" : "☀️"}
              </Button>
              <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="py-4">
        <Outlet />
      </Container>
    </div>
  );
};

export default AppLayout;
