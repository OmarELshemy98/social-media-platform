const { body } = require("express-validator");

const updateProfileValidator = [
  body("name").optional().trim().isLength({ min: 2, max: 60 }),
  body("bio").optional().trim().isLength({ max: 240 }),
  body("avatarUrl").optional().isString(),
];

module.exports = { updateProfileValidator };
