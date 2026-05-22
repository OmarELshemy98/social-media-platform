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
    if (!req.file) {
      console.log("Upload error: No file found in request");
      return res.status(400).json({ message: "Please upload a file" });
    }

    console.log(`Uploading file: ${req.file.originalname} (${req.file.mimetype}), Size: ${req.file.size} bytes`);

    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.log("Upload error: File buffer is empty");
      return res.status(400).json({ message: "File content is empty" });
    }

    // تحويل الـ upload_stream لـ Promise عشان نقدر نستخدم await
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "social-sphere-uploads",
            resource_type: "auto",
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        uploadStream.end(buffer);
      });
    };

    const result = await streamUpload(req.file.buffer);

    return res.status(200).json({
      message: "File uploaded successfully",
      fileUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ message: "Failed to upload to Cloudinary", error: error.message });
  }
};

module.exports = { uploadFile };
