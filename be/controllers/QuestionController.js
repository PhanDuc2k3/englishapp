const QuestionService = require("../services/QuestionService");

exports.newQuestion = async (req, res) => {
  try {
    const { title, question, answer, name } = req.body;
    const newQuestion = await QuestionService.newQuestion(
      title,
      question,
      answer,
      name
    );
    res.status(200).json({
      message: "Tạo câu hỏi thành công",
      question: newQuestion,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllQuestion = async (req, res) => {
  try {
    const getAllQuestion = await QuestionService.getAllQuestion();
    res.status(200).json({
      message: "Lấy dữ liệu thành công",
      question: getAllQuestion,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { title, question, answer } = req.body;
    const id = req.params.id;
    console.log("id:", id);
    const updateQuestion = await QuestionService.updateQuestion(
      title,
      question,
      answer,
      id
    );
    res.status(200).json({
      message: "Cập nhật thành công",
      Question: updateQuestion,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeQuestion = async (req, res) => {
  try {
    const id_question = req.params.id;

    const deleted = await QuestionService.removeQuestion(id_question);

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy câu hỏi để xóa" });
    }

    res.status(200).json({
      message: "Xóa thành công",
      question: deleted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Admin dùng Grok để sinh câu hỏi tự động
exports.generateAIQuestions = async (req, res) => {
  try {
    const { numQuestions, category, topic } = req.body;

    const count = Number(numQuestions) || 5;
    const safeCategory = category || "vocabulary";
    const safeTopic = topic || "general";

    const created = await QuestionService.generateQuestionsWithAI({
      numQuestions: count,
      category: safeCategory,
      topic: safeTopic,
    });

    res.status(200).json({
      message: "Sinh câu hỏi AI thành công",
      total: created.length,
      questions: created,
    });
  } catch (error) {
    console.error("Lỗi generateAIQuestions:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Admin dùng Grok để sinh từ vựng TOEIC theo cấp độ
exports.generateTOEICQuestionsByLevel = async (req, res) => {
  try {
    const { numQuestions, level } = req.body;

    const count = Number(numQuestions) || 10;
    const safeLevel = level || "B1";

    const created = await QuestionService.generateTOEICQuestionsByLevel({
      numQuestions: count,
      level: safeLevel,
    });

    res.status(200).json({
      message: `Sinh từ vựng TOEIC cấp độ ${safeLevel} thành công`,
      total: created.length,
      level: safeLevel,
      questions: created,
    });
  } catch (error) {
    console.error("Lỗi generateTOEICQuestionsByLevel:", error);
    res.status(500).json({ message: error.message });
  }
};