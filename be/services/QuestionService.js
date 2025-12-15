const QuestionRepo = require("../repository/QuestionRepository");
const { generateVocabularyQuestions } = require("./GrokService");

const newQuestion = async (title, question, answer, name) => {
  const newQuestion = await QuestionRepo.newQuestion(
    title,
    question,
    answer,
    name
  );
  return newQuestion;
};

const getAllQuestion = async () => {
  return await QuestionRepo.getAllQuestion();
};

const updateQuestion = async (title, question, answer, id) => {
  return await QuestionRepo.updateQuestion(title, question, answer, id);
};

const removeQuestion = async (id_question) => {
  return await QuestionRepo.removeQuestion(id_question);
};

/**
 * Gọi Grok sinh câu hỏi và lưu vào DB
 */
const generateQuestionsWithAI = async ({ numQuestions, category, topic }) => {
  const questionsFromAI = await generateVocabularyQuestions({
    numQuestions,
    category,
    topic,
  });

  const createdQuestions = [];

  for (const q of questionsFromAI) {
    // đảm bảo format đúng schema Question
    if (!q.question || !Array.isArray(q.answer) || !q.name || !q.title) {
      // bỏ qua câu hỏi sai format để tránh crash
      continue;
    }

    const saved = await QuestionRepo.newQuestion(
      q.title,
      q.question,
      q.answer,
      q.name
    );
    createdQuestions.push(saved);
  }

  return createdQuestions;
};

module.exports = {
  newQuestion,
  getAllQuestion,
  updateQuestion,
  removeQuestion,
  generateQuestionsWithAI,
};