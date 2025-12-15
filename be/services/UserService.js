const User = require("../models/User");
const userRepo = require("../repository/UserRepository");
const { uploadImage } = require("./UploadService");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // ✅ Thêm dòng này
const SECRET_KEY = "your_secret_key";

const signUp = async (username, email, password) => {
  const user = await userRepo.findEmail(email);
  if (user) throw new Error("Tài khoản đã tồn tại");

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashPassword, email });
  await newUser.save();
  return newUser;
};

const login = async (email, password) => {
  const user = await userRepo.findEmail(email);
  if (!user) throw new Error("Tài khoản hoặc mật khẩu không đúng");

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new Error("Tài khoản hoặc mật khẩu không đúng");

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    SECRET_KEY,
    { expiresIn: "7d" }
  );

  return { user, token };
};

const getAllId = async () => {
  return await userRepo.getAll();
};

// Lấy thông tin user hiện tại từ id
const getMe = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("User không tồn tại");
  return user;
};

// Cập nhật thông tin + avatar + ngân hàng
const updateMe = async (
  userId,
  { username, avatarBase64, bankName, bankAccountName, bankAccountNumber }
) => {
  const updateData = {};
  if (username) updateData.username = username;

  // Thông tin ngân hàng
  if (bankName !== undefined) updateData.bankName = bankName;
  if (bankAccountName !== undefined)
    updateData.bankAccountName = bankAccountName;
  if (bankAccountNumber !== undefined)
    updateData.bankAccountNumber = bankAccountNumber;

  if (avatarBase64) {
    const avatarUrl = await uploadImage(avatarBase64);
    updateData.avatar = avatarUrl;
  }

  const updated = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!updated) throw new Error("User không tồn tại");

  return updated;
};

module.exports = {
  signUp,
  login,
  getAllId,
  getMe,
  updateMe,
};
