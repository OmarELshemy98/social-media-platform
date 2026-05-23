/**
 * @file authController.js
 * @description الفايل ده هو "المسؤول عن الحسابات" (Authentication).
 * جواه بنعمل كل العمليات اللي ليها علاقة باليوزر:
 * - Register: يوزر جديد بيعمل حساب.
 * - Login: يوزر بيدخل ايميله وباسورده.
 * - Forgot/Reset Password: لو اليوزر نسي الباسورد وعايز يغيره.
 * - Get Current User: بنعرف مين اليوزر اللي مسجل دخول دلوقتي.
 */

// مكتبةbcryptjs: بنستخدمها عشان نشفر الباسورد، مفيش باسورد بيتسيف زي ما هو أبداً للأمان.
const bcrypt = require("bcryptjs");
// نموذج المستخدم (User Model): ده اللي بيعرفنا شكل الداتا في قاعدة البيانات وبنستخدمه عشان نكلمها.
const User = require("../models/User");
// وظيفة توليد التوكن: دي اللي بتطلع "الكارنيه" (JWT) اللي اليوزر هيمشي بيه في الموقع.
const generateToken = require("../utils/generateToken");
// مكتبة mailer: بنستخدمها عشان نبعت إيميلات حقيقية لليوزر (ترحيب أو تغيير باسورد).
const { sendWelcomeEmail, sendResetPasswordEmail } = require("../config/mailer");
// مكتبة crypto: موجودة في Node.js بنستخدمها عشان نطلع أكواد عشوائية وسرية.
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn("⚠️ GOOGLE_CLIENT_ID is missing in server environment variables.");
}

/**
 * وظيفة تسجيل الدخول أو التسجيل باستخدام Google
 */
const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    // ملاحظة: لو بنستخدم access_token من useGoogleLogin، بنحتاج نكلم الـ userInfo endpoint
    // أو نستخدم idToken لو بنستخدم الـ Standard Google Button.
    // بما إننا استخدمنا useGoogleLogin في الفرونت إند، فإحنا معانا access_token.
    
    let email, name, picture, googleId;

    try {
      // التحقق من الـ Access Token وجلب بيانات اليوزر من جوجل
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${idToken}`);
      const data = await response.json();
      
      if (!data.email) {
        throw new Error("Invalid Google Token");
      }

      email = data.email;
      name = data.name;
      picture = data.picture;
      googleId = data.sub;
    } catch (err) {
      // لو فشل الـ Access Token، نجرب كـ ID Token (للدعم الكامل)
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
    }

    // البحث عن المستخدم بالإيميل
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user && user.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended." });
    }

    if (!user) {
      // إذا لم يكن موجوداً، نقوم بإنشاء حساب جديد
      // توليد يوزر نيم عشوائي بناءً على الاسم
      let username = name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);
      
      // التأكد من أن اليوزر نيم فريد
      let isUsernameTaken = await User.findOne({ username });
      while (isUsernameTaken) {
        username = name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);
        isUsernameTaken = await User.findOne({ username });
      }

      user = await User.create({
        name,
        username,
        email: email.toLowerCase(),
        avatarUrl: picture,
        googleId, // حفظ معرف جوجل للربط مستقبلاً
        password: await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 12), // باسورد عشوائي بما أنه سجل بجوجل
      });

      // إرسال إيميل ترحيب
      sendWelcomeEmail({ name: user.name, email: user.email }).catch((err) => {
        console.error(`Welcome email failed: ${err.message}`);
      });
    }

    // توليد توكن Crew
    const token = generateToken({ id: user._id });

    return res.status(200).json({
      message: "Google Auth successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * وظيفة تسجيل مستخدم جديد (Register)
 */
const registerUser = async (req, res, next) => {
  try {
    // بناخد البيانات اللي اليوزر كتبها في الفورم (الاسم، اليوزر نيم، الإيميل، التليفون، الباسورد).
    const { name, username, email, phoneNumber, password } = req.body;

    // بنشيك الأول: هل الإيميل ده موجود عندنا قبل كده؟ لو موجود بنقوله "معلش استعمل إيميل تاني".
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      return res.status(409).json({ message: "This email is already registered. Please use another email or login." });
    }

    // بنشيك برضه على اليوزر نيم: لازم يكون فريد ومحدش غيره واخده.
    const existingUserByUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUserByUsername) {
      return res.status(409).json({ message: "This username is already taken. Please choose a different one." });
    }

    // هنا بقى بنشفر الباسورد: بنحوله لشفرة طويلة (Hash) مستحيل حد يفهمها، وبنعمل ده 12 مرة (Salt rounds) لزيادة الأمان.
    const hashedPassword = await bcrypt.hash(password, 12);

    // بنكريت اليوزر الجديد في قاعدة البيانات بالبيانات اللي معانا والباسورد المتشفر.
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email,
      phoneNumber,
      password: hashedPassword,
    });

    // بنبعت إيميل ترحيب لليوزر، وبنعمل ده "async" يعني في الخلفية عشان السيرفر ميعطلش.
    sendWelcomeEmail({ name: user.name, email: user.email }).catch((err) => {
      console.error(`Welcome email failed: ${err.message}`);
    });

    // بنطلع لليوزر "التوكن" (JWT) بتاعه عشان يبدأ يستخدم الموقع فوراً.
    const token = generateToken({ id: user._id });

    // بنرد على الفرونت إند بإن العملية نجحت وبنبعت بيانات اليوزر (من غير الباسورد طبعاً).
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
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    // لو حصل أي غلط غير متوقع، بنبعته للـ Error Middleware هو يتصرف.
    return next(error);
  }
};

/**
 * وظيفة تسجيل الدخول (Login)
 */
const loginUser = async (req, res, next) => {
  try {
    // بناخد الإيميل والباسورد اللي اليوزر كتبهم.
    const { email, password } = req.body;
    
    // بندور على اليوزر في قاعدة البيانات باستخدام الإيميل.
    // لاحظ إننا كاتبين select("+password") لأن الباسورد معمول له مخفي (select: false) في الـ Model كأمان.
    const user = await User.findOne({ email }).select("+password");

    // لو ملقيناش يوزر بالإيميل ده، بنقوله "البيانات غلط" (لأسباب أمنية مش بنقوله الإيميل مش موجود بالظبط).
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // بنقارن الباسورد اللي اليوزر كتبه بالباسورد المتشفر اللي عندنا في الداتا بيز باستخدام bcrypt.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // التأكد إن الحساب مش موقوف
    if (user.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended. Please contact support." });
    }

    // لو كل حاجة صح، بنطلع له توكن جديد.
    const token = generateToken({ id: user._id });

    // بنبعت بيانات اليوزر والتوكن للفرونت إند.
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
        role: user.role,
        status: user.status,
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
 * طلب استعادة كلمة المرور (التحقق من البيانات)
 */
const forgotPassword = async (req, res, next) => {
  try {
    let { email, username, phoneNumber } = req.body;

    // تنظيف اسم المستخدم من علامة @ إذا كانت موجودة في البداية
    if (username && username.startsWith("@")) {
      username = username.substring(1);
    }

    // البحث عن المستخدم بالبريد واسم المستخدم ورقم الهاتف معاً
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      username: username.toLowerCase(),
      phoneNumber: phoneNumber.trim()
    });

    if (!user) {
      return res.status(404).json({ message: "No user found with these details" });
    }

    // بدلاً من إرسال إيميل، سنقوم بتوليد توكن مؤقت وإرجاعه للفرونت إند 
    // ليتمكن المستخدم من تغيير الباسورد فوراً
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 600000; // 10 minutes only for security

    await user.save();

    res.status(200).json({ 
      message: "Identity verified! You can now reset your password.", 
      resetToken 
    });
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

module.exports = { registerUser, loginUser, googleAuth, getCurrentUser, forgotPassword, resetPassword };
