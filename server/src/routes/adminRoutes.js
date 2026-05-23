const express = require("express");
const { protect, isAdmin } = require("../middlewares/authMiddleware");
const {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  deleteAnyPost,
  makeAdmin
} = require("../controllers/adminController");

const router = express.Router();

// كل المسارات هنا محتاجة تسجيل دخول وصلاحيات آدمن
router.use(protect);
router.use(isAdmin);

router.get("/users", getAllUsers);
router.put("/users/:userId/toggle-status", toggleUserStatus);
router.delete("/users/:userId", deleteUser);
router.put("/users/:userId/make-admin", makeAdmin);
router.delete("/posts/:postId", deleteAnyPost);

module.exports = router;
