/**
 * @file NotificationsPage.jsx
 * @description صفحة "الإشعارات".
 * هنا اليوزر بيشوف كل الحاجات اللي حصلت (حد عمل لايك، حد بعت طلب صداقة، إلخ).
 * لما يدوس على أي إشعار، الموقع بيوديه فوراً للمكان الصح (مثلاً للبوست اللي اتعمل عليه لايك).
 */

import { useEffect } from "react";
import { Button, Card, Badge, ListGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../features/notifications/notificationsSlice";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 15000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleNotificationClick = (notification) => {
    // 1. Mark as read
    if (!notification.isRead) {
      dispatch(markNotificationRead(notification._id));
    }

    // 2. Navigate based on type
    switch (notification.type) {
      case "friend_request":
        if (notification.sender?.username) {
          navigate(`/profile/${notification.sender.username}`);
        }
        break;
      case "like":
      case "comment":
        if (notification.post?._id || notification.post) {
          const postId = notification.post?._id || notification.post;
          navigate(`/posts/${postId}`);
        }
        break;
      case "message":
        navigate("/messages");
        break;
      default:
        break;
    }
  };

  return (
    <Card className="dashboard-card border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">
            Notifications 
            {unreadCount > 0 && <Badge bg="danger" pill className="ms-2 small">{unreadCount}</Badge>}
          </h4>
          <Button 
            size="sm" 
            variant="outline-primary" 
            className="rounded-pill px-3"
            onClick={() => dispatch(markAllNotificationsRead())}
          >
            Mark all as read
          </Button>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">You have no notifications yet.</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {notifications.map((n) => (
              <ListGroup.Item 
                key={n._id} 
                className={`py-3 px-0 border-top d-flex align-items-start gap-3 transition cursor-pointer ${!n.isRead ? 'bg-light-primary' : ''}`}
                style={{ cursor: 'pointer', borderLeft: !n.isRead ? '4px solid #0d6efd' : '4px solid transparent' }}
                onClick={() => handleNotificationClick(n)}
              >
                <img 
                  src={n.sender?.avatarUrl || "https://via.placeholder.com/40"} 
                  alt="sender" 
                  className="rounded-circle"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <div className={n.isRead ? "text-muted" : "fw-bold text-dark"}>
                    {n.message}
                  </div>
                  <div className="small text-muted">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                {!n.isRead && (
                  <Badge bg="primary" pill className="mt-1">New</Badge>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default NotificationsPage;
