const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload 1 file base64 hoặc url tạm lên Cloudinary, trả về secure_url
 * @param {string} file base64 string (data:image/...) hoặc đường dẫn tạm
 */
const uploadImage = async (file) => {
  if (!file) return "";

  const result = await cloudinary.uploader.upload(file, {
    folder: "todo-avatar",
    resource_type: "image",
  });

  return result.secure_url;
};

module.exports = {
  uploadImage,
};


