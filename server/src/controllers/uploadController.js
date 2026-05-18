/**
 * @file uploadController.js
 * @description الفايل ده مسؤول عن "رفع الصور" لـ Cloudinary والرد على الكلاينت.
 */

const cloudinary = require("../config/cloudinary");

/**
 * وظيفة معالجة الملف بعد رفعه
 */
const uploadFile = async (req, res, next) => {
  try {
    // مكتبة Multer اللي شغالة في الـ Route هي اللي استقبلت الملف في الـ Buffer.
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    // رفع الملف من الـ Buffer إلى Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "social-sphere-uploads", // اسم الفولدر في Cloudinary
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Failed to upload image to Cloudinary" });
        }

        // بنرد بالرابط اللي جه من Cloudinary.
        return res.status(200).json({
          message: "File uploaded successfully",
          fileUrl: result.secure_url,
        });
      }
    );

    // كتابة الـ buffer في الـ stream
    uploadStream.end(req.file.buffer);
  } catch (error) {
    return next(error);
  }
};

module.exports = { uploadFile };
