const QuestionRepo = require("../repository/QuestionRepository");
const { generateVocabularyQuestions, generateTOEICVocabularyByLevel } = require("./GrokService");

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

/**
 * Gọi Grok sinh từ vựng TOEIC theo cấp độ và lưu vào DB
 */
const generateTOEICQuestionsByLevel = async ({ numQuestions, level }) => {
  // Validate level
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (!validLevels.includes(level)) {
    throw new Error(`Cấp độ không hợp lệ. Chỉ chấp nhận: ${validLevels.join(', ')}`);
  }

  const questionsFromAI = await generateTOEICVocabularyByLevel({
    numQuestions,
    level,
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
      q.name,
      q.level || level // sử dụng level từ AI hoặc level được truyền vào
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
  generateTOEICQuestionsByLevel,
};