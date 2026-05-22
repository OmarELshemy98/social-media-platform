/**
 * @file MessagesPage.jsx
 * @description صفحة "المحادثات والرسائل" (The Chat System).
 */

import { useEffect, useMemo, useState, useRef } from "react";
// مكونات React-Bootstrap للتنسيق.
import { Button, Card, Col, Form, Row, Spinner, Modal, Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// استيراد أوامر إدارة الرسائل.
import { 
  fetchConversationMessages, 
  fetchConversations, 
  sendMessage, 
  updateMessage,
  deleteMessage,
  setActiveConversation,
  startConversationWithUser
} from "../features/messages/messagesSlice";
import { uploadImage } from "../services/uploadService";

const MessagesPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const usernameParam = searchParams.get("username");

  // States محلية لكتابة رسالة جديدة أو بدء شات جديد.
  const [draft, setDraft] = useState("");
  const [newChatUsername, setNewChatUsername] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Recording States
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // States للتعديل والمسح
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // State للتحكم في تشغيل الصوت
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioPlayerRef = useRef(new Audio());
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const timerRef = useRef(null);

  // سحب البيانات من مخزن الرسائل والمصادقة.
  const { conversations, messages, activeConversationId } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

  // لتشغيل صوت الإشعارات
  const playMessageSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
    audio.play().catch(e => console.log("Audio play failed:", e));
  };

  // أول ما الصفحة تفتح بنجيب كل المحادثات اللي اليوزر مشترك فيها.
  useEffect(() => {
    dispatch(fetchConversations());

    // لو جاي من بروفايل يوزر معين، بنبدأ محادثة معاه فوراً
    if (usernameParam) {
      dispatch(startConversationWithUser(usernameParam)).then((res) => {
        if (res.payload?._id) {
          dispatch(fetchConversationMessages(res.payload._id));
        }
      });
    }
  }, [dispatch, usernameParam]);

  // مراقبة الرسايل الجديدة لتشغيل الصوت
  const lastMessageCountRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      // لو الرسالة جاية من حد تاني مش مني
      if (lastMsg && String(lastMsg.sender?._id) !== String(user.id || user._id)) {
        playMessageSound();
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, user.id, user._id]);

  // لو اليوزر فاتح محادثة معينة، بنعمل Polling (تحديث تلقائي) كل 8 ثواني عشان نجيب الرسايل الجديدة.
  useEffect(() => {
    if (!activeConversationId || !user) return;

    const interval = setInterval(() => {
      dispatch(fetchConversationMessages(activeConversationId));
    }, 8000);

    return () => clearInterval(interval);
  }, [dispatch, activeConversationId, user]);

  // بنحسب بيانات المحادثة النشطة والشخص التاني اللي بنكلمه.
  const activeConversation = useMemo(
    () => conversations.find((item) => item._id === activeConversationId),
    [conversations, activeConversationId]
  );
  const otherParticipant = useMemo(() => {
    if (!activeConversation || !user) return null;
    return activeConversation.participants?.find(
      (p) => String(p._id) !== String(user.id || user._id)
    );
  }, [activeConversation, user]);

  // --- Recording Logic ---
  
  const startAudioRecording = async () => {
    try {
      console.log("Starting audio recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // تجربة كل أنواع الميديا الممكنة لضمان التوافق
      const types = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
      let mimeType = '';
      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      if (!mimeType) {
        throw new Error("No supported audio mime types found in this browser");
      }
      
      console.log("Using mimeType:", mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("Recording stopped, chunks:", audioChunksRef.current.length);
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log("Blob size:", audioBlob.size);
        
        const extension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
        const file = new File([audioBlob], `recording.${extension}`, { type: mimeType });
        
        if (file.size > 100) { // التأكد إن الملف فيه بيانات حقيقية مش مجرد Header فاضي
          handleFileUpload(file, "audio");
        } else {
          console.error("Recording file is too small or empty");
          alert("Recording failed: The file is empty. Please try again.");
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // التقاط البيانات كل ثانية لضمان عدم ضياعها
      setIsRecordingAudio(true);
      startTimer();
    } catch (err) {
      console.error("Microphone error:", err);
      alert(`Microphone error: ${err.message}`);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingAudio(false);
    stopTimer();
  };

  const startVideoRecording = async () => {
    try {
      console.log("Starting video recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setVideoStream(stream);
      setShowVideoModal(true);
      
      const mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
      console.log("Using video mimeType:", mimeType);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("Video recording stopped...");
        const videoBlob = new Blob(videoChunksRef.current, { type: mimeType });
        const extension = mimeType.split('/')[1].split(';')[0];
        const file = new File([videoBlob], `video_msg.${extension}`, { type: mimeType });
        
        if (file.size > 0) {
          handleFileUpload(file, "video");
        }
        
        stream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
        setShowVideoModal(false);
      };

      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
      mediaRecorder.start();
      setIsRecordingVideo(true);
      startTimer();
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera/Microphone access denied or not available");
    }
  };

  const stopVideoRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecordingVideo(false);
    stopTimer();
  };

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setRecordingTime(0);
  };

  const toggleAudio = (messageId, url) => {
    if (playingAudioId === messageId) {
      audioPlayerRef.current.pause();
      setPlayingAudioId(null);
    } else {
      audioPlayerRef.current.src = url;
      audioPlayerRef.current.play();
      setPlayingAudioId(messageId);
      
      audioPlayerRef.current.onended = () => {
        setPlayingAudioId(null);
      };
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (file, forcedType = null) => {
    if (!file || !otherParticipant?._id) return;
    setIsUploading(true);
    console.log("Attempting to upload file:", file.name, "size:", file.size);
    
    try {
      const url = await uploadImage(file);
      console.log("File uploaded successfully, URL:", url);
      
      let type = forcedType;
      if (!type) {
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';
        else type = 'file';
      }

      dispatch(sendMessage({ 
        receiverId: otherParticipant._id, 
        messageType: type, 
        mediaUrl: url,
        fileName: file.name
      }));
    } catch (err) {
      console.error("Upload error details:", err);
      alert(`Failed to upload file: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Row className="g-3">
      <Col xs={12} md={4} className={activeConversationId ? "d-none d-md-block" : ""}>
        <Card className="dashboard-card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '1.5rem' }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-800 mb-0">Conversations</h5>
              <Button 
                variant="primary" 
                size="sm" 
                className="rounded-circle shadow-sm"
                style={{ width: '32px', height: '32px', padding: 0 }}
                onClick={() => setShowNewChat(!showNewChat)}
              >
                +
              </Button>
            </div>

            {showNewChat && (
              <Form 
                className="mb-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (newChatUsername.trim()) {
                    await dispatch(startConversationWithUser(newChatUsername.trim()));
                    setNewChatUsername("");
                    setShowNewChat(false);
                  }
                }}
              >
                <div className="d-flex gap-2 p-2 bg-light rounded-pill">
                  <Form.Control 
                    className="border-0 bg-transparent shadow-none px-3"
                    placeholder="Username..."
                    value={newChatUsername}
                    onChange={(e) => setNewChatUsername(e.target.value)}
                  />
                  <Button type="submit" size="sm" variant="primary" className="rounded-pill px-3">Go</Button>
                </div>
              </Form>
            )}

                    <div className="conversations-list overflow-auto" style={{ maxHeight: '70vh' }}>
              {conversations.length === 0 ? (
                <div className="text-center py-5">
                  <div className="fs-1 mb-2">💬</div>
                  <p className="text-muted small">No conversations yet.</p>
                </div>
              ) : (
                conversations.map((c) => {
                    // تحسين منطق البحث عن الطرف الآخر لتجنب الـ unknown
                    const currentId = String(user?.id || user?._id);
                    const other = c.participants?.find(p => String(p?._id) !== currentId) || { username: "User", name: "User" };
                    
                    return (
                      <Button
                        key={c._id}
                        variant={activeConversationId === c._id ? "primary" : "white"}
                        className={`w-100 mb-2 text-start p-3 border-0 d-flex align-items-center gap-3 transition ${activeConversationId === c._id ? "shadow-lg" : "hover-bg"}`}
                        style={{ borderRadius: '1rem' }}
                        onClick={() => {
                          dispatch(setActiveConversation(c._id));
                          dispatch(fetchConversationMessages(c._id));
                        }}
                      >
                        <img 
                          src={other?.avatarUrl || `https://ui-avatars.com/api/?name=${other?.username || 'User'}&background=random`} 
                          className="rounded-circle border" 
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                        />
                        <div className="overflow-hidden">
                          <div className={`fw-bold mb-0 ${activeConversationId === c._id ? "text-white" : "text-dark"}`}>
                            @{other?.username || "Guest User"}
                          </div>
                          <div className={`small text-truncate ${activeConversationId === c._id ? "text-white-50" : "text-muted"}`}>
                            Click to chat
                          </div>
                        </div>
                      </Button>
                    );
                  })
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col xs={12} md={8} className={!activeConversationId ? "d-none d-md-block" : ""}>
        <Card className="dashboard-card h-100 border-0 shadow-sm" style={{ borderRadius: '1.5rem' }}>
          <Card.Body className="d-flex flex-column p-0" style={{ minHeight: '75vh' }}>
            {/* Chat Header */}
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-surface" style={{ borderRadius: '1.5rem 1.5rem 0 0' }}>
              <div className="d-flex align-items-center gap-3">
                <Button 
                  variant="link" 
                  className="d-md-none p-0 text-decoration-none text-dark"
                  onClick={() => dispatch(setActiveConversation(null))}
                >
                  ←
                </Button>
                {otherParticipant && (
                  <div className="d-flex align-items-center gap-2">
                    <img 
                      src={otherParticipant.avatarUrl || `https://ui-avatars.com/api/?name=${otherParticipant.username}&background=random`} 
                      className="rounded-circle border" 
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }} 
                    />
                    <h6 className="mb-0 fw-800">@{otherParticipant.username}</h6>
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="messages-box flex-grow-1 p-4 overflow-auto" style={{ maxHeight: '60vh' }}>
              {!activeConversationId ? (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                  <div className="fs-1 mb-3">✉️</div>
                  <h6 className="fw-bold">Your Messages</h6>
                  <p className="small">Select a conversation to start chatting</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((message) => {
                    const isMine = String(message.sender?._id) === String(user.id || user._id);
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        key={message._id}
                        className={`chat-bubble-row mb-3 ${isMine ? "chat-bubble-row--mine" : ""}`}
                      >
                        <div className={`chat-bubble ${isMine ? "chat-bubble--mine" : "chat-bubble--other"} p-3 shadow-sm group`}>
                          {/* خيارات التعديل والمسح (تظهر فقط لو بتاعتي ومعملش seen) */}
                          {isMine && !message.isRead && (
                            <div className="message-actions position-absolute top-0 start-0 translate-middle-x mt-1 ms-1">
                              <Dropdown drop="start">
                                <Dropdown.Toggle variant="link" className="p-1 text-white shadow-none no-caret small opacity-50 hover-opacity-100 bg-dark bg-opacity-25 rounded-circle" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  ⋮
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="border-0 shadow-lg py-1 rounded-3" style={{ minWidth: '80px' }}>
                                  {message.messageType === "text" && (
                                    <Dropdown.Item 
                                      onClick={() => {
                                        setEditingMessageId(message._id);
                                        setEditContent(message.content);
                                      }}
                                      className="small py-1"
                                    >
                                      Edit
                                    </Dropdown.Item>
                                  )}
                                  <Dropdown.Item 
                                    onClick={() => {
                                      if(window.confirm("Delete message for everyone?")) {
                                        dispatch(deleteMessage(message._id));
                                      }
                                    }}
                                    className="small py-1 text-danger"
                                  >
                                    Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          )}

                          {/* Content based on type */}
                          {editingMessageId === message._id ? (
                            <div className="edit-mode d-flex flex-column gap-2">
                              <Form.Control 
                                size="sm" 
                                className="rounded-3 border-0 bg-white bg-opacity-25 text-white" 
                                value={editContent} 
                                onChange={(e) => setEditContent(e.target.value)}
                                autoFocus
                              />
                              <div className="d-flex gap-2 justify-content-end">
                                <Button size="xs" variant="link" className="text-white p-0 small text-decoration-none" onClick={() => setEditingMessageId(null)}>Cancel</Button>
                                <Button size="xs" variant="light" className="rounded-pill px-2 py-0 small fw-bold" onClick={() => {
                                  dispatch(updateMessage({ messageId: message._id, content: editContent }));
                                  setEditingMessageId(null);
                                }}>Save</Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {message.messageType === "text" && (
                                <div className="chat-content">
                                  {message.content}
                                  {message.isEdited && <span className="ms-2 opacity-50" style={{ fontSize: '0.6rem' }}>(edited)</span>}
                                </div>
                              )}
                              
                              {message.messageType === "image" && (
                                <img 
                                  src={message.mediaUrl} 
                                  className="rounded-3 w-100 mb-2 shadow-sm" 
                                  style={{ maxWidth: '300px', cursor: 'pointer' }}
                                  onClick={() => window.open(message.mediaUrl, '_blank')}
                                />
                              )}
                              
                              {message.messageType === "video" && (
                                <video 
                                  src={message.mediaUrl} 
                                  controls 
                                  className="rounded-3 w-100 mb-2 shadow-sm"
                                  style={{ maxWidth: '300px' }}
                                />
                              )}
                              
                              {message.messageType === "audio" && (
                                <div 
                                  className={`audio-message-wrapper d-flex align-items-center gap-3 cursor-pointer ${playingAudioId === message._id ? 'is-playing' : ''}`} 
                                  onClick={() => toggleAudio(message._id, message.mediaUrl)}
                                  style={{ minWidth: '180px', padding: '5px 0' }}
                                >
                                  <div className={`play-btn-circle ${playingAudioId === message._id ? 'playing' : ''}`}>
                                    {playingAudioId === message._id ? '⏸' : '▶'}
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="audio-wave-sim">
                                      <span></span><span></span><span></span><span></span><span></span>
                                    </div>
                                    <div className="x-small opacity-75 mt-1">Voice Message</div>
                                  </div>
                                </div>
                              )}
                              
                              {message.messageType === "file" && (
                                <a 
                                  href={message.mediaUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="d-flex align-items-center gap-2 p-2 bg-white bg-opacity-10 rounded text-decoration-none text-current"
                                >
                                  <span className="fs-4">📄</span>
                                  <div className="overflow-hidden">
                                    <div className="small fw-bold text-truncate">{message.fileName || "Download File"}</div>
                                    <div className="x-small opacity-75">Click to download</div>
                                  </div>
                                </a>
                              )}
                            </>
                          )}
                          
                          <div className={`d-flex justify-content-between align-items-center mt-3 opacity-75 ${isMine ? 'border-top border-white border-opacity-10' : 'border-top border-dark border-opacity-10'}`} style={{ fontSize: '0.65rem', paddingTop: '5px' }}>
                            <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMine && (
                              <span className={`ms-2 ${message.isRead ? "text-info fw-bold" : ""}`}>
                                {message.isRead ? "Seen ✓✓" : "Sent ✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              {isUploading && (
                <div className="text-center py-2">
                  <Spinner animation="grow" size="sm" variant="primary" />
                  <span className="small text-muted ms-2">Sending media...</span>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            {activeConversationId && (
              <div className="p-3 bg-surface border-top" style={{ borderRadius: '0 0 1.5rem 1.5rem' }}>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // لو بنسجل صوت، زرار الصاروخ هيوقف التسجيل ويبعت
                    if (isRecordingAudio) {
                      stopAudioRecording();
                      return;
                    }
                    if (!draft.trim() || !otherParticipant?._id) return;
                    dispatch(sendMessage({ receiverId: otherParticipant._id, content: draft.trim(), messageType: "text" }));
                    setDraft("");
                  }}
                >
                  <div className="d-flex align-items-center gap-2 bg-light p-2 rounded-pill shadow-inner">
                    <Dropdown drop="up">
                      <Dropdown.Toggle variant="link" className="p-0 text-decoration-none fs-4 shadow-none no-caret mx-2">
                        📎
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="border-0 shadow-lg p-2 rounded-4">
                        <Dropdown.Item onClick={() => fileInputRef.current.click()} className="rounded-3 py-2">
                          🖼️ Image / 📁 File
                        </Dropdown.Item>
                        <Dropdown.Item onClick={startVideoRecording} className="rounded-3 py-2">
                          📹 Video Record
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>

                    <input 
                      type="file" 
                      hidden 
                      ref={fileInputRef} 
                      onChange={(e) => handleFileUpload(e.target.files[0])} 
                    />

                    {isRecordingAudio ? (
                      <div className="d-flex align-items-center gap-2 px-3 text-danger fw-bold animate-pulse flex-grow-1 bg-light rounded-pill py-2">
                        <span className="recording-dot"></span>
                        <span className="small">Recording... {formatTime(recordingTime)}</span>
                        <Button variant="danger" size="sm" className="rounded-circle ms-auto" onClick={stopAudioRecording} title="Stop and Send">
                          ⏹️
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Form.Control 
                          value={draft} 
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="Type a message..."
                          className="border-0 bg-transparent shadow-none"
                        />
                        <Button variant="link" className="p-0 text-decoration-none fs-4 shadow-none me-2" onClick={startAudioRecording} title="Record Audio">
                          🎙️
                        </Button>
                      </>
                    )}

                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px', padding: 0 }}
                      disabled={(!draft.trim() && !isRecordingAudio) || isUploading}
                    >
                      {isUploading ? <Spinner animation="border" size="sm" /> : "🚀"}
                    </Button>
                  </div>
                </Form>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Video Recording Modal */}
      <Modal show={showVideoModal} onHide={stopVideoRecording} centered size="lg" contentClassName="bg-dark text-white rounded-5 overflow-hidden border-0">
        <Modal.Body className="p-0 position-relative">
          <video ref={videoPreviewRef} autoPlay muted className="w-100 h-100" style={{ minHeight: '400px', objectFit: 'cover' }} />
          <div className="position-absolute bottom-0 start-0 end-0 p-4 text-center bg-gradient-to-t from-black">
            <h5 className="mb-3 fw-bold text-danger">Recording Video... {formatTime(recordingTime)}</h5>
            <Button variant="danger" size="lg" className="rounded-circle px-4 py-3 shadow-lg" onClick={stopVideoRecording}>
              Stop & Send 📹
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .chat-bubble-row { display: flex; width: 100%; }
        .chat-bubble-row--mine { justify-content: flex-end; }
        .chat-bubble { max-width: 80%; border-radius: 1.5rem; position: relative; }
        .chat-bubble--mine { background: var(--primary); color: white; border-bottom-right-radius: 0.3rem; }
        .chat-bubble--other { background: var(--bg); border: 1px solid var(--border); border-bottom-left-radius: 0.3rem; }
        .hover-bg:hover { background: var(--accent); }
        .no-caret::after { display: none; }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .recording-dot {
          width: 10px;
          height: 10px;
          background: red;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 10px red;
        }
        .message-actions {
          z-index: 10;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .chat-bubble:hover .message-actions {
          opacity: 1;
        }
        .hover-opacity-100:hover {
          opacity: 1 !important;
        }
        .play-btn-circle {
          width: 35px;
          height: 35px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: all 0.2s ease;
        }
        .play-btn-circle.playing {
          background: white;
          color: var(--primary);
        }
        .audio-wave-sim {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 15px;
        }
        .audio-wave-sim span {
          width: 3px;
          height: 100%;
          background: rgba(255,255,255,0.4);
          border-radius: 2px;
        }
        .is-playing .audio-wave-sim span {
          animation: wave 1s infinite ease-in-out;
          background: white;
        }
        @keyframes wave {
          0%, 100% { height: 5px; }
          50% { height: 15px; }
        }
        .audio-wave-sim span:nth-child(2) { animation-delay: 0.1s; }
        .audio-wave-sim span:nth-child(3) { animation-delay: 0.2s; }
        .audio-wave-sim span:nth-child(4) { animation-delay: 0.3s; }
        .audio-wave-sim span:nth-child(5) { animation-delay: 0.4s; }
      `}</style>
    </Row>
  );
};

export default MessagesPage;
