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
import { fetchConversations } from "../../features/messages/messagesSlice";
import { useRef } from "react";
import { playSound } from "../../utils/soundUtils";

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { conversations } = useSelector((state) => state.messages);
  
  // مرجع لتتبع عدد الإشعارات والرسائل السابقة
  const prevUnreadCount = useRef(unreadCount);
  const prevTotalMessages = useRef(0);

  useEffect(() => {
    if (!user) return;
    
    // جلب البيانات فوراً
    dispatch(fetchNotifications());
    dispatch(fetchConversations());

    // تحديث دوري كل 5 ثواني
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
      dispatch(fetchConversations());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch, user]);

  // مراقبة زيادة عدد الإشعارات لتشغيل الصوت
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current) {
      playSound("notification");
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  // مراقبة الرسائل الجديدة في كل المحادثات
  useEffect(() => {
    if (!conversations) return;
    
    // حساب إجمالي الرسائل غير المقروءة أو آخر رسالة
    const totalUnread = conversations.reduce((acc, conv) => {
      const isLastMine = String(conv.lastMessage?.sender) === String(user?.id || user?._id);
      // لو آخر رسالة مش مني ومنتظر قراءتها (تقريباً)
      return acc + (conv.lastMessage && !isLastMine ? 1 : 0);
    }, 0);

    // إذا زاد عدد المحادثات التي تحتوي على رسائل جديدة
    // ملاحظة: هذا منطق تقريبي لأننا لا نملك حقل unreadCount صريح في الـ conversation حالياً
    // سنعتمد على تغير الـ ID الخاص بآخر رسالة في أي محادثة
    const currentLastMessagesIds = conversations.map(c => c.lastMessage?._id).filter(Boolean).join(',');
    if (prevTotalMessages.current && currentLastMessagesIds !== prevTotalMessages.current) {
      // التأكد أن آخر رسالة في المحادثة المحدثة ليست مني
      const updatedConv = conversations.find(c => c.lastMessage?._id && !prevTotalMessages.current.includes(c.lastMessage._id));
      if (updatedConv && String(updatedConv.lastMessage?.sender) !== String(user?.id || user?._id)) {
        // تشغيل الصوت فقط لو مش في صفحة الرسائل (لأن صفحة الرسائل بتشغل صوتها الخاص)
        if (location.pathname !== '/messages') {
          playSound("message_received");
        }
      }
    }
    prevTotalMessages.current = currentLastMessagesIds;
  }, [conversations, user, location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <Navbar expand="lg" className="dashboard-nav shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-3" style={{ letterSpacing: '-2px' }}>
            Crew
          </Navbar.Brand>
          <Navbar.Toggle className="border-0 shadow-none" />
          <Navbar.Collapse>
            <Nav className="mx-auto gap-lg-2">
              <Nav.Link as={NavLink} to="/" className="px-3 fw-semibold">
                Feed
              </Nav.Link>
              <Nav.Link as={NavLink} to="/profile" className="px-3 fw-semibold">
                Profile
              </Nav.Link>
              <Nav.Link as={NavLink} to="/notifications" className="px-3 fw-semibold position-relative">
                Notifications
                {unreadCount > 0 && (
                  <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle border border-2 border-surface" style={{ fontSize: '0.65rem', padding: '0.35em 0.6em' }}>
                    {unreadCount}
                  </Badge>
                )}
              </Nav.Link>
              <Nav.Link as={NavLink} to="/messages" className="px-3 fw-semibold">
                Messages
              </Nav.Link>
              <Nav.Link as={NavLink} to="/search" className="px-3 fw-semibold">
                Search
              </Nav.Link>
              {user?.role === "admin" && (
                <Nav.Link as={NavLink} to="/admin" className="px-3 fw-semibold text-primary">
                  Dashboard
                </Nav.Link>
              )}
            </Nav>
            <div className="d-flex align-items-center gap-3">
              <div className="user-nav-pill d-none d-xl-flex">
                <img 
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`} 
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
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Container>
    </div>
  );
};

export default AppLayout;
