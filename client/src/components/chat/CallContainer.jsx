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

const CallContainer = ({ roomID, userID, onLeave, callType = 'video' }) => {
  const [inCall, setInCall] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // إعدادات Agora
  const appId = import.meta.env.VITE_AGORA_APP_ID;

  useEffect(() => {
    if (!appId) {
      setError("Agora Config Missing: VITE_AGORA_APP_ID is required.");
      setLoading(false);
      return;
    }

    const fetchTokenAndJoin = async () => {
      try {
        setLoading(true);
        // طلب التوكن من السيرفر (RTC فقط لتجنب تعقيدات الـ RTM)
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
        <Spinner animation="border" variant="primary" className="mb-3" />
        <h5 className="text-white">Connecting HD Line...</h5>
      </div>
    );
  }

  if (error || !appId) {
    return (
      <div className="call-container-wrapper" style={containerStyle}>
        <div className="p-4 text-center" style={{ maxWidth: '500px' }}>
          <Alert variant="danger" className="rounded-4 shadow-lg border-0">
            <Alert.Heading className="fw-bold">Call Error</Alert.Heading>
            <p className="mb-0">{error || "Agora configuration missing."}</p>
          </Alert>
          <Button variant="outline-light" className="mt-3 rounded-pill px-4" onClick={onLeave}>
            Go Back
          </Button>
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
    enableScreensharing: true,
    // إجبار الكاميرا على الإغلاق لو كانت مكالمة صوتية فقط
    videoState: callType === 'video' ? true : false,
  };

  const callbacks = {
    EndCall: () => {
      setInCall(false);
      onLeave();
    },
  };

  const styleProps = {
    containerStyle: {
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1a1a1a',
    },
    localBtnContainer: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: '30px',
      padding: '12px',
      bottom: '40px',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    maxViewRemoteBtnContainer: {
      top: '30px',
      right: '30px',
    },
  };

  return (
    <div className="call-container-wrapper shadow-lg" style={containerStyle}>
      <div className="position-absolute top-0 end-0 p-4" style={{ zIndex: 10000 }}>
        <Button 
          variant="danger" 
          className="rounded-pill px-4 fw-bold shadow-lg border-0"
          style={{ background: 'linear-gradient(45deg, #ff416c, #ff4b2b)' }}
          onClick={onLeave}
        >
          ✕ End Call
        </Button>
      </div>

      {/* تعطيل الـ RTM يدوياً عبر عدم تمرير rtmProps لتقليل الأخطاء */}
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
