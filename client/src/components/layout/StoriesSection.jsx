/**
 * @file StoriesSection.jsx
 * @description مكون عرض الستوريز في أعلى الصفحة.
 */

import { useEffect, useState } from "react";
import { Button, Card, Modal, Form, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
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
    <div className="stories-section mb-5">
      <div className="d-flex gap-4 overflow-auto pb-3 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {/* Add Story Button */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="story-item text-center flex-shrink-0" 
          style={{ width: '85px', cursor: 'pointer' }}
          onClick={() => setShowAddModal(true)}
        >
          <div 
            className="rounded-circle luxury-add-story p-1 mb-2 d-flex align-items-center justify-content-center position-relative shadow-lg"
            style={{ width: '85px', height: '85px', background: 'var(--surface)', border: '2px dashed var(--primary)' }}
          >
            <div className="rounded-circle bg-primary bg-opacity-10 w-100 h-100 d-flex align-items-center justify-content-center">
              <span className="fs-1 text-primary fw-light">+</span>
            </div>
            <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle border border-3 border-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: '28px', height: '28px' }}>
              <span className="text-white small">✨</span>
            </div>
          </div>
          <span className="x-small fw-800 text-muted text-uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>Your Story</span>
        </motion.div>

        {/* Story List */}
        {stories.map((story) => (
          <motion.div 
            key={story._id} 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="story-item text-center flex-shrink-0" 
            style={{ width: '85px', cursor: 'pointer' }}
            onClick={() => openStory(story)}
          >
            <div 
              className="rounded-circle luxury-story-ring p-1 mb-2 shadow-lg"
              style={{ width: '85px', height: '85px', background: 'var(--gradient)' }}
            >
              <div className="rounded-circle p-1 bg-white h-100 w-100">
                <img 
                  src={story.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.user?.username || 'User')}&background=random`} 
                  alt="story"
                  className="rounded-circle w-100 h-100 object-fit-cover"
                />
              </div>
            </div>
            <span className="x-small fw-800 text-dark text-truncate d-block" style={{ fontSize: '0.7rem' }}>
              @{story.user?.username}
            </span>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .luxury-story-ring {
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .luxury-story-ring:hover {
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .fw-800 { font-weight: 800; }
        .x-small { font-size: 0.75rem; }
      `}</style>
      
      {/* Add Story Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered contentClassName="rounded-5 border-0 shadow-2xl">
        <Modal.Header closeButton className="border-0 p-4 pb-0">
          <Modal.Title className="fw-900">Create Magic</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-5">
          <div className="mb-4 animate-float">
            <span style={{ fontSize: '4rem' }}>🎬</span>
          </div>
          <h5 className="fw-800 mb-3">Share your moment</h5>
          <p className="text-muted small mb-4">Upload a photo or a short video to let your friends know what's happening!</p>
          
          <Form.Group>
            <Form.Label className="luxury-send-btn px-5 py-3 rounded-pill fw-900 cursor-pointer shadow-lg w-100 d-block">
              {isUploading ? <Spinner size="sm" animation="border" /> : "CHOOSE MEDIA"}
              <Form.Control 
                type="file" 
                accept="image/*,video/*" 
                hidden 
                onChange={handleFileUpload} 
                disabled={isUploading}
              />
            </Form.Label>
          </Form.Group>
        </Modal.Body>
      </Modal>

      {/* Story View Modal */}
      <Modal 
        show={showViewModal} 
        onHide={() => setShowViewModal(false)} 
        centered 
        size="lg"
        contentClassName="bg-black border-0 rounded-5 overflow-hidden shadow-2xl"
      >
        <Modal.Body className="p-0 position-relative" style={{ height: '80vh' }}>
          {selectedStory && (
            <>
              {/* Header Overlay */}
              <div className="position-absolute top-0 start-0 w-100 p-4 d-flex align-items-center gap-3" style={{ zIndex: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
                <img src={selectedStory.user?.avatarUrl || `https://ui-avatars.com/api/?name=${selectedStory.user?.username}`} className="rounded-circle border-2 border-white shadow-sm" width="45" height="45" />
                <div>
                  <h6 className="text-white fw-800 mb-0">@{selectedStory.user?.username}</h6>
                  <small className="text-white opacity-75">{new Date(selectedStory.createdAt).toLocaleTimeString()}</small>
                </div>
                <Button variant="link" className="ms-auto text-white text-decoration-none fs-3 p-0" onClick={() => setShowViewModal(false)}>✕</Button>
              </div>

              {selectedStory.mediaType === "video" ? (
                <video src={selectedStory.mediaUrl} controls autoPlay className="w-100 h-100 object-fit-contain" />
              ) : (
                <img src={selectedStory.mediaUrl} className="w-100 h-100 object-fit-contain" alt="story" />
              )}
              
              {/* Progress Bar (Visual Only) */}
              <div className="position-absolute bottom-0 start-0 w-100 p-1" style={{ zIndex: 10 }}>
                <div className="progress rounded-pill bg-white bg-opacity-20" style={{ height: '4px' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    onAnimationComplete={() => setShowViewModal(false)}
                    className="progress-bar bg-white" 
                  />
                </div>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StoriesSection;
