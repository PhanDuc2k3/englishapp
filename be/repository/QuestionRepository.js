const Question = require("../models/Question");

const newQuestion = async (title, question, answer,name) => {
    const newQuestion = new Question({title, question, answer,name});
    await newQuestion.save();
    return newQuestion;
}

const getAllQuestion = async () => {
    return await Question.find();
}

const updateQuestion = async (title, question, answer,id) => {
    const updateData = {title, question, answer}
    const updateQuestion = await Question.findByIdAndUpdate(id,updateData, { new: true, runValidators: true });
    return updateQuestion;
}


const isCorrectAnswer = async (id_question, selectedAnswer) => {
  const question = await Question.findById(id_question);
  if (!question) throw new Error("Không tồn tại câu hỏi");

  const isCorrect = question.answer.some(
    (a) =>
      a.text.trim().toLowerCase() === selectedAnswer.trim().toLowerCase() &&
      a.isCorrect === true
  );

  return isCorrect;
};

const findByIdQuestion = async (id_question) => {
    const question = await Question.findById(id_question);
    return question;
}
const removeQuestion = async (id_question) => {
  const task = await Question.findByIdAndDelete(id_question);
  return task;
};

module.exports = {
    newQuestion,
    getAllQuestion,
    updateQuestion,
    isCorrectAnswer,
    findByIdQuestion,
    removeQuestion
}