/**
 * @file errorMiddleware.js
 * @description الفايل ده مسؤول عن "إدارة الأخطاء".
 * بدل ما السيرفر يقع أو يطلع شاشة سودة لما يحصل غلط، الفايل ده بيمسك الخطأ ويطلعه لليوزر بشكل منظم.
 * كمان فيه جزء الـ 404، لو حد دخل على لينك مش موجود في السيرفر بتاعنا.
 */

/**
 * معالجة المسارات غير الموجودة (404)
 */
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found: ${req.originalUrl}`));
};

/**
 * معالج الأخطاء العام للتطبيق
 */
const errorHandler = (err, req, res, next) => {
  // تحديد رمز الحالة (Status Code)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    // إخفاء الـ Stack Trace في بيئة الإنتاج لأسباب أمنية
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
