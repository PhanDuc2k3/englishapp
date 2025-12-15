import React, { useEffect, useState } from "react";
import taskApi from "../../api/taskApi";
import questionApi from "../../api/questionApi";
import type { Task, NewTask } from "../../types/task";
import type { Question } from "../../types/question";

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<NewTask>({ name: "", mode: "ai" });

  // 🟢 Lấy danh sách Task và Question
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, questionRes] = await Promise.all([
          taskApi.getAll(),
          questionApi.getAll(),
        ]);
        const taskData = (taskRes as any)?.data?.task ?? [];
        const questionData = (questionRes as any)?.data?.question ?? [];
        setTasks(Array.isArray(taskData) ? taskData : []);
        setQuestions(Array.isArray(questionData) ? questionData : []);
      } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ➕ Thêm Task mới
  const handleAddTask = async () => {
    if (!newTask.name.trim()) {
      alert("Vui lòng nhập tên bài kiểm tra!");
      return;
    }

    if (!newTask.mode) {
      alert("Vui lòng chọn cách tạo câu hỏi (AI hoặc Tự động ghép)!");
      return;
    }

    const payload: NewTask = {
      name: newTask.name,
      mode: newTask.mode,
      numQuestions: newTask.numQuestions || 5,
      category: newTask.category || "vocabulary",
      topic: newTask.topic || "",
    };

    try {
      const res = await taskApi.create(payload);
      const created = (res as any)?.data?.task;
      if (created) {
        setTasks((prev) => [...prev, created]);
        setShowAddTask(false);
        setNewTask({ name: "", mode: "ai" });
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm task:", error);
      alert("Lỗi khi tạo bài kiểm tra. Vui lòng thử lại.");
    }
  };

  // ➕ Gắn câu hỏi vào Task
  const handleAddQuestionToTask = async (id_question: string) => {
    if (!selectedTask?._id) return;
    try {
      const res = await taskApi.addQuestion(selectedTask._id, { id_question });
      const updated = (res as any)?.data?.task;
      if (updated) {
        setTasks((prev) =>
          prev.map((t) => (t._id === updated._id ? updated : t))
        );
        alert("✅ Thêm câu hỏi vào bài kiểm tra thành công!");
        setShowAddQuestion(false);
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm câu hỏi:", error);
    }
  };

  // 🗑️ Xóa Task
  const handleDeleteTask = async (id: string) => {
    try {
      await taskApi.delete(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      console.error("❌ Lỗi khi xóa task:", error);
    }
  };

  if (loading)
    return (
      <div className="bg-[#FFE1BD] min-h-screen flex items-center justify-center text-lg font-semibold">
        Đang tải danh sách bài kiểm tra...
      </div>
    );

  return (
    <div className="bg-[#FFE1BD] min-h-screen p-3">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">🧩 Quản lý bài kiểm tra</h1>
        <button
          onClick={() => setShowAddTask(true)}
          className="bg-[#f9ab0e] hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded"
        >
          ➕ Tạo bài kiểm tra
        </button>
      </div>

      <p className="italic text-gray-700 mb-2">
        Tổng số: {tasks.length} bài kiểm tra
      </p>

      <div className="flex flex-col gap-3">
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <div
              key={task._id || index}
              className="bg-[#f9ab0e] p-3 rounded-lg shadow-md text-black"
            >
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-bold text-xl">{task.name}</h2>
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() =>
                      setExpandedTaskId((prev) =>
                        prev === task._id ? null : task._id!
                      )
                    }
                    className="text-gray-800 hover:underline"
                  >
                    {expandedTaskId === task._id
                      ? "Ẩn chi tiết câu hỏi"
                      : "Xem chi tiết câu hỏi"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowAddQuestion(true);
                    }}
                    className="text-blue-700 hover:underline"
                  >
                    ➕ Thêm câu hỏi
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task._id!)}
                    className="text-red-700 hover:underline"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>

              <div className="bg-[#fbeac6] rounded-lg p-2 text-sm italic">
                <p>
                  Số lượng câu hỏi:{" "}
                  {Array.isArray((task as any).question)
                    ? (task as any).question.length
                    : 0}
                </p>
              </div>

              {/* Chi tiết câu hỏi trong task */}
              {expandedTaskId === task._id && Array.isArray((task as any).question) && (
                <div className="mt-3 bg-white rounded-lg p-3 text-sm space-y-2 max-h-64 overflow-y-auto">
                  {(task as any).question.length > 0 ? (
                    (task as any).question.map((q: Question, idx: number) => {
                      const answers = Array.isArray((q as any).answer)
                        ? (q as any).answer
                        : [];
                      return (
                        <div
                          key={q._id || `${task._id}-q-${idx}`}
                          className="border-b border-gray-200 pb-2 mb-2"
                        >
                          <div className="font-semibold mb-1">
                            {q.question}
                          </div>
                          <ul className="list-disc pl-5 text-xs">
                            {answers.map((ans, idx) => (
                              <li
                                key={idx}
                                className={ans.isCorrect ? "text-green-700 font-semibold" : ""}
                              >
                                {ans.text} {ans.isCorrect && "✅"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })
                  ) : (
                    <div className="italic text-gray-600">
                      Task này chưa có câu hỏi nào.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center italic text-gray-700">
            Chưa có bài kiểm tra nào được tạo.
          </div>
        )}
      </div>

      {/* 🟡 Popup thêm Task */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl w-[400px] relative">
            <h2 className="text-lg font-bold mb-3 text-center">
              ➕ Thêm bài kiểm tra
            </h2>

            <input
              type="text"
              placeholder="Tên bài kiểm tra (VD: Kiểm tra từ vựng 1)"
              value={newTask.name}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full p-2 mb-3 border rounded"
            />

            {/* Chọn cách tạo câu hỏi */}
            <div className="mb-3 text-sm">
              <p className="font-semibold mb-1">Cách tạo câu hỏi:</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="taskMode"
                    checked={newTask.mode === "ai"}
                    onChange={() =>
                      setNewTask((prev) => ({ ...prev, mode: "ai" }))
                    }
                  />
                  <span>AI tạo câu hỏi</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="taskMode"
                    checked={newTask.mode === "auto"}
                    onChange={() =>
                      setNewTask((prev) => ({ ...prev, mode: "auto" }))
                    }
                  />
                  <span>Tự động ghép câu hỏi có sẵn</span>
                </label>
              </div>
            </div>

            {/* Cấu hình chung cho cả 2 chế độ */}
            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div>
                <label className="block font-semibold mb-1">
                  Số câu hỏi
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newTask.numQuestions || 5}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      numQuestions: Number(e.target.value) || 1,
                    }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Thể loại</label>
                <select
                  value={newTask.category || "vocabulary"}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="vocabulary">Từ vựng</option>
                </select>
              </div>
            </div>

            <div className="mb-4 text-sm">
              <label className="block font-semibold mb-1">Chủ đề</label>
              <input
                type="text"
                placeholder="VD: giao tiếp cơ bản, công nghệ, du lịch... (có thể gõ tiếng Việt)"
                value={newTask.topic || ""}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, topic: e.target.value }))
                }
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                - Nếu chọn AI: AI sẽ hiểu chủ đề tiếng Việt và tạo câu hỏi tiếng
                Anh theo chủ đề đó.
                <br />
                - Nếu chọn Tự động ghép: hệ thống sẽ ghép các câu hỏi có sẵn có
                tiêu đề chứa chủ đề bạn nhập.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleAddTask}
                className="bg-[#f9ab0e] hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded w-[48%]"
              >
                Thêm
              </button>
              <button
                onClick={() => setShowAddTask(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold px-4 py-2 rounded w-[48%]"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Popup thêm câu hỏi vào Task */}
      {showAddQuestion && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl w-[600px] relative">
            <h2 className="text-lg font-bold mb-3 text-center">
              ➕ Thêm câu hỏi vào: {selectedTask.name}
            </h2>

            <div className="max-h-[400px] overflow-y-auto">
              {questions.length > 0 ? (
                questions.map((q) => (
                  <div
                    key={q._id}
                    className="border-b border-gray-200 py-2 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{q.question}</p>
                      <p className="text-xs italic text-gray-600">
                        {q.title} - {q.name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddQuestionToTask(q._id!)}
                      className="bg-[#f9ab0e] hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                    >
                      ➕
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center italic">Không có câu hỏi nào.</p>
              )}
            </div>

            <button
              onClick={() => setShowAddQuestion(false)}
              className="mt-3 bg-gray-400 hover:bg-gray-500 text-white font-bold px-4 py-2 rounded w-full"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
