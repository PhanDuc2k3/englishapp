const express = require("express");
const router = express.Router();

const {
    getAllFolders,
    getFolderById,
    createFolder,
    updateFolder,
    deleteFolder,
} = require("../controllers/FolderController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Tất cả user đều có thể xem folder
router.get("/getall", authMiddleware, getAllFolders);
router.get("/:id", authMiddleware, getFolderById);

// Chỉ admin mới được tạo, sửa, xóa folder
router.post("/new", authMiddleware, adminMiddleware, createFolder);
router.put("/update/:id", authMiddleware, adminMiddleware, updateFolder);
router.delete("/delete/:id", authMiddleware, adminMiddleware, deleteFolder);

module.exports = router;

