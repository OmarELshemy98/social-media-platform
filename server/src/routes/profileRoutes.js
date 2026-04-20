const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { getProfile, updateMyProfile } = require("../controllers/profileController");
const { updateProfileValidator } = require("../validators/profileValidators");

const router = express.Router();

router.get("/:username", protect, getProfile);
router.put("/me/update", protect, updateProfileValidator, validateRequest, updateMyProfile);

module.exports = router;
