import React, { useEffect } from 'react';
import { Modal, Button, Image } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound, stopSound } from '../../utils/soundUtils';

const IncomingCallModal = ({ callData, onAccept, onDecline }) => {
  useEffect(() => {
    console.log("[CALL] Modal mounted, starting ringtone...");
    // محاولة تشغيل الصوت مع تأخير بسيط لضمان تفاعل المستخدم
    const ringtoneTimeout = setTimeout(() => {
      playSound('ringtone', true);
    }, 500);

    // التوقف التلقائي بعد 45 ثانية لو مردش
    const timer = setTimeout(() => {
      onDecline();
    }, 45000);

    return () => {
      console.log("[CALL] Modal unmounted, stopping ringtone...");
      stopSound('ringtone');
      clearTimeout(ringtoneTimeout);
      clearTimeout(timer);
    };
  }, []); // نستخدم مصفوفة فارغة ليعمل مرة واحدة عند التحميل

  if (!callData) return null;

  return (
    <Modal
      show={true}
      centered
      backdrop="static"
      keyboard={false}
      className="incoming-call-modal"
      contentClassName="bg-dark text-white rounded-5 border-0 shadow-lg overflow-hidden"
      style={{ zIndex: 10001 }}
    >
      <div className="p-5 text-center position-relative">
        <div 
          className="position-absolute top-0 start-0 w-100 h-100" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.2), rgba(0,0,0,0.8))',
            zIndex: -1 
          }} 
        />
        
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mb-4"
        >
          <Image 
            src={`https://ui-avatars.com/api/?name=${callData.callerName}&background=random&size=128`}
            roundedCircle
            className="shadow-lg border border-3 border-primary"
            width={120}
            height={120}
          />
        </motion.div>

        <h3 className="fw-800 mb-1">{callData.callerName}</h3>
        <p className="text-primary fw-bold text-uppercase tracking-wider mb-4" style={{ fontSize: '0.8rem' }}>
          Incoming {callData.type === 'video' ? 'Video Call' : 'Voice Call'}...
        </p>

        <div className="d-flex justify-content-center gap-4 mt-5">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              variant="danger" 
              className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-lg border-0"
              style={{ width: '64px', height: '64px' }}
              onClick={onDecline}
            >
              <span className="fs-3">📞</span>
            </Button>
            <small className="d-block mt-2 fw-bold opacity-75">Decline</small>
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              variant="success" 
              className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-lg border-0"
              style={{ width: '64px', height: '64px', background: 'linear-gradient(45deg, #28a745, #20c997)' }}
              onClick={onAccept}
            >
              <span className="fs-3">{callData.type === 'video' ? '📹' : '📞'}</span>
            </Button>
            <small className="d-block mt-2 fw-bold opacity-75">Accept</small>
          </motion.div>
        </div>
      </div>
    </Modal>
  );
};

export default IncomingCallModal;
