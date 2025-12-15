const mongoose = require("mongoose");

const giftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number, // giá đổi (điểm/đồng)
      required: true,
      min: 0,
    },
    image: {
      type: String, // url ảnh
      default: "",
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gift", giftSchema);


