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
import { v4 as uuidv4 } from 'uuid';
// استيراد أوامر إدارة الرسائل.
import { 
  fetchConversationMessages, 
  fetchConversations, 
  sendMessage, 
  updateMessage,
  deleteMessage,
  setActiveConversation,
  startConversationWithUser,
  updateConversationSettings,
  toggleMessageBlock,
  createGroup,
  addGroupMembers,
  removeGroupMember,
  promoteToAdmin
} from "../features/messages/messagesSlice";
import { uploadImage } from "../services/uploadService";
import { playSound } from "../utils/soundUtils";
import CallContainer from "../components/chat/CallContainer";
import SEO from "../components/layout/SEO";

const EMOJIS = ["😊", "😂", "❤️", "🔥", "👍", "🙌", "✨", "💯", "😮", "🎉", "🙏", "😎", "🤔", "🥺"];

const MessagesPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const usernameParam = searchParams.get("username");
  const conversationIdParam = searchParams.get("conversationId");

  // States محلية لكتابة رسالة جديدة أو بدء شات جديد.
  const [draft, setDraft] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newChatUsername, setNewChatUsername] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Group States
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]); // {id, name}
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  
  // Call States
  const [activeCall, setActiveCall] = useState(null); // { roomID, type, conversationId }
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

  const addEmoji = (emoji) => {
    setDraft(prev => prev + emoji);
  };

  // Group Creation logic
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState([]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert("Please provide group name and select at least one member.");
      return;
    }
    
    try {
      const participants = selectedUsers.map(u => u._id);
      dispatch(createGroup({ name: groupName.trim(), participants }));
      setShowGroupModal(false);
      setGroupName("");
      setSelectedUsers([]);
    } catch (err) {
      alert("Failed to create group.");
    }
  };

  const searchUsersForGroup = async (query) => {
    setGroupSearchQuery(query);
    if (query.length < 2) {
      setGroupSearchResults([]);
      return;
    }
    try {
      const { data } = await api.get(`/search?q=${query}&type=users`);
      setGroupSearchResults(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const toggleUserSelection = (userObj) => {
    if (selectedUsers.find(u => u._id === userObj._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== userObj._id));
    } else {
      setSelectedUsers([...selectedUsers, userObj]);
    }
  };

  // سحب البيانات من مخزن الرسائل والمصادقة.
  const { conversations, messages, activeConversationId } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

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

  useEffect(() => {
    const roomID = searchParams.get("roomID");
    const type = searchParams.get("type");
    const conversationId = searchParams.get("conversationId");
    if (roomID && type) {
      setActiveCall({ roomID, type, conversationId });
      // تنظيف الروابط بعد الاستخدام
      window.history.replaceState({}, '', '/messages');
    }
  }, [searchParams]);

  // مراقبة الرسايل الجديدة لتشغيل الصوت وإغلاق المكالمة
  const lastMessageCountRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      const isMine = String(lastMsg.sender?._id || lastMsg.sender) === String(user.id || user._id);
      
      if (lastMsg && !isMine) {
        // لو رسالة إنهاء مكالمة، نقفل الـ CallContainer فوراً
        if (lastMsg.content?.startsWith('[CALL_END]:')) {
          setActiveCall(null);
          playSound('call_end');
        } else if (lastMsg.content?.startsWith('[CALL_INVITE]:')) {
          playSound("calling");
        } else {
          playSound("message_received");
        }
      } else if (lastMsg && isMine) {
        playSound("message_sent");
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, user.id, user._id]);

  // لو اليوزر فاتح محادثة معينة، بنعمل Polling (تحديث تلقائي) كل 2 ثانية (بدلاً من 3) لسرعة ظهور الرسائل.
  useEffect(() => {
    if (!activeConversationId || !user) return;

    const interval = setInterval(() => {
      dispatch(fetchConversationMessages(activeConversationId));
    }, 2000); 

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
      (p) => String(p?._id || p) !== String(user.id || user._id)
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

  const initiateCall = (type) => {
    if (!otherParticipant?._id && !activeConversation?.isGroup) return;
    
    const roomID = uuidv4();
    const callMsg = `[CALL_INVITE]:${roomID}:${type}:${user.name || user.username || 'User'}`;
    
    // إرسال رسالة دعوة للمكالمة
    if (activeConversation?.isGroup) {
      dispatch(sendMessage({ 
        conversationId: activeConversationId, 
        content: callMsg, 
        messageType: "text" 
      }));
    } else {
      dispatch(sendMessage({ 
        receiverId: otherParticipant._id, 
        content: callMsg, 
        messageType: "text" 
      }));
    }

    // فتح واجهة المكالمة عند المتصل
    setActiveCall({ roomID, type, conversationId: activeConversationId });
    playSound('calling');
  };

  const endActiveCall = () => {
    if (activeCall) {
      const endMsg = `[CALL_END]:${activeCall.roomID}`;
      const convId = activeCall.conversationId || activeConversationId;
      
      if (activeConversation?.isGroup) {
        dispatch(sendMessage({ conversationId: convId, content: endMsg, messageType: "text" }));
      } else if (otherParticipant?._id) {
        dispatch(sendMessage({ receiverId: otherParticipant._id, content: endMsg, messageType: "text" }));
      }
    }
    setActiveCall(null);
    playSound('call_end');
  };

  const handleFileUpload = async (file, forcedType = null) => {
    if (!file || (!otherParticipant?._id && !activeConversation?.isGroup)) return;
    setIsUploading(true);
    
    try {
      const url = await uploadImage(file);
      
      let type = forcedType;
      if (!type) {
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';
        else type = 'file';
      }

      if (activeConversation?.isGroup) {
        dispatch(sendMessage({ 
          conversationId: activeConversationId, 
          messageType: type, 
          mediaUrl: url,
          fileName: file.name
        }));
      } else {
        dispatch(sendMessage({ 
          receiverId: otherParticipant._id, 
          messageType: type, 
          mediaUrl: url,
          fileName: file.name
        }));
      }
    } catch (err) {
      console.error("Upload error details:", err);
      alert(`Failed to upload file: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Row className="g-3">
      <SEO 
        title="Messages" 
        description="Secure HD calls and real-time messaging with your Crew members." 
      />
      <Col xs={12} md={4} className={activeConversationId ? "d-none d-md-block" : ""}>
        <Card className="dashboard-card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '1.5rem' }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-800 mb-0">Conversations</h5>
              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                  style={{ width: '35px', height: '35px', padding: 0 }}
                  onClick={() => setShowNewChat(!showNewChat)}
                  title="New Chat"
                >
                  <span style={{ fontSize: '1.2rem' }}>✉️</span>
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                  style={{ width: '35px', height: '35px', padding: 0 }}
                  onClick={() => setShowGroupModal(true)}
                  title="Create Group"
                >
                  <span style={{ fontSize: '1.2rem' }}>👥</span>
                </Button>
              </div>
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
                    const currentId = String(user?.id || user?._id);
                    const otherUser = c.participants?.find((p) => String(p?._id || p) !== currentId);
                    const userSettings = c.settings?.find(s => String(s.user) === currentId);
                    
                    if (userSettings?.isArchived) return null;

                    const isGroup = c.isGroup;
                    const chatName = isGroup ? c.groupName : (otherUser?.name || otherUser?.username || "Deleted User");
                    const chatAvatar = isGroup 
                      ? (c.groupAvatar || `https://ui-avatars.com/api/?name=${c.groupName || 'Group'}&background=random`)
                      : (otherUser?.avatarUrl || `https://ui-avatars.com/api/?name=${otherUser?.username || 'U'}&background=random`);

                    return (
                      <motion.div
                        key={c._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`conversation-item d-flex align-items-center p-3 mb-2 rounded-4 cursor-pointer transition-all ${
                          activeConversationId === c._id ? "bg-primary text-white shadow-lg active-scale" : "bg-white hover-bg-light shadow-sm"
                        }`}
                        style={{ order: userSettings?.isPinned ? -1 : 0 }}
                        onClick={() => {
                          dispatch(setActiveConversation(c._id));
                          dispatch(fetchConversationMessages(c._id));
                        }}
                      >
                        <div className="position-relative">
                          <img
                            src={chatAvatar}
                            alt={chatName}
                            className="rounded-circle border border-2 border-white"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                          {!isGroup && <div className="online-indicator position-absolute bottom-0 end-0 rounded-circle border border-2 border-white" style={{ width: '12px', height: '12px', backgroundColor: '#2ecc71' }}></div>}
                          {userSettings?.isPinned && (
                            <span className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-dark p-1" style={{ fontSize: '0.5rem' }}>📌</span>
                          )}
                        </div>
                        <div className="ms-3 flex-grow-1 overflow-hidden">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '0.95rem' }}>{chatName}</h6>
                            <div className="d-flex align-items-center gap-1">
                              {userSettings?.isMuted && <span className="small opacity-50">🔕</span>}
                              <span className="x-small opacity-75">{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <p className="mb-0 x-small text-truncate opacity-75" style={{ maxWidth: '140px' }}>
                              {c.lastMessage?.content?.startsWith('[CALL_INVITE]:') ? "📞 Calling..." : 
                               c.lastMessage?.content?.startsWith('[CALL_END]:') ? "🚫 Call Ended" :
                               c.lastMessage?.content || "No messages yet"}
                            </p>
                            {c.unreadCount > 0 && (
                              <span className="badge rounded-pill bg-danger shadow-sm">{c.unreadCount}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
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
                {activeConversation && (
                  <div className="d-flex align-items-center gap-2">
                    <img 
                      src={activeConversation.isGroup 
                        ? (activeConversation.groupAvatar || `https://ui-avatars.com/api/?name=${activeConversation.groupName || 'Group'}&background=random`)
                        : (otherParticipant?.avatarUrl || `https://ui-avatars.com/api/?name=${otherParticipant?.username || 'U'}&background=random`)} 
                      className="rounded-circle border" 
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }} 
                    />
                    <div className="lh-1">
                      <h6 className="mb-0 fw-800">
                        {activeConversation.isGroup ? activeConversation.groupName : `@${otherParticipant?.username}`}
                      </h6>
                      {activeConversation.isGroup ? (
                        <small className="text-primary fw-bold" style={{ fontSize: '0.65rem' }}>{activeConversation.participants?.length} members</small>
                      ) : activeConversation.messageBlockedBy?.length > 0 ? (
                        <small className="text-danger fw-bold" style={{ fontSize: '0.65rem' }}>Blocked</small>
                      ) : (
                        <small className="text-primary fw-bold" style={{ fontSize: '0.65rem' }}>Active now</small>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="d-flex align-items-center gap-2">
                {activeConversation?.isGroup && (
                  <Button 
                    variant="light" 
                    className="rounded-circle border-0 shadow-sm p-0 d-flex align-items-center justify-content-center hover-scale"
                    style={{ width: '36px', height: '36px', backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)', color: 'var(--bs-primary)' }}
                    onClick={() => setShowGroupInfo(true)}
                    title="Group Info"
                  >
                    ℹ️
                  </Button>
                )}
                {activeConversation && !activeConversation?.messageBlockedBy?.length && (
                  <>
                    <Button 
                      variant="light" 
                      className="rounded-circle border-0 shadow-sm p-0 d-flex align-items-center justify-content-center hover-scale"
                      style={{ width: '36px', height: '36px', backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)', color: 'var(--bs-primary)' }}
                      onClick={() => initiateCall('audio')}
                      title="Voice Call"
                    >
                      📞
                    </Button>
                    <Button 
                      variant="light" 
                      className="rounded-circle border-0 shadow-sm p-0 d-flex align-items-center justify-content-center hover-scale"
                      style={{ width: '36px', height: '36px', backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)', color: 'var(--bs-primary)' }}
                      onClick={() => initiateCall('video')}
                      title="Video Call"
                    >
                      📹
                    </Button>
                  </>
                )}

                {activeConversation && (
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" className="text-dark p-0 no-caret shadow-none fs-5">
                      ⋮
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="border-0 shadow-lg p-2 rounded-4" style={{ minWidth: '180px' }}>
                      <Dropdown.Item className="rounded-3 py-2 small fw-bold" onClick={() => dispatch(updateConversationSettings({ conversationId: activeConversation._id, action: activeConversation.settings?.find(s => s.user === user.id)?.isPinned ? 'unpin' : 'pin' }))}>
                        {activeConversation.settings?.find(s => s.user === user.id)?.isPinned ? "📌 Unpin" : "📍 Pin Chat"}
                      </Dropdown.Item>
                      <Dropdown.Item className="rounded-3 py-2 small fw-bold" onClick={() => dispatch(updateConversationSettings({ conversationId: activeConversation._id, action: activeConversation.settings?.find(s => s.user === user.id)?.isMuted ? 'unmute' : 'mute' }))}>
                        {activeConversation.settings?.find(s => s.user === user.id)?.isMuted ? "🔊 Unmute" : "🔕 Mute Notifications"}
                      </Dropdown.Item>
                      <Dropdown.Item className="rounded-3 py-2 small fw-bold" onClick={() => dispatch(updateConversationSettings({ conversationId: activeConversation._id, action: 'archive' }))}>
                        📥 Archive
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item className="rounded-3 py-2 small fw-bold text-warning" onClick={() => dispatch(toggleMessageBlock(activeConversation._id))}>
                        🚫 {activeConversation.messageBlockedBy?.includes(user.id || user._id) ? "Unblock Messages" : "Block Messages"}
                      </Dropdown.Item>
                      <Dropdown.Item className="rounded-3 py-2 small fw-bold text-danger" onClick={() => {
                        if(window.confirm("Delete entire conversation? This cannot be undone.")) {
                          dispatch(updateConversationSettings({ conversationId: activeConversation._id, action: 'delete' }));
                        }
                      }}>
                        🗑️ Delete Chat
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
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
                                  {message.content.startsWith('[CALL_INVITE]:') ? (() => {
                                    const parts = message.content.split(':');
                                    const roomID = parts[1];
                                    const type = parts[2];
                                    
                                    // البحث في كل الرسايل المتاحة عن إشارة انتهاء المكالمة دي
                                    const isEnded = messages.some(m => 
                                      m.content === `[CALL_END]:${roomID}` || 
                                      m.content.startsWith(`[CALL_END]:${roomID}`)
                                    );
                                    
                                    return (
                                      <div className="call-invite-bubble p-3 rounded-4" style={{ 
                                        background: isMine ? 'rgba(255,255,255,0.1)' : 'rgba(var(--bs-primary-rgb), 0.1)', 
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        opacity: isEnded ? 0.6 : 1,
                                        filter: isEnded ? 'grayscale(0.5)' : 'none'
                                      }}>
                                        <div className="d-flex align-items-center gap-3 mb-2">
                                          <div className={`fs-2 ${!isEnded ? 'call-icon-animate' : ''}`} style={{ opacity: isEnded ? 0.5 : 1 }}>
                                            {type === 'video' ? '📹' : '📞'}
                                          </div>
                                          <div className="flex-grow-1">
                                            <div className="fw-800 small text-uppercase tracking-wider">
                                              {type === 'video' ? 'Video Call' : 'Voice Call'}
                                            </div>
                                            <div className="x-small opacity-75 fw-semibold">
                                              {isEnded ? (isMine ? 'Call Ended' : 'Missed Call') : (isMine ? 'Waiting for answer...' : 'Incoming Call...')}
                                            </div>
                                          </div>
                                        </div>
                                        {!isEnded && (
                                          <div className="d-flex gap-2 mt-2">
                                            {!isMine && (
                                              <Button 
                                                variant="success" 
                                                size="sm" 
                                                className="flex-grow-1 rounded-pill fw-800 shadow-sm py-2 border-0"
                                                style={{ background: 'linear-gradient(45deg, #28a745, #20c997)' }}
                                                onClick={() => setActiveCall({ roomID, type, conversationId: activeConversationId })}
                                              >
                                                Answer Call
                                              </Button>
                                            )}
                                            {isMine && (
                                              <Button 
                                                variant="outline-light" 
                                                size="sm" 
                                                className="flex-grow-1 rounded-pill fw-800 py-2 border-opacity-25"
                                                onClick={() => setActiveCall({ roomID, type, conversationId: activeConversationId })}
                                              >
                                                Rejoin Call
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })() : message.content.startsWith('[CALL_END]:') ? (
                                    <div className="d-flex align-items-center gap-2 py-1 px-2 opacity-75">
                                      <span className="fs-6">🚫</span>
                                      <span className="small fw-bold">Call Ended</span>
                                    </div>
                                  ) : (
                                    <>
                                      {message.content}
                                      {message.isEdited && <span className="ms-2 opacity-50" style={{ fontSize: '0.6rem' }}>(edited)</span>}
                                    </>
                                  )}
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
                    if (!draft.trim()) return;
                    
                    if (activeConversation?.isGroup) {
                      dispatch(sendMessage({ conversationId: activeConversationId, content: draft.trim(), messageType: "text" }));
                    } else if (otherParticipant?._id) {
                      dispatch(sendMessage({ receiverId: otherParticipant._id, content: draft.trim(), messageType: "text" }));
                    }
                    setDraft("");
                  }}
                >
                  <div className="d-flex align-items-center gap-2 bg-light p-2 rounded-pill shadow-inner">
                    <Dropdown drop="up">
                      <Dropdown.Toggle variant="link" className="p-0 text-decoration-none fs-4 shadow-none no-caret mx-2">
                        <span className="hover-scale-sm">📎</span>
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
                        <div className="flex-grow-1 position-relative">
                          <Form.Control 
                            value={draft} 
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Type a message..."
                            className="border-0 bg-transparent shadow-none"
                          />
                          <Button 
                            variant="link" 
                            className="position-absolute top-50 end-0 translate-middle-y p-0 text-decoration-none shadow-none opacity-50 me-2"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            😊
                          </Button>
                          
                          <AnimatePresence>
                            {showEmojiPicker && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: -50 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="position-absolute end-0 p-2 glass-panel rounded-pill shadow-lg d-flex gap-2"
                                style={{ zIndex: 100, bottom: '100%', right: 0 }}
                              >
                                {EMOJIS.map(e => (
                                  <span 
                                    key={e} 
                                    className="cursor-pointer fs-5 hover-scale-sm"
                                    onClick={() => addEmoji(e)}
                                  >
                                    {e}
                                  </span>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <Button variant="link" className="p-0 text-decoration-none fs-4 shadow-none me-2" onClick={startAudioRecording} title="Record Audio">
                          <span className="hover-scale-sm">🎙️</span>
                        </Button>
                      </>
                    )}

                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="rounded-circle shadow-sm d-flex align-items-center justify-content-center luxury-send-btn"
                      style={{ width: '45px', height: '45px', padding: 0 }}
                      disabled={(!draft.trim() && !isRecordingAudio) || isUploading}
                    >
                      {isUploading ? <Spinner animation="border" size="sm" /> : <span style={{ fontSize: '1.2rem', marginLeft: '2px' }}>🚀</span>}
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
        .call-icon-animate {
          animation: ring 1.5s infinite ease-in-out;
        }
        @keyframes ring {
          0% { transform: scale(1) rotate(0); }
          10% { transform: scale(1.1) rotate(-10deg); }
          20% { transform: scale(1.1) rotate(10deg); }
          30% { transform: scale(1.1) rotate(-10deg); }
          40% { transform: scale(1.1) rotate(10deg); }
          50% { transform: scale(1) rotate(0); }
          100% { transform: scale(1) rotate(0); }
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
      {/* Agora Call Overlay */}
      {activeCall && (
        <CallContainer 
          roomID={activeCall.roomID}
          callType={activeCall.type}
          userID={user.id || user._id}
          userName={user.username}
          conversationId={activeCall.conversationId || activeConversationId}
          onLeave={endActiveCall}
        />
      )}

      {/* Group Creation Modal */}
      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} centered contentClassName="rounded-5 border-0 shadow-2xl">
        <Modal.Header closeButton className="border-0 p-4">
          <Modal.Title className="fw-900 tracking-tight">Create Luxury Group</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-0">
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold small text-uppercase tracking-widest text-muted">Group Identity</Form.Label>
            <Form.Control 
              placeholder="Enter a creative name..." 
              className="rounded-4 py-3 border-0 bg-light shadow-inner"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold small text-uppercase tracking-widest text-muted">Invite Members</Form.Label>
            <Form.Control 
              placeholder="Search by username..." 
              className="rounded-4 py-3 border-0 bg-light shadow-inner mb-3"
              value={groupSearchQuery}
              onChange={(e) => searchUsersForGroup(e.target.value)}
            />
            
            <div className="search-results overflow-auto mb-3" style={{ maxHeight: '150px' }}>
              {groupSearchResults.map(u => (
                <div 
                  key={u._id} 
                  className="d-flex align-items-center gap-3 p-2 hover-bg-light rounded-4 cursor-pointer"
                  onClick={() => toggleUserSelection(u)}
                >
                  <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}`} className="rounded-circle" width="35" height="35" />
                  <div className="flex-grow-1 small fw-bold">{u.name || u.username}</div>
                  <div className={`rounded-circle border ${selectedUsers.find(s => s._id === u._id) ? 'bg-primary border-primary' : 'border-2'}`} style={{ width: '18px', height: '18px' }}>
                    {selectedUsers.find(s => s._id === u._id) && <span className="text-white d-flex align-items-center justify-content-center" style={{ fontSize: '10px' }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="selected-members d-flex flex-wrap gap-2">
              {selectedUsers.map(u => (
                <span key={u._id} className="badge rounded-pill bg-primary bg-opacity-10 text-primary p-2 px-3 border border-primary border-opacity-25 d-flex align-items-center gap-2">
                  {u.username}
                  <span className="cursor-pointer fw-900" onClick={() => toggleUserSelection(u)}>×</span>
                </span>
              ))}
            </div>
          </Form.Group>

          <Button 
            variant="primary" 
            className="w-100 rounded-pill py-3 fw-900 shadow-lg border-0 mt-3"
            style={{ background: 'linear-gradient(45deg, var(--bs-primary), #00d2ff)' }}
            onClick={handleCreateGroup}
          >
            Launch Group Session
          </Button>
        </Modal.Body>
      </Modal>

      {/* Group Info Modal */}
      <Modal show={showGroupInfo} onHide={() => setShowGroupInfo(false)} centered contentClassName="rounded-5 border-0 shadow-2xl overflow-hidden">
        <div className="group-info-header position-relative p-5 text-center text-white" style={{ background: 'linear-gradient(135deg, #1a1a1a, #000)' }}>
           <img 
             src={activeConversation?.groupAvatar || `https://ui-avatars.com/api/?name=${activeConversation?.groupName}&background=random&size=128`} 
             className="rounded-circle border border-4 border-white border-opacity-10 shadow-2xl mb-3"
             width="120" height="120"
           />
           <h3 className="fw-900 mb-1">{activeConversation?.groupName}</h3>
           <p className="opacity-50 small tracking-widest text-uppercase">Private Luxury Group</p>
           <Button 
             variant="link" 
             className="position-absolute top-0 end-0 p-4 text-white text-decoration-none fs-4"
             onClick={() => setShowGroupInfo(false)}
           >✕</Button>
        </div>
        <Modal.Body className="p-4">
          <h6 className="fw-bold small text-uppercase tracking-widest text-muted mb-4">Members ({activeConversation?.participants?.length})</h6>
          <div className="members-list overflow-auto" style={{ maxHeight: '300px' }}>
            {activeConversation?.participants?.map(member => {
              const isAdmin = activeConversation.groupAdmins?.some(a => String(a._id || a) === String(member._id || member));
              const isOwner = String(activeConversation.groupAdmin?._id || activeConversation.groupAdmin) === String(member._id || member);
              const currentUserIsAdmin = activeConversation.groupAdmins?.some(a => String(a._id || a) === String(user.id || user._id));
              
              return (
                <div key={member._id} className="d-flex align-items-center gap-3 mb-3 p-2 rounded-4 hover-bg-light transition-all">
                  <img src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.username}`} className="rounded-circle border" width="45" height="45" />
                  <div className="flex-grow-1">
                    <div className="fw-bold small">{member.name || member.username}</div>
                    <div className="x-small text-muted">@{member.username}</div>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    {isOwner ? (
                      <span className="badge rounded-pill bg-warning text-dark border-0 x-small fw-bold">Founder</span>
                    ) : isAdmin ? (
                      <span className="badge rounded-pill bg-info text-white border-0 x-small fw-bold">Admin</span>
                    ) : null}
                    
                    {currentUserIsAdmin && String(member._id || member) !== String(user.id || user._id) && (
                      <Dropdown align="end">
                        <Dropdown.Toggle variant="link" className="p-0 text-muted shadow-none no-caret">⋮</Dropdown.Toggle>
                        <Dropdown.Menu className="border-0 shadow-lg rounded-4">
                          {!isAdmin && (
                            <Dropdown.Item onClick={() => dispatch(promoteToAdmin({ conversationId: activeConversationId, userId: member._id }))} className="small fw-bold py-2">Promote to Admin</Dropdown.Item>
                          )}
                          <Dropdown.Item onClick={() => dispatch(removeGroupMember({ conversationId: activeConversationId, userId: member._id }))} className="small fw-bold py-2 text-danger">Remove from Group</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="d-grid mt-4">
            <Button 
              variant="outline-danger" 
              className="rounded-pill py-3 fw-bold border-2"
              onClick={() => {
                if(window.confirm("Leave this group?")) {
                  dispatch(removeGroupMember({ conversationId: activeConversationId, userId: user.id || user._id }));
                  setShowGroupInfo(false);
                }
              }}
            >
              Leave Luxury Group
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
        .fw-900 { font-weight: 900; }
        .tracking-tight { letter-spacing: -0.025em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .active-scale { transform: scale(1.02); }
        .transition-all { transition: all 0.2s ease-in-out; }
        .hover-scale:hover { transform: scale(1.1); }
        .hover-scale-sm { transition: transform 0.2s ease; display: inline-block; }
        .hover-scale-sm:hover { transform: scale(1.2); }
        .luxury-send-btn {
          background: linear-gradient(135deg, var(--bs-primary), #00d2ff) !important;
          border: none !important;
          transition: all 0.3s ease !important;
        }
        .luxury-send-btn:hover:not(:disabled) {
          transform: rotate(-10deg) scale(1.1);
          box-shadow: 0 5px 15px rgba(var(--bs-primary-rgb), 0.4) !important;
        }
      `}</style>
    </Row>
  );
};

export default MessagesPage;
