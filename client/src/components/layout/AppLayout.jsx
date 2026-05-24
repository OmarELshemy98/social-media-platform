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
import { useRef, useState } from "react";
import { playSound, stopSound } from "../../utils/soundUtils";
import IncomingCallModal from "../chat/IncomingCallModal";

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { conversations } = useSelector((state) => state.messages);
  
  // Call State
  const [incomingCall, setIncomingCall] = useState(null);

  // مرجع لتتبع المكالمات التي تم عرضها بالفعل
  const handledCallsRef = useRef(new Set());
  const prevUnreadCount = useRef(unreadCount);
  const prevTotalMessages = useRef("");

  useEffect(() => {
    if (!user) return;
    
    // جلب البيانات فوراً
    dispatch(fetchNotifications());
    dispatch(fetchConversations());

    // تحديث دوري كل 4 ثواني (أسرع قليلاً للمكالمات)
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
      dispatch(fetchConversations());
    }, 4000);
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
    if (!conversations || !user) return;

    const currentLastMessagesIds = conversations
      .map(c => c.lastMessage?._id || '')
      .join(',');

    if (prevTotalMessages.current && prevTotalMessages.current !== currentLastMessagesIds) {
      // هناك رسالة جديدة في مكان ما
      const updatedConv = conversations.find(c => 
        c.lastMessage?._id && !prevTotalMessages.current.includes(c.lastMessage._id)
      );

      if (updatedConv && updatedConv.lastMessage) {
        const lastMsg = updatedConv.lastMessage;
        const senderId = lastMsg.sender?._id || lastMsg.sender;
        const isIncoming = String(senderId) !== String(user?.id || user?._id);

        if (isIncoming) {
          if (lastMsg.content?.startsWith('[CALL_INVITE]:')) {
            const [_, roomID, type, callerName] = lastMsg.content.split(':');
            if (!handledCallsRef.current.has(roomID)) {
              setIncomingCall({ roomID, type, callerName, conversationId: updatedConv._id });
              handledCallsRef.current.add(roomID);
            }
          } else if (lastMsg.content?.startsWith('[CALL_END]:')) {
             // لو في مكالمة جارية بنفس الـ roomID، نقفلها
             const roomID = lastMsg.content.split(':')[1];
             if (location.search.includes(`roomID=${roomID}`)) {
                navigate('/messages'); // نرجع لصفحة الرسائل العادية
                playSound('call_end');
             }
             if (incomingCall?.roomID === roomID) {
                setIncomingCall(null);
                stopSound('ringtone');
             }
          } else {
            playSound("message_received");
          }
        }
      }
    }
    prevTotalMessages.current = currentLastMessagesIds;
  }, [conversations, user, location.pathname, navigate, incomingCall]);

  const handleAcceptCall = () => {
    if (incomingCall) {
      const { roomID, type, conversationId } = incomingCall;
      setIncomingCall(null);
      stopSound('ringtone');
      navigate(`/messages?roomID=${roomID}&type=${type}&conversationId=${conversationId}`);
    }
  };

  const handleDeclineCall = () => {
    setIncomingCall(null);
    stopSound('ringtone');
    playSound('call_end');
  };

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

      {/* التنبيه المنبثق للمكالمة الواردة */}
      <AnimatePresence>
        {incomingCall && (
          <IncomingCallModal 
            callData={incomingCall}
            onAccept={handleAcceptCall}
            onDecline={handleDeclineCall}
          />
        )}
      </AnimatePresence>

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
