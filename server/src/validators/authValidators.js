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
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail()
    .custom((value) => {
      const allowedDomains = ["gmail.com", "outlook.com", "icloud.com", "yahoo.com", "hotmail.com"];
      const domain = value.split("@")[1];
      if (!allowedDomains.includes(domain)) {
        throw new Error("Only emails from Gmail, Outlook, iCloud, Yahoo, or Hotmail are allowed");
      }
      return true;
    }),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage("Please enter a valid phone number (10-15 digits)"),
  body("password")
    .isLength({ min: 8, max: 64 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"),
];

/**
 * قواعد التحقق لعملية تسجيل الدخول
 */
const loginValidator = [
  body("email").trim().isEmail().normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { registerValidator, loginValidator };
