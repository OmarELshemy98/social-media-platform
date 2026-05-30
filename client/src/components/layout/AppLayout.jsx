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

    // تحديث دوري كل 2 ثانية (أسرع للرسائل والمكالمات)
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
      dispatch(fetchConversations());
    }, 2000);
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

  const handleDeclineCall = async () => {
    if (incomingCall) {
      const { roomID, conversationId } = incomingCall;
      try {
        await api.post('/messages', {
          conversationId,
          content: `[CALL_END]:${roomID}`,
          messageType: 'text'
        });
      } catch (err) {
        console.error("Failed to send decline message:", err);
      }
    }
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
            <Nav className="mx-auto gap-lg-3 nav-luxury-icons">
              <Nav.Link as={NavLink} to="/" className="nav-icon-link" title="Feed">
                <span className="nav-icon">🏠</span>
                <span className="nav-label d-lg-none">Feed</span>
              </Nav.Link>
              <Nav.Link as={NavLink} to="/profile" className="nav-icon-link" title="Profile">
                <span className="nav-icon">👤</span>
                <span className="nav-label d-lg-none">Profile</span>
              </Nav.Link>
              <Nav.Link as={NavLink} to="/notifications" className="nav-icon-link position-relative" title="Notifications">
                <span className="nav-icon">🔔</span>
                {unreadCount > 0 && (
                  <Badge pill bg="danger" className="position-absolute nav-badge">
                    {unreadCount}
                  </Badge>
                )}
                <span className="nav-label d-lg-none">Notifications</span>
              </Nav.Link>
              <Nav.Link as={NavLink} to="/messages" className="nav-icon-link" title="Messages">
                <span className="nav-icon">💬</span>
                <span className="nav-label d-lg-none">Messages</span>
              </Nav.Link>
              <Nav.Link as={NavLink} to="/search" className="nav-icon-link" title="Search">
                <span className="nav-icon">🔍</span>
                <span className="nav-label d-lg-none">Search</span>
              </Nav.Link>
              {user?.role === "admin" && (
                <Nav.Link as={NavLink} to="/admin" className="nav-icon-link admin-link" title="Admin Dashboard">
                  <span className="nav-icon">🛡️</span>
                  <span className="nav-label d-lg-none">Admin</span>
                </Nav.Link>
              )}
            </Nav>
            <div className="d-flex align-items-center gap-3">
              <div 
                className="user-nav-pill d-none d-xl-flex cursor-pointer" 
                onClick={() => navigate(`/profile/${user?.username}`)}
                style={{ cursor: 'pointer' }}
              >
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
      <style>{`
        .dashboard-nav {
          background: ${mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(26, 26, 26, 0.8)'} !important;
          backdrop-filter: blur(15px);
          border-bottom: 1px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'};
          padding: 0.8rem 0;
        }
        .nav-icon-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          border-radius: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: ${mode === 'light' ? '#666' : '#aaa'} !important;
          position: relative;
        }
        .nav-icon {
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-icon-link:hover {
          background: rgba(var(--bs-primary-rgb), 0.1);
          color: var(--bs-primary) !important;
          transform: translateY(-2px);
        }
        .nav-icon-link.active {
          background: var(--bs-primary);
          color: white !important;
          box-shadow: 0 8px 20px rgba(var(--bs-primary-rgb), 0.3);
        }
        .nav-badge {
          top: 5px !important;
          right: 5px !important;
          font-size: 0.6rem !important;
          padding: 0.3em 0.5em !important;
          border: 2px solid ${mode === 'light' ? 'white' : '#1a1a1a'};
          transform: none !important;
        }
        .user-nav-pill {
          background: ${mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'};
          padding: 5px 15px 5px 5px;
          border-radius: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'};
          color: ${mode === 'light' ? '#000' : '#fff'};
        }
        .admin-link.active {
          background: #212529 !important;
          box-shadow: 0 8px 20px rgba(0,0,0,0.2) !important;
        }
        @media (max-width: 991.98px) {
          .nav-icon-link {
            width: 100%;
            justify-content: flex-start;
            height: auto;
            padding: 12px 20px;
            border-radius: 12px;
            margin-bottom: 5px;
          }
          .nav-label {
            margin-left: 15px;
            font-weight: 600;
          }
          .nav-icon-link.active {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
