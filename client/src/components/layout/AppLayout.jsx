/**
 * @file AppLayout.jsx
 * @description الفايل ده هو "الهيكل الأساسي" للموقع (The Shell).
 * ده اللي فيه الـ Navbar اللي ثابت فوق في كل الصفحات، وفيه الزراير اللي بنتنقل بيها.
 * كمان بيعمل تحديث تلقائي للإشعارات كل 15 ثانية عشان اليوزر يجيله تنبيهات أول بأول.
 * والـ Outlet اللي تحت ده هو المكان اللي "الصفحات المتغيرة" بتظهر فيه.
 */

import { useEffect } from "react";
import { Badge, Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { toggleTheme } from "../../features/theme/themeSlice";
import { fetchNotifications } from "../../features/notifications/notificationsSlice";

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const { unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 15000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <Navbar expand="lg" className="dashboard-nav px-3">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            SocialSphere
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/">
                Feed
              </Nav.Link>
              <Nav.Link as={NavLink} to="/profile">
                Profile
              </Nav.Link>
              <Nav.Link as={NavLink} to="/search">
                Search
              </Nav.Link>
              <Nav.Link as={NavLink} to="/notifications">
                Notifications
                {unreadCount > 0 && (
                  <Badge pill bg="danger" className="ms-1">
                    {unreadCount}
                  </Badge>
                )}
              </Nav.Link>
              <Nav.Link as={NavLink} to="/messages">
                Messages
              </Nav.Link>
              <Nav.Link as={NavLink} to="/settings">
                Settings
              </Nav.Link>
            </Nav>
            <div className="d-flex align-items-center gap-2">
              <span className="small">Hi, {user?.name || "User"}</span>
              <Button variant="outline-secondary" size="sm" onClick={() => dispatch(toggleTheme())}>
                {mode === "light" ? "Dark" : "Light"} Mode
              </Button>
              <Button variant="danger" size="sm" onClick={handleLogout}>
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
