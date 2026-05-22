/**
 * @file postValidators.js
 * @description شروط صحة بيانات "المنشورات".
 * بنتحقق إن البوست أو الكومنت فيه كلام، وبنحدد أقصى طول للكلام المكتوب عشان ميبقاش طويل زيادة عن اللزوم.
 */

const { body } = require("express-validator");

const postCreateValidator = [
  body("content")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Post content must be <= 2000 chars"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("imageUrl").optional().isString(),
  // التأكد من وجود محتوى أو صورة
  body().custom((value, { req }) => {
    if (!req.body.content && !req.body.imageUrl) {
      throw new Error("Post must have either content or an image");
    }
    return true;
  }),
];

const postUpdateValidator = [
  body("content").optional().trim().isLength({ min: 1, max: 2000 }),
  body("tags").optional().isArray(),
  body("imageUrl").optional().isString(),
];

const commentValidator = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Comment must be between 1 and 500 characters"),
];

module.exports = { postCreateValidator, postUpdateValidator, commentValidator };
