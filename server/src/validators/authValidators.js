/**
 * @file authValidators.js
 * @description شروط صحة بيانات "الحسابات".
 */

// مكتبة express-validator: بنستخدمها عشان نتأكد إن البيانات اللي اليوزر بعتها سليمة قبل ما السيرفر يعالجها.
const { body } = require("express-validator");

/**
 * قواعد التحقق لعملية التسجيل (Register)
 */
const registerValidator = [
  // الاسم: لازم يكون موجود وطوله بين 2 و 60 حرف.
  body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be between 2 and 60 chars"),
  
  // اليوزر نيم: لازم يكون حروف وأرقام ونقطة أو شرطة بس.
  body("username")
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9_.]+$/)
    .withMessage("Username can contain letters, numbers, underscore and dot")
    .isLength({ min: 3, max: 24 }),
    
  // الإيميل: لازم يكون بصيغة ايميل صحيحة.
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(), // بيحول الإيميل لحروف صغيرة ويشيل النقط الزيادة (في Gmail).
    
  // الباسورد: لازم يكون قوي (8 حروف على الأقل).
  body("password")
    .isLength({ min: 8, max: 64 })
    .withMessage("Password must be at least 8 characters long"),
];

/**
 * قواعد التحقق لعملية تسجيل الدخول (Login)
 */
const loginValidator = [
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { registerValidator, loginValidator };
