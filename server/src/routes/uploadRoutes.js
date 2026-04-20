const express = require("express");
const upload = require("../config/multer");
const { protect } = require("../middlewares/authMiddleware");
const { uploadFile } = require("../controllers/uploadController");

const router = express.Router();

router.post("/", protect, upload.single("file"), uploadFile);

module.exports = router;
