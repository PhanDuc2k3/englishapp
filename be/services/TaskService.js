const Task = require("../models/Task");
const User = require("../models/User");
const taskRepo = require("../repository/TaskRepository");
const questionRepo = require("../repository/QuestionRepository");
const QuestionService = require("./QuestionService");
const Question = require("../models/Question");

/**
 * Tạo task mới
 * - mode = "ai": sinh câu hỏi bằng AI rồi gắn vào task
 * - mode = "auto": tự động ghép câu hỏi có sẵn theo chủ đề
 * - mode khác / không truyền: chỉ tạo task rỗng
 */
const newTask = async ({
  name,
  mode,
  numQuestions,
  category,
  topic,
}) => {
  const creationMode = mode || "manual";
  const count = Number(numQuestions) || 5;
  const safeCategory = category || "vocabulary";
  const safeTopic = topic || "";

  let questionIds = [];

  if (creationMode === "ai") {
    // Gọi AI sinh câu hỏi & lưu DB
    const createdQuestions = await QuestionService.generateQuestionsWithAI({
      numQuestions: count,
      category: safeCategory,
      topic: safeTopic,
    });
    questionIds = createdQuestions.map((q) => q._id);
  } else if (creationMode === "auto") {
    // Lọc câu hỏi có sẵn theo chủ đề (title chứa topic, tiếng Việt cũng được)
    const filter = {};
    if (safeTopic) {
      filter.title = { $regex: safeTopic, $options: "i" };
    }
    // Tạm thời category chưa lưu riêng nên bỏ qua hoặc dùng thêm filter.name nếu muốn
    const existingQuestions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .limit(count)
      .lean();

    questionIds = existingQuestions.map((q) => q._id);
  }

  const newTask = new Task({
    name,
    question: questionIds,
  });
  await newTask.save();
  return newTask;
};
const getAllTask = async () => {
    return await taskRepo.getAllTask();
}

const removeTask = async (id_task) => {
  return await taskRepo.removeTask(id_task);
}

const updateTask = async (id_task,id_question) => {
    const existingQuestion = await taskRepo.findIdQuestion(id_task, id_question);
    if (!existingQuestion) throw new Error("Cau hoi khong ton tai");
    return await taskRepo.updateTask(id_task, id_question);
}

const addQuestion = async (id_task, id_question) => {
    const existingQuestion = await taskRepo.findIdQuestion(id_task, id_question);
    if (existingQuestion) throw new Error("Cau hoi da ton tai");
    return await taskRepo.addQuestion(id_task, id_question);
}

const removeQuestion = async (id_task, id_question) => {
    const existingQuestion = await taskRepo.findIdQuestion(id_task, id_question);
    if (!existingQuestion) throw new Error("Cau hoi khong ton tai");
    return await taskRepo.removeQuestion(id_task, id_question);
}
const addUser = async (id_task, id_user) => {
  const existingUserIndex = await taskRepo.findUserId(id_task, id_user);

  // findUserId trả về -1 nếu không tìm thấy, ngược lại là index (0,1,2,...)
  if (existingUserIndex !== -1) {
    throw new Error("Người dùng đã tham gia");
  }

  const user = await taskRepo.addUser(id_task, id_user);
  return user;
};

const removeUser = async (id_task, id_user) => {
  const existingUserIndex = await taskRepo.findUserId(id_task, id_user);

  // Không tìm thấy user trong task
  if (existingUserIndex === -1) {
    throw new Error("Không tìm thấy người dùng cần xóa");
  }

  const user = await taskRepo.removeUser(id_task, id_user);
  return user;
};
const submitAnswer = async (id_task, id_user, answers) => {
  const task = await taskRepo.findByIdTask(id_task);
  if (!task) throw new Error("Không tồn tại task");

  const userIndex = await taskRepo.findUserId(id_task, id_user);
  if (userIndex === -1) throw new Error("Không tồn tại user trong task");

  const user = task.user[userIndex];

  // Đã nộp bài rồi thì không cho nộp lại
  if (user.submitted) {
    throw new Error("Bạn đã nộp bài cho bài kiểm tra này, không thể làm lại.");
  }

  for (const { id_question, selectedAnswer } of answers) {
    const questionId = await taskRepo.findIdQuestion(id_task, id_question);
    if (!questionId) continue;

    const question = await questionRepo.findByIdQuestion(id_question);
    if (!question) continue;

    // selectedAnswer đang là ID của answer, cần map sang text
    const answerDoc = question.answer.id(selectedAnswer);
    const selectedText = answerDoc ? answerDoc.text : selectedAnswer;

    const isCorrect = await questionRepo.isCorrectAnswer(
      id_question,
      selectedText
    );

    taskRepo.updateAnswer(user, question, selectedAnswer, isCorrect);
  }

  const totalQuestions =
    Array.isArray(task.question) && task.question.length > 0
      ? task.question.length
      : user.answers.length;

  const correctCount = taskRepo.Total(user);

  // Điểm học tập (0 - 10)
  const score10 =
    totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;
  user.score = Number(score10.toFixed(2));
  user.submitted = true;

  // Tiền nhận được cho task này (0 - 1000 đồng)
  const money =
    totalQuestions > 0 ? Math.floor((correctCount / totalQuestions) * 1000) : 0;

  // Cộng tiền vào ví của user (field point) và lấy số dư mới
  let updatedUser = null;
  if (money > 0) {
    updatedUser = await User.findByIdAndUpdate(
      id_user,
      { $inc: { point: money } },
      { new: true }
    );
  }

  task.markModified(`user.${userIndex}.answers`);
  task.markModified(`user.${userIndex}.score`);
  task.markModified(`user.${userIndex}.submitted`);

  try {
    await task.save();
  } catch (err) {
    // Nếu task đã bị xoá / thay đổi version trong lúc lưu -> báo lỗi thân thiện
    if (err && err.name === "VersionError") {
      throw new Error(
        "Bài kiểm tra đã được cập nhật hoặc xoá, vui lòng tải lại trang và tham gia lại."
      );
    }
    throw err;
  }

  return {
    message: "Nộp thành công",
    task,
    reward: {
      correctCount,
      totalQuestions,
      score: user.score,
      money,
      currentPoint: updatedUser ? updatedUser.point : undefined,
    },
  };
};

// Lưu tiến độ làm bài (chỉ lưu đáp án, không khóa bài)
const saveProgress = async (id_task, id_user, answers) => {
  const task = await taskRepo.findByIdTask(id_task);
  if (!task) throw new Error("Không tồn tại task");

  const userIndex = await taskRepo.findUserId(id_task, id_user);
  if (userIndex === -1) throw new Error("Không tồn tại user trong task");

  const user = task.user[userIndex];

  if (user.submitted) {
    throw new Error("Bạn đã nộp bài, không thể thay đổi đáp án.");
  }

  for (const { id_question, selectedAnswer } of answers) {
    const questionId = await taskRepo.findIdQuestion(id_task, id_question);
    if (!questionId) continue;

    const question = await questionRepo.findByIdQuestion(id_question);
    if (!question) continue;

    const answerDoc = question.answer.id(selectedAnswer);
    const selectedText = answerDoc ? answerDoc.text : selectedAnswer;

    const isCorrect = await questionRepo.isCorrectAnswer(
      id_question,
      selectedText
    );

    taskRepo.updateAnswer(user, question, selectedAnswer, isCorrect);
  }

  // Điểm tạm thời (thang 0 - 10, không cộng tiền ví cho đến khi nộp)
  const totalQuestions =
    Array.isArray(task.question) && task.question.length > 0
      ? task.question.length
      : user.answers.length;
  const correctCount = taskRepo.Total(user);
  const score10 =
    totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;
  user.score = Number(score10.toFixed(2));

  task.markModified(`user.${userIndex}.answers`);
  task.markModified(`user.${userIndex}.score`);

  await task.save();

  return {
    message: "Lưu tiến độ thành công",
    task,
  };
};
const getTaskById = async (id) => {
  const task = await taskRepo.findByIdTask(id);
  if (!task) throw new Error("Task không tồn tại");
  return task;
};

// Lấy leaderboard cho 1 task
const getLeaderboard = async (id_task) => {
  const task = await Task.findById(id_task)
    .populate("user.user", "username email avatar point")
    .lean();
  if (!task) throw new Error("Task không tồn tại");

  const totalQuestions = Array.isArray(task.question)
    ? task.question.length
    : 0;

  const leaderboard = (task.user || [])
    .filter((u) => u.submitted) // chỉ tính user đã nộp bài
    .map((u) => {
      const correctCount =
        u.answers?.filter((a) => a.isCorrect).length || 0;
      const score10 =
        totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;
      const money =
        totalQuestions > 0
          ? Math.floor((correctCount / totalQuestions) * 1000)
          : 0;

      return {
        userId: u.user?._id || u.user,
        username: u.user?.username || "Ẩn danh",
        email: u.user?.email || "",
        avatar: u.user?.avatar || "",
        correctCount,
        totalQuestions,
        score: Number(score10.toFixed(2)),
        money,
      };
    })
    .sort((a, b) => b.score - a.score || b.money - a.money);

  return { taskId: task._id, name: task.name, leaderboard };
};

// Lịch sử làm bài của 1 user (từ token)
const getHistoryByUser = async (userId) => {
  const tasks = await Task.find({ "user.user": userId })
    .populate("question")
    .lean();

  const history = [];

  tasks.forEach((task) => {
    const entry = (task.user || []).find(
      (u) => u.user?.toString() === userId.toString()
    );
    if (!entry) return;

    history.push({
      taskId: task._id,
      name: task.name,
      submitted: !!entry.submitted,
      score: entry.score || 0,
      totalQuestions: Array.isArray(task.question)
        ? task.question.length
        : 0,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  });

  return history;
};

// Tính lại toàn bộ xu từ lịch sử làm bài (dựa trên các bài đã nộp)
const recalculatePointsFromHistory = async (userId) => {
  const tasks = await Task.find({ "user.user": userId }).lean();

  let totalMoney = 0;

  tasks.forEach((task) => {
    const totalQuestions = Array.isArray(task.question)
      ? task.question.length
      : 0;

    const entry = (task.user || []).find(
      (u) =>
        u.user?.toString() === userId.toString() ||
        String(u.user) === String(userId)
    );
    if (!entry || !entry.submitted || !Array.isArray(entry.answers)) return;

    if (totalQuestions <= 0) return;

    const correctCount = entry.answers.filter((a) => a.isCorrect).length;
    const money = Math.floor((correctCount / totalQuestions) * 1000);
    totalMoney += money;
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { point: totalMoney },
    { new: true }
  ).select("username email point");

  if (!updatedUser) throw new Error("User không tồn tại");

  return {
    totalMoney,
    user: updatedUser,
  };
};

module.exports = {
  newTask,
  getAllTask,
  updateTask,
  addQuestion,
  addUser,
  removeUser,
  removeQuestion,
  submitAnswer,
  saveProgress,
  removeTask,
  getTaskById,
  getLeaderboard,
  getHistoryByUser,
  recalculatePointsFromHistory,
};