/**
 * @file authController.js
 * @description التحكم في عمليات المصادقة (التسجيل، تسجيل الدخول، الحصول على بيانات المستخدم الحالي).
 */

const bcrypt = require("bcryptjs"); // لتشفير ومقارنة كلمات المرور
const User = require("../models/User"); // استيراد نموذج المستخدم
const generateToken = require("../utils/generateToken"); // وظيفة توليد JWT
const { sendWelcomeEmail, sendResetPasswordEmail } = require("../config/mailer"); // وظيفة إرسال بريد ترحيبي
const crypto = require("crypto"); // لتوليد رموز عشوائية

/**
 * تسجيل مستخدم جديد
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, username, email, phoneNumber, password } = req.body;

    // التحقق مما إذا كان البريد الإلكتروني أو اسم المستخدم موجوداً مسبقاً
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      return res.status(409).json({ message: "This email is already registered. Please use another email or login." });
    }

    const existingUserByUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUserByUsername) {
      return res.status(409).json({ message: "This username is already taken. Please choose a different one." });
    }

    // تشفير كلمة المرور قبل الحفظ في قاعدة البيانات
    const hashedPassword = await bcrypt.hash(password, 12);

    // إنشاء المستخدم الجديد
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email,
      phoneNumber,
      password: hashedPassword,
    });

    // إرسال بريد إلكتروني ترحيبي (يتم تشغيله في الخلفية)
    sendWelcomeEmail({ name: user.name, email: user.email }).catch((err) => {
      console.error(`Welcome email failed: ${err.message}`);
    });

    // توليد رمز JWT للمستخدم الجديد
    const token = generateToken({ id: user._id });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * تسجيل الدخول
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // البحث عن المستخدم ببريده الإلكتروني مع جلب كلمة المرور المشفرة
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // مقارنة كلمة المرور المدخلة مع كلمة المرور المشفرة في قاعدة البيانات
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // توليد رمز JWT
    const token = generateToken({ id: user._id });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * الحصول على بيانات المستخدم الحالي المسجل دخوله
 */
const getCurrentUser = async (req, res) => {
  res.status(200).json({ user: req.user });
};

/**
 * طلب استعادة كلمة المرور
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email, username } = req.body;

    // البحث عن المستخدم بالبريد واسم المستخدم معاً للتأكد
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      username: username.toLowerCase() 
    });

    if (!user) {
      return res.status(404).json({ message: "No user found with this email and username" });
    }

    // توليد رمز استعادة عشوائي
    const resetToken = crypto.randomBytes(20).toString("hex");

    // تشفير الرمز وحفظه في قاعدة البيانات مع وقت انتهاء (ساعة واحدة)
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

    await user.save();

    // إنشاء رابط الاستعادة
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    // إرسال البريد الإلكتروني
    try {
      await sendResetPasswordEmail({ email: user.email, resetUrl });
      res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (error) {
    return next(error);
  }
};

/**
 * تعيين كلمة مرور جديدة
 */
const resetPassword = async (req, res, next) => {
  try {
    // تشفير الرمز القادم من الرابط للبحث عنه
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }, // التأكد أن الرمز لم ينتهِ
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // تشفير كلمة المرور الجديدة
    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return next(error);
  }
};

module.exports = { registerUser, loginUser, getCurrentUser, forgotPassword, resetPassword };
