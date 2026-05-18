/**
 * @file searchRoutes.js
 * @description عنوان (Endpoint) البحث.
 * مسار واحد بنستخدمه عشان نعمل بحث شامل في الموقع كله.
 */

const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { globalSearch } = require("../controllers/searchController");

const router = express.Router();

router.get("/", protect, globalSearch);

module.exports = router;
