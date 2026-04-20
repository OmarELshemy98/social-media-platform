import { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { uploadImage } from "../../services/uploadService";

const PostComposer = ({ onCreate }) => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    let imageUrl = "";
    if (imageFile) {
      setIsUploading(true);
      imageUrl = await uploadImage(imageFile);
      setIsUploading(false);
    }

    onCreate({
      content: content.trim(),
      tags: tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      imageUrl,
    });
    setContent("");
    setTags("");
    setImageFile(null);
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
          <Form.Group className="mb-2">
            <Form.Control type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0])} />
          </Form.Group>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Publish"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PostComposer;
