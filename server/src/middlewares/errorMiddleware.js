/**
 * @file errorMiddleware.js
 * @description برمجيات وسيطة لمعالجة الأخطاء والروابط غير الموجودة.
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
