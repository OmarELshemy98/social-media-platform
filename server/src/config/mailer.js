/**
 * @file mailer.js
 * @description إعدادات إرسال البريد الإلكتروني باستخدام Nodemailer.
 */

const nodemailer = require("nodemailer");

/**
 * وظيفة للحصول على كائن النقل (Transport) لإرسال الرسائل
 */
const getTransport = () => {
  // التحقق من وجود إعدادات SMTP في ملف .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // في حال عدم وجود إعدادات، يتم استخدام وسيلة تجريبية (JSON)
  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

/**
 * إرسال رسالة ترحيب للمستخدم الجديد
 */
const sendWelcomeEmail = async ({ name, email }) => {
  const transporter = getTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "no-reply@socialsphere.local",
    to: email,
    subject: "Welcome to SocialSphere",
    text: `Hi ${name}, welcome to SocialSphere! Your account is ready.`,
  });
};

module.exports = { sendWelcomeEmail };
