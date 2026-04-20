const { body } = require("express-validator");

const postCreateValidator = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Post content is required and must be <= 2000 chars"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("imageUrl").optional().isString(),
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
