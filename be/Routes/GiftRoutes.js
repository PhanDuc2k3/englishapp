const express = require("express");
const router = express.Router();

const {
  getAll,
  create,
  update,
  remove,
  redeem,
  getRedeems,
  updateRedeemStatus,
  getMyRedeems,
} = require("../controllers/GiftController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Public: xem danh sách quà
router.get("/", getAll);

// Admin: thêm / sửa / xoá
router.post("/", authMiddleware, adminMiddleware, create);
router.put("/:id", authMiddleware, adminMiddleware, update);
router.delete("/:id", authMiddleware, adminMiddleware, remove);

// User: đổi quà
router.post("/:id/redeem", authMiddleware, redeem);
router.get("/redeem/my", authMiddleware, getMyRedeems);

// Admin: quản lý yêu cầu đổi quà
router.get("/redeem/list", authMiddleware, adminMiddleware, getRedeems);
router.put(
  "/redeem/:id/status",
  authMiddleware,
  adminMiddleware,
  updateRedeemStatus
);

module.exports = router;


