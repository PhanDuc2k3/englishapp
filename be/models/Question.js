const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        require: true
    },
    answer: [{
        text: {
            type: String,
            required: true
        },
        isCorrect: {
            type: Boolean,
            required: true
        }
    }],
    title: {
        type: String, 
        required: true
    },
    name: {
        type: String,
        required: true
    }
},{timestamps:true})

module.exports = mongoose.model("Question",questionSchema);