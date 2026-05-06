/**
 * @file authValidators.js
 * @description قواعد التحقق من صحة بيانات المصادقة (التسجيل ودخول المستخدم).
 */

const { body } = require("express-validator");

/**
 * قواعد التحقق لعملية التسجيل
 */
const registerValidator = [
  body("name").trim().isLength({ min: 2, max: 60 }),
  body("username")
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9_.]+$/)
    .withMessage("Username can contain letters, numbers, underscore and dot")
    .isLength({ min: 3, max: 24 }),
  body("email").trim().isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 6, max: 64 })
    .withMessage("Password must be between 6 and 64 characters"),
];

/**
 * قواعد التحقق لعملية تسجيل الدخول
 */
const loginValidator = [
  body("email").trim().isEmail().normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { registerValidator, loginValidator };
