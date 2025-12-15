const User = require("../models/User.js");

const findEmail = async (email) => {
    return await User.findOne({ email });
}

const findId = async (id) => {
    return await User.findOne({ id });
}

const getAll = async () => {
    return await User.find().select('-password');
}

module.exports = {
    findEmail,
    getAll,
    findId
}