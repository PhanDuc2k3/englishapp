const FolderService = require("../services/FolderService");

exports.getAllFolders = async (req, res) => {
    try {
        const folders = await FolderService.getAllFolders();
        res.status(200).json({
            message: "Lấy danh sách folder thành công",
            folders,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFolderById = async (req, res) => {
    try {
        const { id } = req.params;
        const folder = await FolderService.getFolderById(id);
        if (!folder) {
            return res.status(404).json({ message: "Folder không tồn tại" });
        }
        res.status(200).json({
            message: "Lấy folder thành công",
            folder,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createFolder = async (req, res) => {
    try {
        const { name, description, color, order } = req.body;
        const folder = await FolderService.createFolder({
            name,
            description,
            color,
            order,
        });
        res.status(200).json({
            message: "Tạo folder thành công",
            folder,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, order } = req.body;
        const folder = await FolderService.updateFolder(id, {
            name,
            description,
            color,
            order,
        });
        if (!folder) {
            return res.status(404).json({ message: "Folder không tồn tại" });
        }
        res.status(200).json({
            message: "Cập nhật folder thành công",
            folder,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const folder = await FolderService.deleteFolder(id);
        if (!folder) {
            return res.status(404).json({ message: "Folder không tồn tại" });
        }
        res.status(200).json({
            message: "Xóa folder thành công. Các task trong folder đã được chuyển về 'Chưa phân loại'",
            folder,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

