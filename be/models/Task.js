const mongoose = require('mongoose');
const question = require("./Question");

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    question: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Question"
    }],
    user: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            } ,
            submitted: {
                type: Boolean,
                default: false
            },
            score:{
                type: Number,
                default: 0
            },
            answers: [{
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref:"Question"
                },
                selectedAnswer: {
                    type: String,
                    required: true
                },
                isCorrect: {
                    type: Boolean
                }
            }]
        }
    ]
},{timestamps: true})

module.exports = mongoose.model("Task", taskSchema);