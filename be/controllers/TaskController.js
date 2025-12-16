const taskService = require("../services/TaskService");
const Question = require("../models/Question")
const Task = require("../models/Task")
exports.newTask = async (req, res) => {
  try {
    const { name, mode, numQuestions, category, topic, maxDuplicatePercent, folder } = req.body;

    const newTask = await taskService.newTask({
      name,
      mode,
      numQuestions,
      category,
      topic,
      maxDuplicatePercent, // Tỷ lệ % cho phép trùng (0-100, mặc định 20)
      folder, // ID của folder (có thể null)
    });

    res.status(200).json({
      message: "Tạo bài kiểm tra thành công",
      task: newTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTask = async (req,res) => {
    try {
        const task = await taskService.getAllTask();
        res.status(200).json({
            message: "Lay thanh cong",
            task: task
        })
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.updateTask = async (req, res) => {
    try {
        const id_task = req.params.id;
        const { id_question } = req.body;
        const updateTask = await taskService.updateTask(id_task, id_question);
        res.status(200).json({
            message: "Cap nhat thanh cong",
            task: updateTask
        })
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Cập nhật thông tin task (tên, folder, etc.)
exports.updateTaskInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, folder } = req.body;
        const updatedTask = await taskService.updateTaskInfo(id, { name, folder });
        res.status(200).json({
            message: "Cập nhật task thành công",
            task: updatedTask,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addQuestion = async (req, res) => {
    try {
        const id_task = req.params.id;
        const { id_question } = req.body;
        if (!id_question) {
            res.status(400).json({message:"KHong nhan duoc id"})
        }
        const task = await taskService.addQuestion(id_task, id_question);
        res.status(200).json({
            message: "Them question thanh cong",
            task:task
        })
    }
    catch (error) {
        res.status(500).json({message:error.message})
    }
}

exports.addUser = async (req, res) => {

    try {
        const id_task = req.params.id;
        const { id_user } = req.body;  
        const task = await taskService.addUser(id_task, id_user);
        res.status(200).json({
            message: "Tham gia thanh cong",
            task: task
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }

}

exports.removeUser = async (req, res) => {
    try {
        const id_task = req.params.id;
        const { id_user } = req.body;
        const task = await taskService.removeUser(id_task, id_user);
        res.status(200).json({
            message: "Xoa thanh cong",
            task:task
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

exports.removeQuestion = async (req, res) => {
    try {
        const id_task = req.params.id;
        const { id_question } = req.body;
        const task = await taskService.removeQuestion(id_task, id_question);
        res.status(200).json({
            message: "Xoa thanh cong",
            task:task
        })
    }
    catch (error) {
        res.status(500).json({message: error.message})
    }
}

exports.removeTask = async (req, res) => {
    try {
        const id_task = req.params.id;
        console.log("id:", id_task)
        console.log("taskService:", taskService);

        const task = await taskService.removeTask(id_task)
        res.status(200).json({
            message: "Xoa thanh cong",
            task:task
        })
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.submitTask = async (req, res) => {
  try {
    const id_task = req.params.id;
    const { id_user, answers } = req.body;

    // Ưu tiên lấy id_user từ token nếu có
    const userIdFromToken = req.user?.id || req.user?._id;
    const finalUserId = userIdFromToken || id_user;

    if (!finalUserId) {
      return res
        .status(400)
        .json({ message: "Thiếu id_user. Vui lòng đăng nhập lại." });
    }

    const result = await taskService.submitAnswer(
      id_task,
      finalUserId,
      answers
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveProgress = async (req, res) => {
  try {
    const id_task = req.params.id;
    const { id_user, answers } = req.body;

    const userIdFromToken = req.user?.id || req.user?._id;
    const finalUserId = userIdFromToken || id_user;

    if (!finalUserId) {
      return res
        .status(400)
        .json({ message: "Thiếu id_user. Vui lòng đăng nhập lại." });
    }

    const result = await taskService.saveProgress(
      id_task,
      finalUserId,
      answers
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leaderboard cho 1 task
exports.getLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await taskService.getLeaderboard(id);
    res.status(200).json({
      message: "Lấy leaderboard thành công",
      ...result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lịch sử làm bài của user hiện tại
exports.getHistoryByUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Thiếu thông tin user. Vui lòng đăng nhập lại." });
    }

    const history = await taskService.getHistoryByUser(userId);

    res.status(200).json({
      message: "Lấy lịch sử làm bài thành công",
      history,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tính lại xu từ lịch sử làm bài cho user hiện tại
exports.recalculatePointsFromHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Thiếu thông tin user. Vui lòng đăng nhập lại." });
    }

    const result = await taskService.recalculatePointsFromHistory(userId);

    res.status(200).json({
      message: "Tính lại xu từ lịch sử thành công",
      ...result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).lean(); // lean() giúp trả về plain object
    if (!task) return res.status(404).json({ message: "Task không tồn tại" });

    // Lấy chi tiết question
    const questions = await Question.find({
      _id: { $in: task.question },
    }).lean();

    // Nếu có user đăng nhập, lấy tiến độ của user đó
    const userId = req.user?.id || req.user?._id;
    let userAnswers = {};
    let submitted = false;

    if (userId && Array.isArray(task.user)) {
      const userEntry = task.user.find(
        (u) => u.user?.toString() === userId.toString()
      );
      if (userEntry) {
        submitted = !!userEntry.submitted;
        if (Array.isArray(userEntry.answers)) {
          userEntry.answers.forEach((a) => {
            if (a.question) {
              userAnswers[a.question.toString()] =
                a.selectedAnswer?.toString() || "";
            }
          });
        }
      }
    }

    res.status(200).json({
      message: "Lấy task thành công",
      task: {
        ...task,
        question: questions, // giờ đây là mảng object Question đầy đủ
        userAnswers,
        submitted,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
