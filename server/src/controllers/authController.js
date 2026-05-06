/**
 * @file authController.js
 * @description التحكم في عمليات المصادقة (التسجيل، تسجيل الدخول، الحصول على بيانات المستخدم الحالي).
 */

const bcrypt = require("bcryptjs"); // لتشفير ومقارنة كلمات المرور
const User = require("../models/User"); // استيراد نموذج المستخدم
const generateToken = require("../utils/generateToken"); // وظيفة توليد JWT
const { sendWelcomeEmail } = require("../config/mailer"); // وظيفة إرسال بريد ترحيبي

/**
 * تسجيل مستخدم جديد
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    // التحقق مما إذا كان البريد الإلكتروني أو اسم المستخدم موجوداً مسبقاً
    const existingUser = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with email or username" });
    }

    // تشفير كلمة المرور قبل الحفظ في قاعدة البيانات
    const hashedPassword = await bcrypt.hash(password, 12);

    // إنشاء المستخدم الجديد
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email,
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

module.exports = { registerUser, loginUser, getCurrentUser };
