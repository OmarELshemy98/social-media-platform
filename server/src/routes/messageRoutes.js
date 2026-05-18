/**
 * @file messageRoutes.js
 * @description عناوين (Endpoints) الشات والرسائل.
 * بنحدد هنا المسارات اللي بنجيب منها المحادثات، وبنبدأ شات جديد، وبنبعت رسايل.
 */

const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  getMyConversations,
  getMessagesByConversation,
  sendMessage,
  startConversationByUsername,
} = require("../controllers/messageController");
const { sendMessageValidator } = require("../validators/messageValidators");

const router = express.Router();
router.use(protect);

router.get("/conversations", getMyConversations);
router.get("/conversations/:conversationId/messages", getMessagesByConversation);
router.post("/conversations/start", startConversationByUsername);
router.post("/", sendMessageValidator, validateRequest, sendMessage);

module.exports = router;
