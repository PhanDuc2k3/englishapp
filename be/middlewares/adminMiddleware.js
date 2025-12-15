const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Chỉ admin mới được phép sử dụng chức năng này" });
  }
  next();
};

module.exports = adminMiddleware;


