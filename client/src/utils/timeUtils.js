/**
 * @file timeUtils.js
 * @description وظائف مساعدة للتعامل مع الوقت والتاريخ.
 */

/**
 * وظيفة لتحويل تاريخ "آخر نشاط" لنص مفهوم (مثلاً: النشط الآن، منذ 5 دقائق)
 */
export const formatLastActive = (date) => {
  if (!date) return "Unknown";
  
  const now = new Date();
  const lastActive = new Date(date);
  const diffInSeconds = Math.floor((now - lastActive) / 1000);

  if (diffInSeconds < 60) {
    return "Active now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Active ${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Active ${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Active ${diffInDays}d ago`;
  }

  return `Last seen on ${lastActive.toLocaleDateString()}`;
};

/**
 * وظيفة لمعرفة هل اليوزر "أونلاين" حالياً (أقل من دقيقة من آخر نشاط)
 */
export const isOnline = (date) => {
  if (!date) return false;
  const now = new Date();
  const lastActive = new Date(date);
  const diffInSeconds = Math.floor((now - lastActive) / 1000);
  return diffInSeconds < 60;
};
