const mongoose = require("mongoose");

const connectDB = async () => {
  try {
      const connect = await mongoose.connect(process.env.MONGODB);
  console.log("Ket noi db thanh cong")
  } catch(error) {
    throw error
  }

}

module.exports = connectDB;