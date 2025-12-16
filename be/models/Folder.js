const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    color: {
        type: String,
        default: "#f9ab0e" // Màu mặc định
    },
    order: {
        type: Number,
        default: 0 // Thứ tự sắp xếp
    }
}, { timestamps: true });

module.exports = mongoose.model("Folder", folderSchema);

