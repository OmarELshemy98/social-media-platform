/**
 * @file CallContainer.jsx
 * @description مكون إدارة مكالمات الفيديو والصوت باستخدام Agora SDK.
 */

import React, { useState, useEffect } from 'react';
import AgoraUIKit, { layout } from 'agora-react-uikit';
import { Button, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import AgoraRTC from 'agora-rtc-sdk-ng';

// تقليل الـ Logs الخاصة بـ Agora في الكونسول
AgoraRTC.setLogLevel(3); // 3 يعني إظهار الأخطاء الحرجة فقط

const CallContainer = ({ roomID, userID, onLeave, callType = 'video', conversationId }) => {
  const [inCall, setInCall] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // إعدادات Agora
  const appId = import.meta.env.VITE_AGORA_APP_ID;

  const handleEndCall = async () => {
    try {
      // إرسال رسالة إنهاء المكالمة للطرف التاني
      if (conversationId) {
        await api.post('/messages', {
          conversationId,
          content: `[CALL_END]:${roomID}`,
          messageType: 'text'
        });
      }
    } catch (err) {
      console.error("Failed to send CALL_END message:", err);
    } finally {
      setInCall(false);
      onLeave();
    }
  };

  useEffect(() => {
    if (!appId) {
      setError("Agora Config Missing: VITE_AGORA_APP_ID is required.");
      setLoading(false);
      return;
    }

    const fetchTokenAndJoin = async () => {
      try {
        setLoading(true);
        // طلب التوكن من السيرفر
        const { data } = await api.get(`/auth/agora-token?channelName=${roomID}`);
        setToken(data.token);
        setInCall(true);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch Agora token:", err);
        setError("Failed to secure the call line. Please try again.");
        setLoading(false);
      }
    };

    fetchTokenAndJoin();
  }, [appId, roomID]);

  if (loading) {
    return (
      <div className="call-container-wrapper" style={containerStyle}>
        <div className="text-center">
          <Spinner animation="grow" variant="primary" className="mb-4" style={{ width: '4rem', height: '4rem' }} />
          <h4 className="text-white fw-light tracking-widest text-uppercase">Establishing Secure Line</h4>
          <p className="text-muted small">Connecting to encrypted HD servers...</p>
        </div>
      </div>
    );
  }

  if (error || !appId) {
    return (
      <div className="call-container-wrapper" style={containerStyle}>
        <div className="p-4 text-center" style={{ maxWidth: '500px' }}>
          <div className="bg-danger bg-opacity-10 p-5 rounded-5 border border-danger border-opacity-25 shadow-2xl">
            <h2 className="text-danger fw-bold mb-3">Connection Failed</h2>
            <p className="text-white opacity-75 mb-4">{error || "Agora configuration missing."}</p>
            <Button variant="outline-light" className="rounded-pill px-5 py-2 fw-bold" onClick={onLeave}>
              Return to Safety
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const rtcProps = {
    appId: appId,
    channel: roomID,
    token: token,
    uid: 0,
    callActive: inCall,
    layout: layout.grid,
    enableScreensharing: callType === 'video',
    // إجبار الكاميرا على الإغلاق لو كانت مكالمة صوتية فقط
    videoState: callType === 'video',
    audioState: true,
  };

  const callbacks = {
    EndCall: handleEndCall,
  };

  const styleProps = {
    containerStyle: {
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0a0a0a',
    },
    localBtnContainer: {
      backgroundColor: 'rgba(20,20,20,0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '40px',
      padding: '15px 30px',
      bottom: '50px',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    },
    maxViewRemoteBtnContainer: {
      top: '40px',
      right: '40px',
    },
  };

  return (
    <div className="call-container-wrapper shadow-2xl overflow-hidden" style={containerStyle}>
      {/* Header Overlay */}
      <div className="position-absolute top-0 start-0 w-100 p-4 d-flex justify-content-between align-items-center" style={{ zIndex: 100, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle bg-success" style={{ width: '10px', height: '10px', boxShadow: '0 0 10px #198754' }} />
          <span className="text-white fw-bold tracking-widest text-uppercase small opacity-75">
            Encrypted {callType === 'video' ? 'Video' : 'Voice'} Session
          </span>
        </div>
        <Button 
          variant="danger" 
          className="rounded-pill px-4 py-2 fw-bold shadow-lg border-0 d-flex align-items-center gap-2"
          style={{ background: 'linear-gradient(45deg, #ff416c, #ff4b2b)', transition: 'all 0.3s ease' }}
          onClick={handleEndCall}
        >
          <span className="fs-5">✕</span> End Call
        </Button>
      </div>

      {/* Audio Mode Overlay */}
      {callType === 'audio' && (
        <div className="position-absolute top-50 start-50 translate-middle text-center" style={{ zIndex: 10 }}>
          <div className="mb-4 position-relative">
            <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-primary bg-opacity-20 animate-ping" style={{ width: '200px', height: '200px' }} />
            <div className="rounded-circle bg-dark border border-primary border-opacity-25 shadow-2xl d-flex align-items-center justify-content-center" style={{ width: '150px', height: '150px' }}>
              <span style={{ fontSize: '5rem' }}>🎙️</span>
            </div>
          </div>
          <h3 className="text-white fw-bold mb-1">Voice Only Mode</h3>
          <p className="text-primary opacity-75 tracking-widest text-uppercase small">High Fidelity Audio</p>
        </div>
      )}

      <AgoraUIKit 
        rtcProps={rtcProps} 
        callbacks={callbacks} 
        styleProps={styleProps}
      />
    </div>
  );
};

const containerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 9999,
  backgroundColor: '#1a1a1a',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

export default CallContainer;
