const express = require("express");
const router = express.Router();
const {
  signUp,
  login,
  getAllId,
  getMe,
  updateMe,
} = require("../controllers/UserController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", signUp);
router.post("/login", login);
router.get("/getallid", getAllId);

// user hiện tại
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
module.exports = router;