/**
 * @file uploadRoutes.js
 * @description عنوان (Endpoint) رفع الملفات.
 * المسار ده هو اللي بنبعت عليه الصور عشان تترفع على السيرفر.
 */

const express = require("express");
const upload = require("../config/multer");
const { protect } = require("../middlewares/authMiddleware");
const { uploadFile } = require("../controllers/uploadController");

const router = express.Router();

router.post("/", protect, upload.single("file"), uploadFile);

module.exports = router;
