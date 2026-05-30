/**
 * @file PostComposer.jsx
 * @description الفايل ده هو "صندوق كتابة البوستات" (Post Creator).
 * هنا بنقدر نكتب بوست جديد، نضيف هاشتاجات، ونرفع صورة.
 * بيستخدم الـ uploadService عشان يرفع الصورة للسيرفر الأول، وبعدين يبعت بيانات البوست كاملة.
 */

import { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { uploadImage } from "../../services/uploadService";
import { playSound } from "../../utils/soundUtils";

const PostComposer = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    let imageUrl = "";
    try {
      if (imageFile) {
        setIsUploading(true);
        imageUrl = await uploadImage(imageFile);
        setIsUploading(false);
      }

      onPostCreated({
        content: content.trim(),
        tags: tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        imageUrl,
      });
      
      playSound("success");
      setShowSuccess(true);
      setContent("");
      setTags("");
      setImageFile(null);
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to post:", err);
      setIsUploading(false);
    }
  };

  return (
    <Card className="dashboard-card border-0 shadow-lg overflow-hidden" style={{ borderRadius: '2rem' }}>
      <Card.Body className="p-4">
        {showSuccess && (
          <div className="alert alert-success border-0 rounded-4 text-center fw-bold animate-pulse mb-3" style={{ background: 'rgba(40, 167, 69, 0.1)', color: '#28a745' }}>
            ✨ Magic! Your post is live now.
          </div>
        )}
        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Share something creative..."
              className="border-0 bg-light rounded-4 px-4 py-3 shadow-none"
              style={{ resize: 'none', fontSize: '1.1rem' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Form.Group>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Form.Control
              placeholder="Tags (art, tech, luxury)"
              className="border-0 bg-light rounded-pill px-4 small shadow-none"
              style={{ flex: 1, minWidth: '150px' }}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <label className="btn btn-light rounded-pill px-4 fw-bold shadow-sm cursor-pointer mb-0">
              <input type="file" hidden accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0])} />
              {imageFile ? "✅ Photo Selected" : "📸 Add Photo"}
            </label>
          </div>
          <Button 
            type="submit" 
            disabled={isUploading || !content.trim()} 
            className="w-100 rounded-pill py-3 fw-900 shadow-lg border-0"
            style={{ background: 'linear-gradient(45deg, var(--bs-primary), #00d2ff)' }}
          >
            {isUploading ? "Magic is happening..." : "Post Now ✨"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PostComposer;
