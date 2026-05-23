/**
 * @file soundUtils.js
 * @description نظام إدارة الأصوات في الموقع.
 * هنا بنجمع كل روابط الأصوات ونعمل وظيفة موحدة لتشغيلها.
 */

const SOUND_URLS = {
  // صوت استلام رسالة (شبه فيسبوك)
  message_received: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
  // صوت إرسال رسالة
  message_sent: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
  // صوت إشعار جديد (لايك، كومنت، إلخ)
  notification: "https://assets.mixkit.co/active_storage/sfx/2361/2361-preview.mp3",
  // صوت التفاعل (Like)
  like: "https://assets.mixkit.co/active_storage/sfx/2353/2354-preview.mp3",
  // صوت المسح أو الإغلاق
  delete: "https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3",
  // صوت النجاح (Success)
  success: "https://assets.mixkit.co/active_storage/sfx/2351/2351-preview.mp3"
};

/**
 * وظيفة تشغيل الصوت
 * @param {string} soundName - اسم الصوت من القائمة اللي فوق
 */
export const playSound = (soundName) => {
  // التأكد إن اليوزر مش قافل الأصوات من إعدادات المتصفح أو إعدادات الموقع (مستقبلاً)
  const isSoundEnabled = localStorage.getItem("sound_enabled") !== "false";
  
  if (isSoundEnabled && SOUND_URLS[soundName]) {
    try {
      const audio = new Audio(SOUND_URLS[soundName]);
      audio.volume = 0.5; // تحديد مستوى الصوت عشان ميبقاش مزعج
      audio.play().catch(e => {
        // بنعمل catch عشان المتصفحات ساعات بتمنع الصوت لو اليوزر متفاعلش مع الصفحة
        console.warn("Audio playback blocked or failed:", e.message);
      });
    } catch (err) {
      console.error("Sound system error:", err);
    }
  }
};
