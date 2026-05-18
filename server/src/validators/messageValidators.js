/**
 * @file messageValidators.js
 * @description شروط صحة بيانات "الرسائل".
 * بنتحقق إن الرسالة مش فاضية وإن اليوزر اللي باعتين له الرسالة موجود فعلاً.
 */

const { body } = require("express-validator");

const sendMessageValidator = [
  body("receiverId").isMongoId().withMessage("receiverId must be a valid MongoDB id"),
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message content must be 1-1000 chars"),
];

module.exports = { sendMessageValidator };
