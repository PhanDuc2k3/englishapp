const Gift = require("../models/Gift");
const RedeemRequest = require("../models/RedeemRequest");
const User = require("../models/User");
const { uploadImage } = require("./UploadService");

const getAllGifts = async () => {
  return await Gift.find().sort({ createdAt: -1 });
};

const createGift = async ({ name, description, price, stock, imageBase64 }) => {
  let image = "";
  if (imageBase64) {
    image = await uploadImage(imageBase64);
  }

  const gift = new Gift({
    name,
    description,
    price,
    stock,
    image,
  });

  await gift.save();
  return gift;
};

const updateGift = async (id, { name, description, price, stock, imageBase64 }) => {
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = price;
  if (stock !== undefined) updateData.stock = stock;

  if (imageBase64) {
    const image = await uploadImage(imageBase64);
    updateData.image = image;
  }

  const gift = await Gift.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!gift) throw new Error("Quà tặng không tồn tại");
  return gift;
};

const deleteGift = async (id) => {
  const gift = await Gift.findByIdAndDelete(id);
  if (!gift) throw new Error("Quà tặng không tồn tại");
  return gift;
};

// User đổi quà
const redeemGift = async (giftId, userId) => {
  const gift = await Gift.findById(giftId);
  if (!gift) throw new Error("Quà tặng không tồn tại");

  const user = await User.findById(userId);
  if (!user) throw new Error("User không tồn tại");

  if (!user.bankName || !user.bankAccountName || !user.bankAccountNumber) {
    throw new Error("Vui lòng cập nhật thông tin ngân hàng trong trang cá nhân trước khi đổi quà.");
  }

  if ((user.point || 0) < gift.price) {
    throw new Error("Bạn không đủ điểm để đổi quà này.");
  }

  // Trừ điểm
  user.point = (user.point || 0) - gift.price;
  await user.save();

  // Tạo yêu cầu đổi quà
  const redeem = new RedeemRequest({
    user: user._id,
    gift: gift._id,
    giftName: gift.name,
    giftPrice: gift.price,
    status: "Đang chờ",
    bankName: user.bankName,
    bankAccountName: user.bankAccountName,
    bankAccountNumber: user.bankAccountNumber,
  });

  await redeem.save();

  return { redeem, currentPoint: user.point };
};

// Admin xem tất cả yêu cầu
const getAllRedeems = async () => {
  return await RedeemRequest.find()
    .populate("user", "username email avatar")
    .populate("gift", "name price")
    .sort({ createdAt: -1 });
};

// Admin cập nhật trạng thái
const updateRedeemStatus = async (id, status) => {
  if (!["Đang chờ", "Đã chuyển"].includes(status)) {
    throw new Error("Trạng thái không hợp lệ");
  }

  const redeem = await RedeemRequest.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("user", "username email avatar")
    .populate("gift", "name price");

  if (!redeem) throw new Error("Yêu cầu đổi quà không tồn tại");
  return redeem;
};

// Lịch sử đổi quà của 1 user
const getRedeemsByUser = async (userId) => {
  return await RedeemRequest.find({ user: userId })
    .populate("gift", "name price")
    .sort({ createdAt: -1 });
};

module.exports = {
  getAllGifts,
  createGift,
  updateGift,
  deleteGift,
  redeemGift,
  getAllRedeems,
  updateRedeemStatus,
  getRedeemsByUser,
};


