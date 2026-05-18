/**
 * @file mailer.js
 * @description الفايل ده مسؤول عن إرسال الإيميلات من السيرفر.
 * بنستخدم مكتبة Nodemailer عشان نبعت ايميلات زي (رسالة الترحيب) أو (رابط تغيير الباسورد).
 * لو مش ضابط إعدادات الـ SMTP في الـ .env، بيبعت الإيميل كـ JSON في الـ console للتجربة.
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

/**
 * إرسال بريد إلكتروني لاستعادة كلمة المرور
 */
const sendResetPasswordEmail = async ({ email, resetUrl }) => {
  const transporter = getTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "no-reply@socialsphere.local",
    to: email,
    subject: "SocialSphere Password Reset Request",
    text: `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n Please click on the following link, or paste this into your browser to complete the process: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email and your password will remain unchanged.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #0d6efd; text-align: center;">SocialSphere</h2>
        <p>Hi there,</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0d6efd; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">SocialSphere Team</p>
      </div>
    `,
  });
};

module.exports = { sendWelcomeEmail, sendResetPasswordEmail };
