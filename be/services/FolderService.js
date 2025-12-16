const FolderRepo = require("../repository/FolderRepository");
const Task = require("../models/Task");

const getAllFolders = async () => {
    return await FolderRepo.getAllFolders();
};

const getFolderById = async (id) => {
    return await FolderRepo.getFolderById(id);
};

const createFolder = async ({ name, description, color, order }) => {
    if (!name || !name.trim()) {
        throw new Error("Tên folder không được để trống");
    }
    return await FolderRepo.createFolder(
        name.trim(),
        description || "",
        color || "#f9ab0e",
        order || 0
    );
};

const updateFolder = async (id, { name, description, color, order }) => {
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (order !== undefined) updateData.order = order;

    return await FolderRepo.updateFolder(id, updateData);
};

const deleteFolder = async (id) => {
    // Khi xóa folder, chuyển tất cả task trong folder đó về null (uncategorized)
    await Task.updateMany(
        { folder: id },
        { $set: { folder: null } }
    );
    
    return await FolderRepo.deleteFolder(id);
};

module.exports = {
    getAllFolders,
    getFolderById,
    createFolder,
    updateFolder,
    deleteFolder,
};

