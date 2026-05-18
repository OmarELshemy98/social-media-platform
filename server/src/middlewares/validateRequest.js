/**
 * @file validateRequest.js
 * @description الفايل ده هو "المراجع" بتاع البيانات.
 * قبل ما السيرفر ينفذ أي طلب، بيتأكد الأول إن البيانات اللي بعتها اليوزر (زي الايميل والباسورد) سليمة ومطابقة للشروط.
 * لو في أي غلط (مثلاً الايميل مش مكتوب صح)، بيوقف الطلب ويرجع لليوزر يقوله إيه الغلط بالظبط.
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
