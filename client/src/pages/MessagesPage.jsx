import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversationMessages,
  fetchConversations,
  sendMessage,
  setActiveConversation,
} from "../features/messages/messagesSlice";

const MessagesPage = () => {
  const dispatch = useDispatch();
  const [draft, setDraft] = useState("");
  const { conversations, messages, activeConversationId } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (!activeConversationId) return undefined;
    const interval = setInterval(() => {
      dispatch(fetchConversationMessages(activeConversationId));
    }, 8000);
    return () => clearInterval(interval);
  }, [dispatch, activeConversationId]);

  const activeConversation = useMemo(
    () => conversations.find((item) => item._id === activeConversationId),
    [conversations, activeConversationId]
  );
  const otherParticipant = activeConversation?.participants?.find(
    (p) => String(p._id) !== String(user.id || user._id)
  );

  return (
    <Row>
      <Col md={4}>
        <Card className="dashboard-card">
          <Card.Body>
            <h5>Conversations</h5>
            {conversations.map((c) => (
              <Button
                key={c._id}
                variant={activeConversationId === c._id ? "primary" : "light"}
                className="w-100 mb-2 text-start"
                onClick={() => {
                  dispatch(setActiveConversation(c._id));
                  dispatch(fetchConversationMessages(c._id));
                }}
              >
                {c.participants
                  .filter((p) => String(p._id) !== String(user.id || user._id))
                  .map((p) => p.username)
                  .join(", ")}
              </Button>
            ))}
          </Card.Body>
        </Card>
      </Col>
      <Col md={8}>
        <Card className="dashboard-card">
          <Card.Body>
            <h5>Messages</h5>
            <div className="messages-box mb-3">
              {messages.map((message) => (
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
                    <div className="chat-author">@{message.sender?.username}</div>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            {activeConversationId && (
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim() || !otherParticipant?._id) return;
                  dispatch(sendMessage({ receiverId: otherParticipant._id, content: draft.trim() }));
                  setDraft("");
                }}
                className="d-flex gap-2"
              >
                <Form.Control value={draft} onChange={(e) => setDraft(e.target.value)} />
                <Button type="submit">Send</Button>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default MessagesPage;
