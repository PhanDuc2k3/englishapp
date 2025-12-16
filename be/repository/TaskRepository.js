const Task = require("../models/Task");
const mongoose = require("mongoose")
const getAllTask = async () => {
    console.log(Task); // nếu hiện undefined -> lỗi export

    // Populate chi tiết câu hỏi và folder để FE có thể xem nội dung & đáp án trong màn quản lý bài tập
    // Sắp xếp: mới nhất trước (createdAt DESC)
    return await Task.find().sort({ createdAt: -1 }).populate("question").populate("folder");
}

const updateTask = async (id_task, id_question) => {
    const updateData = {question: id_question}
    const updateTask = await Task.findByIdAndUpdate(id_task, updateData, { new: true, runValidators: true });
    return updateTask;
}
const removeTask = async (id_task) => {
    return await Task.findByIdAndDelete(id_task);    
}
const addQuestion = async (id_task, id_question) => {
    const addData = { question: id_question };
    const task = await Task.findByIdAndUpdate(id_task, { $push: addData}, { new: true, runValidators: true });
    return task
}

const removeQuestion = async (id_task, id_question) => {
    const addData = { question: id_question }
    const task = await Task.findByIdAndUpdate(id_task, { $pull: addData }, { new: true, runValidators: true });
    return task;
}

const addUser = async (id_task, id_user) => {
  const task = await Task.findById(id_task);
  if (!task) throw new Error("Task không tồn tại");

  task.user = task.user || [];
  task.user.push({ user: id_user }); // thêm user vào mảng
  await task.save();

  return task;
};
const removeUser = async (id_task, id_user) => {
    const removeUser = { user: id_user };
    const task = await Task.findByIdAndUpdate(id_task, { $pull: { user: removeUser } }, { new: true, runValidators: true });
    return task;
}
const findUserId = async (id_task, id_user) => {
  const task = await Task.findById(id_task);
  if (!task) return -1;

  const userIndex = task.user.findIndex(u => u?.user?.toString() === id_user.toString());
  return userIndex; 
};

const findByIdTask = async (id_task) => {
    const task = await Task.findById(id_task);
    return task;
}

const findIdQuestion = async (id_task, id_question) => {
  const task = await Task.findById(id_task);
  if (!task) return null;
  return task.question.find(q => q.toString() === id_question.toString());
};

const getAllAnswer = (user, question) => {
  const id_question = question._id ? question._id.toString() : question.toString();
  return user.answers.find(a => a.question.toString() === id_question);
};

const updateAnswer = (user, question, selectedAnswer, isCorrect) => {
  const id_question = question._id ? question._id.toString() : question.toString();
  const existing = user.answers.find(
    (a) => a.question.toString() === id_question
  );

  if (existing) {
    existing.selectedAnswer = selectedAnswer;
    existing.isCorrect = isCorrect;
  } else {
    user.answers.push({
      question: id_question,
      selectedAnswer,
      isCorrect,
    });
  }

  return user;
};

// Tổng số câu trả lời ĐÚNG của 1 user trong task
const Total = (user) => {
  if (!user || !Array.isArray(user.answers)) return 0;
  return user.answers.filter((u) => u.isCorrect).length;
};

/**
 * Lấy danh sách tất cả question IDs đã được sử dụng trong các task khác
 * (trừ task hiện tại nếu có)
 */
const getUsedQuestionIds = async (excludeTaskId = null) => {
  const filter = {};
  if (excludeTaskId) {
    filter._id = { $ne: excludeTaskId };
  }
  
  const tasks = await Task.find(filter)
    .select("question")
    .lean();
  
  // Lấy tất cả question IDs từ các task
  const usedQuestionIds = new Set();
  tasks.forEach((task) => {
    if (Array.isArray(task.question)) {
      task.question.forEach((qId) => {
        usedQuestionIds.add(qId.toString());
      });
    }
  });
  
  return Array.from(usedQuestionIds);
};

module.exports = {
    getAllTask,
    updateTask,
    addQuestion,
    addUser,
    removeUser,
    findUserId,
    findIdQuestion,
    removeTask,
    removeQuestion,
    getAllAnswer,
    updateAnswer,
    Total,
    findByIdTask,
    getUsedQuestionIds,
}