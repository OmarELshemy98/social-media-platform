/**
 * @file uploadController.js
 * @description الفايل ده مسؤول عن "رفع الصور" والرد على الكلاينت.
 */

/**
 * وظيفة معالجة الملف بعد رفعه
 */
const uploadFile = async (req, res) => {
  // مكتبة Multer اللي شغالة في الـ Route هي اللي رفعت الملف فعلياً.
  // لو الملف مش موجود، بنرجع غلط.
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file" });
  }

  // بنجهز رابط الصورة (URL) اللي الفرونت إند هيستخدمه عشان يعرضها.
  // الرابط ده بيتكون من البروتوكول (http) واسم السيرفر (localhost) وفولدر الـ uploads واسم الملف اللي Multer ولده.
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  // بنرد بالرابط الجديد.
  return res.status(200).json({
    message: "File uploaded successfully",
    fileUrl,
  });
};

module.exports = { uploadFile };
