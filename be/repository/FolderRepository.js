const Folder = require("../models/Folder");

const getAllFolders = async () => {
    // Sắp xếp: mới nhất trước (createdAt DESC)
    return await Folder.find().sort({ createdAt: -1 });
};

const getFolderById = async (id) => {
    return await Folder.findById(id);
};

const createFolder = async (name, description = "", color = "#f9ab0e", order = 0) => {
    const newFolder = new Folder({ name, description, color, order });
    await newFolder.save();
    return newFolder;
};

const updateFolder = async (id, updateData) => {
    return await Folder.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );
};

const deleteFolder = async (id) => {
    return await Folder.findByIdAndDelete(id);
};

module.exports = {
    getAllFolders,
    getFolderById,
    createFolder,
    updateFolder,
    deleteFolder,
};

