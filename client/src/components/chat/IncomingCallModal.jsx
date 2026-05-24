import React, { useEffect } from 'react';
import { Modal, Button, Image } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound, stopSound } from '../../utils/soundUtils';

const IncomingCallModal = ({ callData, onAccept, onDecline }) => {
  useEffect(() => {
    console.log("[CALL] Modal mounted, starting ringtone...");
    playSound('ringtone', true);

    // التوقف التلقائي بعد 45 ثانية لو مردش
    const timer = setTimeout(() => {
      onDecline();
    }, 45000);

    return () => {
      console.log("[CALL] Modal unmounted, stopping ringtone...");
      stopSound('ringtone');
      clearTimeout(timer);
    };
  }, []);

  if (!callData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="incoming-call-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(15px)',
        }}
      >
        <div 
          className="incoming-call-card text-center p-5 rounded-5 shadow-2xl position-relative overflow-hidden"
          style={{
            width: '400px',
            background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* Animated Background Pulse */}
          <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 0 }}>
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              style={{
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: callData.type === 'video' ? 'radial-gradient(circle, #007bff, transparent)' : 'radial-gradient(circle, #28a745, transparent)',
              }}
            />
          </div>

          <div className="position-relative" style={{ zIndex: 1 }}>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="mb-4"
            >
              <Image 
                src={`https://ui-avatars.com/api/?name=${callData.callerName}&background=random&size=128`}
                roundedCircle
                className="shadow-2xl border border-3 border-white border-opacity-10"
                width={140}
                height={140}
              />
            </motion.div>

            <h2 className="text-white fw-900 mb-2 tracking-tight">{callData.callerName}</h2>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-5">
              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 border border-primary border-opacity-25 text-uppercase tracking-widest small fw-bold">
                {callData.type === 'video' ? '📹 Video Call' : '📞 Voice Call'}
              </span>
            </div>

            <div className="d-flex justify-content-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="danger" 
                  className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-2xl border-0"
                  style={{ 
                    width: '75px', 
                    height: '75px',
                    background: 'linear-gradient(45deg, #ff416c, #ff4b2b)',
                    boxShadow: '0 10px 30px rgba(255, 65, 108, 0.4)'
                  }}
                  onClick={onDecline}
                >
                  <span className="fs-2">✕</span>
                </Button>
                <small className="d-block mt-3 text-white opacity-50 fw-bold text-uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>Decline</small>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="success" 
                  className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-2xl border-0"
                  style={{ 
                    width: '75px', 
                    height: '75px',
                    background: 'linear-gradient(45deg, #00b09b, #96c93d)',
                    boxShadow: '0 10px 30px rgba(0, 176, 155, 0.4)'
                  }}
                  onClick={onAccept}
                >
                  <span className="fs-2">✓</span>
                </Button>
                <small className="d-block mt-3 text-white opacity-50 fw-bold text-uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>Accept</small>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCallModal;
