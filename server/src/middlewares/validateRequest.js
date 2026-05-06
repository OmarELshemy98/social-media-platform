/**
 * @file validateRequest.js
 * @description برمجية وسيطة للتحقق من صحة البيانات المرسلة في الطلب باستخدام express-validator.
 */

const { validationResult } = require("express-validator");

/**
 * وظيفة للتحقق من وجود أخطاء بعد تطبيق القواعد (Validators)
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  // إذا كانت هناك أخطاء، قم بإرجاعها للمستخدم
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  // إذا كانت البيانات سليمة، انتقل للخطوة التالية
  return next();
};

module.exports = validateRequest;
