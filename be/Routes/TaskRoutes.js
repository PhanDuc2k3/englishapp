const express = require("express");
const router = express.Router();

// Import controller
const {
  newTask,
  getAllTask,
  updateTask,
  addQuestion,
  addUser,
  removeUser,
  removeQuestion,
  submitTask,
  saveProgress,
  removeTask,
  getById,
  getLeaderboard,
  getHistoryByUser,
  recalculatePointsFromHistory,
} = require("../controllers/TaskController");

// ✅ Import middleware xác thực
const authMiddleware = require("../middlewares/authMiddleware");

// ✅ Route cần đăng nhập mới được thực hiện
router.post("/newtask", authMiddleware, newTask);
router.get("/getall", getAllTask);
router.put("/updatetask/:id", authMiddleware, updateTask);
router.put("/addquestion/:id", authMiddleware, addQuestion);
router.put("/adduser/:id", authMiddleware, addUser);
router.delete("/removeuser/:id", authMiddleware, removeUser);
router.delete("/removequestion/:id", authMiddleware, removeQuestion);
router.post("/submittask/:id", authMiddleware, submitTask);
router.put("/saveprogress/:id", authMiddleware, saveProgress);
router.delete("/delete/:id", authMiddleware, removeTask);

// ⚠️ Các route cụ thể phải khai báo TRƯỚC route động "/:id"
router.get("/user/history", authMiddleware, getHistoryByUser);
router.put(
  "/user/recalculate-points",
  authMiddleware,
  recalculatePointsFromHistory
);
router.get("/:id/leaderboard", authMiddleware, getLeaderboard);
router.get("/:id", authMiddleware, getById); // <-- lấy task theo id

module.exports = router;
