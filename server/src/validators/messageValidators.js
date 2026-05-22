/**
 * @file messageValidators.js
 * @description شروط صحة بيانات "الرسائل".
 * بنتحقق إن الرسالة مش فاضية وإن اليوزر اللي باعتين له الرسالة موجود فعلاً.
 */

const { body } = require("express-validator");

const sendMessageValidator = [
  body("receiverId").isMongoId().withMessage("receiverId must be a valid MongoDB id"),
  body("content")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Message content must be max 1000 chars"),
  // التأكد من وجود محتوى أو ميديا
  body().custom((value, { req }) => {
    if (!req.body.content && !req.body.mediaUrl) {
      throw new Error("Message must have either content or media");
    }
    return true;
  }),
];

module.exports = { sendMessageValidator };
