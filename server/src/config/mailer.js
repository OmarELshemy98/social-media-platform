const nodemailer = require("nodemailer");

const getTransport = () => {
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

  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

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
