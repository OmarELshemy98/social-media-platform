/**
 * @file StoriesSection.jsx
 * @description مكون عرض الستوريز في أعلى الصفحة.
 */

import { useEffect, useState } from "react";
import { Button, Card, Modal, Form, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchStories, createStory, viewStory } from "../../features/stories/storiesSlice";
import { uploadImage } from "../../services/uploadService";

const StoriesSection = () => {
  const dispatch = useDispatch();
  const { stories } = useSelector((state) => state.stories);
  const { user } = useSelector((state) => state.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchStories());
    }
  }, [dispatch, user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      await dispatch(createStory({ mediaUrl: url, mediaType: file.type.startsWith("video") ? "video" : "image" }));
      setShowAddModal(false);
    } catch (err) {
      console.error("Story upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const openStory = (story) => {
    setSelectedStory(story);
    setShowViewModal(true);
    dispatch(viewStory(story._id));
  };

  return (
    <div className="stories-section mb-4">
      <div className="d-flex gap-3 overflow-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {/* Add Story Button */}
        <div 
          className="story-item text-center flex-shrink-0" 
          style={{ width: '80px', cursor: 'pointer' }}
          onClick={() => setShowAddModal(true)}
        >
          <div 
            className="rounded-circle border border-primary p-1 mb-1 d-flex align-items-center justify-content-center"
            style={{ width: '80px', height: '80px', background: 'rgba(13, 110, 253, 0.1)' }}
          >
            <span className="fs-1 text-primary">+</span>
          </div>
          <span className="small fw-bold">Add Story</span>
        </div>

        {/* Story List */}
        {stories.map((story) => (
          <div 
            key={story._id} 
            className="story-item text-center flex-shrink-0" 
            style={{ width: '80px', cursor: 'pointer' }}
            onClick={() => openStory(story)}
          >
            <div 
              className="rounded-circle border border-primary p-1 mb-1"
              style={{ width: '80px', height: '80px' }}
            >
              <img 
                src={story.user?.avatarUrl || "https://via.placeholder.com/80"} 
                alt="story"
                className="rounded-circle w-100 h-100 object-fit-cover"
              />
            </div>
            <span className="small text-truncate d-block">@{story.user?.username}</span>
          </div>
        ))}
      </div>

      {/* Add Story Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Story</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <Form.Group>
            <Form.Label className="btn btn-primary px-5 py-3 rounded-pill fw-bold">
              {isUploading ? <Spinner size="sm" /> : "Choose Photo or Video"}
              <Form.Control 
                type="file" 
                className="d-none" 
                onChange={handleFileUpload}
                disabled={isUploading}
                accept="image/*,video/*"
              />
            </Form.Label>
          </Form.Group>
          <p className="text-muted small mt-3">Stories disappear after 24 hours.</p>
        </Modal.Body>
      </Modal>

      {/* View Story Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="md" className="story-view-modal">
        <Modal.Body className="p-0 bg-dark rounded overflow-hidden position-relative">
          <Button 
            variant="link" 
            className="position-absolute top-0 end-0 text-white fs-4 p-3 z-3"
            onClick={() => setShowViewModal(false)}
          >✕</Button>
          
          <div className="story-header position-absolute top-0 start-0 w-100 p-3 z-2 d-flex align-items-center gap-2" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
            <img src={selectedStory?.user?.avatarUrl || "https://via.placeholder.com/40"} className="rounded-circle" style={{ width: '40px', height: '40px' }} />
            <span className="text-white fw-bold">@{selectedStory?.user?.username}</span>
          </div>

          {selectedStory?.mediaType === "video" ? (
            <video src={selectedStory.mediaUrl} controls autoPlay className="w-100" style={{ maxHeight: '80vh' }} />
          ) : (
            <img src={selectedStory?.mediaUrl} className="w-100 h-100 object-fit-contain" style={{ maxHeight: '80vh' }} />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StoriesSection;
