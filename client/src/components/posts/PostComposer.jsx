import { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";

const PostComposer = ({ onCreate }) => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    onCreate({
      content: content.trim(),
      tags: tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    setContent("");
    setTags("");
  };

  return (
    <Card className="dashboard-card">
      <Card.Body>
        <Form onSubmit={submit}>
          <Form.Group className="mb-2">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Control
              placeholder="Tags separated by comma (react,nodejs)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </Form.Group>
          <Button type="submit">Publish</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PostComposer;
