import { useEffect } from "react";
import { Button, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../features/notifications/notificationsSlice";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <Card className="dashboard-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Notifications ({unreadCount} unread)</h4>
          <Button size="sm" variant="outline-primary" onClick={() => dispatch(markAllNotificationsRead())}>
            Mark all as read
          </Button>
        </div>
        {notifications.map((notification) => (
          <div key={notification._id} className="py-2 border-top d-flex justify-content-between">
            <span className={notification.isRead ? "text-muted" : "fw-semibold"}>{notification.message}</span>
            {!notification.isRead && (
              <Button
                size="sm"
                variant="light"
                onClick={() => dispatch(markNotificationRead(notification._id))}
              >
                Read
              </Button>
            )}
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

export default NotificationsPage;
