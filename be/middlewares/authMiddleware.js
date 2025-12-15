const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "Không có token, vui lòng đăng nhập" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // ✅ gắn thông tin user vào req
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ hoặc hết hạn" });
  }
};

module.exports = authMiddleware;
