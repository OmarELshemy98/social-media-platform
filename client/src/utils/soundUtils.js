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
  success: "https://assets.mixkit.co/active_storage/sfx/2351/2351-preview.mp3",
  // صوت الرنين للمكالمة الواردة (Incoming Call)
  ringtone: "https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3",
  // صوت انتهاء المكالمة
  call_end: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
  // صوت الاتصال (Waiting)
  calling: "https://assets.mixkit.co/active_storage/sfx/1358/1358-preview.mp3"
};

// كائنات لتخزين الأصوات التي تعمل حالياً للتحكم بها
const activeSounds = {};

/**
 * وظيفة تشغيل الصوت
 * @param {string} soundName - اسم الصوت من القائمة اللي فوق
 * @param {boolean} loop - هل يتم تكرار الصوت؟
 */
export const playSound = (soundName, loop = false) => {
  // التأكد إن اليوزر مش قافل الأصوات من إعدادات المتصفح أو إعدادات الموقع (مستقبلاً)
  const isSoundEnabled = localStorage.getItem("sound_enabled") !== "false";
  
  if (isSoundEnabled && SOUND_URLS[soundName]) {
    try {
      const audio = new Audio(SOUND_URLS[soundName]);
      audio.volume = 0.5; // تحديد مستوى الصوت عشان ميبقاش مزعج
      audio.loop = loop;
      audio.play().catch(e => {
        // بنعمل catch عشان المتصفحات ساعات بتمنع الصوت لو اليوزر متفاعلش مع الصفحة
        console.warn("Audio playback blocked or failed:", e.message);
      });

      // حفظ الصوت في قائمة النشطين للتحكم به لاحقاً
      activeSounds[soundName] = audio;
      return audio;
    } catch (err) {
      console.error("Sound system error:", err);
    }
  }
};

/**
 * وظيفة إيقاف الصوت
 * @param {string} soundName - اسم الصوت المراد إيقافه
 */
export const stopSound = (soundName) => {
  if (activeSounds[soundName]) {
    activeSounds[soundName].pause();
    activeSounds[soundName].currentTime = 0;
    delete activeSounds[soundName];
  }
};
