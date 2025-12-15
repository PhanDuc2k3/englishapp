const GiftService = require("../services/GiftService");

exports.getAll = async (req, res) => {
  try {
    const gifts = await GiftService.getAllGifts();
    res.status(200).json({
      message: "Lấy danh sách quà tặng thành công",
      gifts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, price, stock, imageBase64 } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: "Thiếu tên hoặc giá quà tặng" });
    }

    const gift = await GiftService.createGift({
      name,
      description,
      price,
      stock,
      imageBase64,
    });

    res.status(201).json({
      message: "Tạo quà tặng thành công",
      gift,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, imageBase64 } = req.body;

    const gift = await GiftService.updateGift(id, {
      name,
      description,
      price,
      stock,
      imageBase64,
    });

    res.status(200).json({
      message: "Cập nhật quà tặng thành công",
      gift,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const gift = await GiftService.deleteGift(id);

    res.status(200).json({
      message: "Xoá quà tặng thành công",
      gift,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User đổi quà
exports.redeem = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Thiếu thông tin user. Vui lòng đăng nhập lại." });
    }

    const { id } = req.params;
    const result = await GiftService.redeemGift(id, userId);

    res.status(200).json({
      message: "Tạo yêu cầu đổi quà thành công",
      ...result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin xem tất cả yêu cầu đổi quà
exports.getRedeems = async (req, res) => {
  try {
    const redeems = await GiftService.getAllRedeems();
    res.status(200).json({
      message: "Lấy danh sách yêu cầu đổi quà thành công",
      redeems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin cập nhật trạng thái (Đang chờ / Đã chuyển)
exports.updateRedeemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const redeem = await GiftService.updateRedeemStatus(id, status);

    res.status(200).json({
      message: "Cập nhật trạng thái yêu cầu thành công",
      redeem,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lịch sử đổi quà của user hiện tại
exports.getMyRedeems = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Thiếu thông tin user. Vui lòng đăng nhập lại." });
    }

    const redeems = await GiftService.getRedeemsByUser(userId);

    res.status(200).json({
      message: "Lấy lịch sử đổi quà thành công",
      redeems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
