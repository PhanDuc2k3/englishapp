const mongoose = require("mongoose");

const redeemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gift",
      required: true,
    },
    giftName: {
      type: String,
      required: true,
    },
    giftPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Đang chờ", "Đã chuyển"],
      default: "Đang chờ",
    },
    bankName: String,
    bankAccountName: String,
    bankAccountNumber: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("RedeemRequest", redeemSchema);


