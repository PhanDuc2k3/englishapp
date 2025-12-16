const express = require("express");
const router = express.Router();

const {
  newQuestion,
  getAllQuestion,
  updateQuestion,
  removeQuestion,
  generateAIQuestions,
  generateTOEICQuestionsByLevel,
} = require("../controllers/QuestionController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.post("/new", authMiddleware, newQuestion);
router.get("/getall", authMiddleware, getAllQuestion);
router.put("/update/:id", authMiddleware, updateQuestion);
router.delete("/delete/:id", authMiddleware, removeQuestion);

// 🔹 Chỉ admin mới được dùng AI sinh câu hỏi
router.post(
  "/generate-ai",
  authMiddleware,
  adminMiddleware,
  generateAIQuestions
);

// 🔹 Admin dùng AI sinh từ vựng TOEIC theo cấp độ (A1, A2, B1, B2, C1, C2)
router.post(
  "/generate-toeic",
  authMiddleware,
  adminMiddleware,
  generateTOEICQuestionsByLevel
);

module.exports = router;
