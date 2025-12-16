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
    },
    level: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
        default: null
    }
},{timestamps:true})

module.exports = mongoose.model("Question",questionSchema);