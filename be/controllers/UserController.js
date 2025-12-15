const userService = require("../services/UserService");

exports.signUp = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = await userService.signUp(username, email,password);
        res.status(200).json({
            message: "Dang ky thanh cong",
            user: user
        })
    }
    catch (error) {
        res.status(500).json({message:error.message})
    }


}

exports.login = async (req, res) => {

    try {
    const { email, password } = req.body;
    const { user, token } = await userService.login(email, password);
    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        point: user.point || 0,
        avatar: user.avatar || "",
        bankName: user.bankName || "",
        bankAccountName: user.bankAccountName || "",
        bankAccountNumber: user.bankAccountNumber || "",
      },
      token, // gửi token cho client
    });   
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.getAllId = async (req, res) => {
    try {
        const user = await userService.getAllId();
        res.status(200).json({
            message: "Lay thong tin thanh cong",
            user: user
        })
        
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

// Lấy thông tin user hiện tại (từ token)
exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Thiếu thông tin user. Vui lòng đăng nhập lại." });
    }

    const user = await userService.getMe(userId);

    res.status(200).json({
      message: "Lấy thông tin người dùng thành công",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin + avatar + ngân hàng
exports.updateMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Thiếu thông tin user. Vui lòng đăng nhập lại." });
    }

    const { username, avatarBase64, bankName, bankAccountName, bankAccountNumber } = req.body;

    const updated = await userService.updateMe(userId, {
      username,
      avatarBase64,
      bankName,
      bankAccountName,
      bankAccountNumber,
    });

    res.status(200).json({
      message: "Cập nhật thông tin thành công",
      user: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};