/**
 * @file MessagesPage.jsx
 * @description صفحة "المحادثات والرسائل" (The Chat System).
 */

import { useEffect, useMemo, useState } from "react";
// مكونات React-Bootstrap للتنسيق.
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
// استيراد أوامر إدارة الرسائل.
import { 
  fetchConversationMessages, 
  fetchConversations, 
  sendMessage, 
  setActiveConversation,
  startConversationWithUser
} from "../features/messages/messagesSlice";

const MessagesPage = () => {
  const dispatch = useDispatch();
  // States محلية لكتابة رسالة جديدة أو بدء شات جديد.
  const [draft, setDraft] = useState("");
  const [newChatUsername, setNewChatUsername] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  
  // سحب البيانات من مخزن الرسائل والمصادقة.
  const { conversations, messages, activeConversationId } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

  // أول ما الصفحة تفتح بنجيب كل المحادثات اللي اليوزر مشترك فيها.
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // لو اليوزر فاتح محادثة معينة، بنعمل Polling (تحديث تلقائي) كل 8 ثواني عشان نجيب الرسايل الجديدة.
  useEffect(() => {
    if (!activeConversationId) return undefined;
    const interval = setInterval(() => {
      dispatch(fetchConversationMessages(activeConversationId));
    }, 8000);
    return () => clearInterval(interval);
  }, [dispatch, activeConversationId]);

  // بنحسب بيانات المحادثة النشطة والشخص التاني اللي بنكلمه.
  const activeConversation = useMemo(
    () => conversations.find((item) => item._id === activeConversationId),
    [conversations, activeConversationId]
  );
  const otherParticipant = activeConversation?.participants?.find(
    (p) => String(p._id) !== String(user.id || user._id)
  );

  return (
    <Row className="g-3">
      <Col xs={12} md={4} className={activeConversationId ? "d-none d-md-block" : ""}>
        <Card className="dashboard-card h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Conversations</h5>
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="rounded-circle"
                onClick={() => setShowNewChat(!showNewChat)}
              >
                +
              </Button>
            </div>

            {showNewChat && (
              <Form 
                className="mb-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (newChatUsername.trim()) {
                    await dispatch(startConversationWithUser(newChatUsername.trim()));
                    setNewChatUsername("");
                    setShowNewChat(false);
                  }
                }}
              >
                <div className="d-flex gap-2">
                  <Form.Control 
                    size="sm"
                    placeholder="Enter username..."
                    value={newChatUsername}
                    onChange={(e) => setNewChatUsername(e.target.value)}
                  />
                  <Button type="submit" size="sm" variant="primary">Start</Button>
                </div>
              </Form>
            )}

            <div className="conversations-list overflow-auto" style={{ maxHeight: '70vh' }}>
              {conversations.length === 0 ? (
                <p className="text-muted small text-center py-4">No conversations yet.</p>
              ) : (
                conversations.map((c) => (
                  <Button
                    key={c._id}
                    variant={activeConversationId === c._id ? "primary" : "light"}
                    className="w-100 mb-2 text-start p-3 border-0 shadow-sm"
                    onClick={() => {
                      dispatch(setActiveConversation(c._id));
                      dispatch(fetchConversationMessages(c._id));
                    }}
                  >
                    <div className="fw-bold">
                      {c.participants
                        .filter((p) => String(p._id) !== String(user.id || user._id))
                        .map((p) => p.username)
                        .join(", ")}
                    </div>
                    <div className="small text-truncate opacity-75">Click to view messages</div>
                  </Button>
                ))
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={12} md={8} className={!activeConversationId ? "d-none d-md-block" : ""}>
        <Card className="dashboard-card h-100">
          <Card.Body className="d-flex flex-column" style={{ minHeight: '70vh' }}>
            <div className="d-flex align-items-center mb-3">
              <Button 
                variant="link" 
                className="d-md-none p-0 me-2 text-decoration-none"
                onClick={() => dispatch(setActiveConversation(null))}
              >
                ← Back
              </Button>
              <h5 className="mb-0 fw-bold">
                {otherParticipant ? `@${otherParticipant.username}` : "Messages"}
              </h5>
            </div>
            
            <div className="messages-box flex-grow-1 mb-3">
              {!activeConversationId ? (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                  Select a conversation to start chatting
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`chat-bubble-row ${
                      String(message.sender?._id) === String(user.id || user._id)
                        ? "chat-bubble-row--mine"
                        : ""
                    }`}
                  >
                    <div
                      className={`chat-bubble ${
                        String(message.sender?._id) === String(user.id || user._id)
                          ? "chat-bubble--mine"
                          : "chat-bubble--other"
                      }`}
                    >
                      <div className="chat-author small fw-bold mb-1">
                        @{message.sender?.username}
                      </div>
                      <div className="chat-content">{message.content}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {activeConversationId && (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim() || !otherParticipant?._id) return;
                  dispatch(sendMessage({ receiverId: otherParticipant._id, content: draft.trim() }));
                  setDraft("");
                }}
                className="mt-auto"
              >
                <div className="d-flex gap-2">
                  <Form.Control 
                    value={draft} 
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message..."
                    className="py-2 px-3 rounded-pill"
                  />
                  <Button type="submit" variant="primary" className="rounded-circle px-3">
                    <span className="d-none d-sm-inline">Send</span>
                    <span className="d-sm-none">➤</span>
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default MessagesPage;
