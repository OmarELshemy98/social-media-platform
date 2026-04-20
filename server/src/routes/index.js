const express = require("express");
const authRoutes = require("./authRoutes");
const postRoutes = require("./postRoutes");
const profileRoutes = require("./profileRoutes");
const notificationRoutes = require("./notificationRoutes");
const searchRoutes = require("./searchRoutes");
const messageRoutes = require("./messageRoutes");
const uploadRoutes = require("./uploadRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "social-media-server" });
});

router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/profiles", profileRoutes);
router.use("/notifications", notificationRoutes);
router.use("/search", searchRoutes);
router.use("/messages", messageRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;
