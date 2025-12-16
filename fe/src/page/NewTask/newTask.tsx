import React, { useEffect, useState } from "react";
import taskApi from "../../api/taskApi";
import questionApi from "../../api/questionApi";
import folderApi from "../../api/folderApi";
import type { Task, NewTask } from "../../types/task";
import type { Question } from "../../types/question";
import type { Folder, NewFolder } from "../../types/folder";

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<NewTask>({ name: "", mode: "ai" });
  const [newFolder, setNewFolder] = useState<NewFolder>({ name: "" });

  // 🟢 Lấy danh sách Task, Question và Folder
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, questionRes, folderRes] = await Promise.all([
          taskApi.getAll(),
          questionApi.getAll(),
          folderApi.getAll(),
        ]);
        const taskData = (taskRes as any)?.data?.task ?? [];
        const questionData = (questionRes as any)?.data?.question ?? [];
        const folderData = (folderRes as any)?.data?.folders ?? [];
        setTasks(Array.isArray(taskData) ? taskData : []);
        setQuestions(Array.isArray(questionData) ? questionData : []);
        setFolders(Array.isArray(folderData) ? folderData : []);
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
      maxDuplicatePercent: newTask.maxDuplicatePercent ?? 20, // Mặc định 20% cho phép trùng
      folder: newTask.folder || null, // ID của folder
    };

    try {
      const res = await taskApi.create(payload);
      const created = (res as any)?.data?.task;
      if (created) {
        // Reload tasks để có folder info
        const taskRes = await taskApi.getAll();
        const taskData = (taskRes as any)?.data?.task ?? [];
        setTasks(Array.isArray(taskData) ? taskData : []);
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

  // 📁 Quản lý Folder
  const handleCreateFolder = async () => {
    if (!newFolder.name.trim()) {
      alert("Vui lòng nhập tên folder!");
      return;
    }
    try {
      const res = await folderApi.create(newFolder);
      const created = (res as any)?.data?.folder;
      if (created) {
        setFolders((prev) => [...prev, created]);
        setShowAddFolder(false);
        setNewFolder({ name: "" });
      }
    } catch (error: any) {
      console.error("❌ Lỗi khi tạo folder:", error);
      alert(error?.response?.data?.message || "Lỗi khi tạo folder");
    }
  };

  const handleUpdateFolder = async () => {
    if (!selectedFolder?._id || !newFolder.name.trim()) {
      alert("Vui lòng nhập tên folder!");
      return;
    }
    try {
      const res = await folderApi.update(selectedFolder._id, newFolder);
      const updated = (res as any)?.data?.folder;
      if (updated) {
        setFolders((prev) =>
          prev.map((f) => (f._id === updated._id ? updated : f))
        );
        setShowEditFolder(false);
        setSelectedFolder(null);
        setNewFolder({ name: "" });
      }
    } catch (error: any) {
      console.error("❌ Lỗi khi cập nhật folder:", error);
      alert(error?.response?.data?.message || "Lỗi khi cập nhật folder");
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Xóa folder này? Các task trong folder sẽ được chuyển về 'Chưa phân loại'")) {
      return;
    }
    try {
      await folderApi.delete(id);
      setFolders((prev) => prev.filter((f) => f._id !== id));
      // Reload tasks để cập nhật folder info
      const taskRes = await taskApi.getAll();
      const taskData = (taskRes as any)?.data?.task ?? [];
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (error: any) {
      console.error("❌ Lỗi khi xóa folder:", error);
      alert(error?.response?.data?.message || "Lỗi khi xóa folder");
    }
  };

  // Di chuyển task sang folder khác
  const handleMoveTaskToFolder = async (taskId: string, folderId: string | null) => {
    try {
      // Cần tạo API endpoint để update folder của task
      // Tạm thời dùng update task (cần thêm API)
      await taskApi.update(taskId, { folder: folderId });
      // Reload tasks
      const taskRes = await taskApi.getAll();
      const taskData = (taskRes as any)?.data?.task ?? [];
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (error) {
      console.error("❌ Lỗi khi di chuyển task:", error);
    }
  };

  // Nhóm task theo folder và sắp xếp: mới nhất trước
  const tasksByFolder = tasks.reduce((acc, task) => {
    const folderId = task.folder?._id || "uncategorized";
    if (!acc[folderId]) {
      acc[folderId] = [];
    }
    acc[folderId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Sắp xếp task trong mỗi folder: mới nhất trước (theo createdAt)
  Object.keys(tasksByFolder).forEach((folderId) => {
    tasksByFolder[folderId].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // DESC: mới nhất trước
    });
  });

  // Sắp xếp folder: mới nhất trước (theo createdAt)
  const sortedFolders = [...folders].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA; // DESC: mới nhất trước
  });

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

      <div className="flex justify-between items-center mb-3">
        <p className="italic text-gray-700">
          Tổng số: {tasks.length} bài kiểm tra
        </p>
        <button
          onClick={() => {
            setShowAddFolder(true);
            setNewFolder({ name: "" });
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded text-sm"
        >
          📁 Tạo folder
        </button>
      </div>

      {/* Hiển thị task theo folder */}
      <div className="flex flex-col gap-4">
        {/* Folder: Chưa phân loại */}
        {tasksByFolder["uncategorized"] && tasksByFolder["uncategorized"].length > 0 && (
          <div className="bg-gray-100 rounded-lg p-3">
            <h2 className="font-bold text-lg mb-2 text-gray-700">
              📂 Chưa phân loại
            </h2>
            <div className="flex flex-col gap-3">
              {tasksByFolder["uncategorized"].map((task, index) => (
                <TaskCard
                  key={task._id || index}
                  task={task}
                  folders={folders}
                  onExpand={() =>
                    setExpandedTaskId((prev) =>
                      prev === task._id ? null : task._id!
                    )
                  }
                  onAddQuestion={() => {
                    setSelectedTask(task);
                    setShowAddQuestion(true);
                  }}
                  onDelete={() => handleDeleteTask(task._id!)}
                  onMoveFolder={(folderId) =>
                    handleMoveTaskToFolder(task._id!, folderId)
                  }
                  expanded={expandedTaskId === task._id}
                  questions={questions}
                />
              ))}
            </div>
          </div>
        )}

        {/* Các folder khác - sắp xếp mới nhất trước */}
        {sortedFolders.map((folder) => {
          const folderTasks = tasksByFolder[folder._id] || [];
          if (folderTasks.length === 0) return null;

          return (
            <div
              key={folder._id}
              className="rounded-lg p-3"
              style={{
                backgroundColor: folder.color
                  ? `${folder.color}20`
                  : "#f9ab0e20",
                borderLeft: `4px solid ${folder.color || "#f9ab0e"}`,
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h2
                  className="font-bold text-lg"
                  style={{ color: folder.color || "#f9ab0e" }}
                >
                  📂 {folder.name}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedFolder(folder);
                      setNewFolder({
                        name: folder.name,
                        description: folder.description,
                        color: folder.color,
                        order: folder.order,
                      });
                      setShowEditFolder(true);
                    }}
                    className="text-blue-700 hover:underline text-sm"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder._id)}
                    className="text-red-700 hover:underline text-sm"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {folderTasks.map((task, index) => (
                  <TaskCard
                    key={task._id || index}
                    task={task}
                    folders={folders}
                    onExpand={() =>
                      setExpandedTaskId((prev) =>
                        prev === task._id ? null : task._id!
                      )
                    }
                    onAddQuestion={() => {
                      setSelectedTask(task);
                      setShowAddQuestion(true);
                    }}
                    onDelete={() => handleDeleteTask(task._id!)}
                    onMoveFolder={(folderId) =>
                      handleMoveTaskToFolder(task._id!, folderId)
                    }
                    expanded={expandedTaskId === task._id}
                    questions={questions}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
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

            {/* Cấu hình tránh trùng lặp - chỉ hiển thị khi mode = "auto" */}
            {newTask.mode === "auto" && (
              <div className="mb-4 text-sm">
                <label className="block font-semibold mb-1">
                  Tỷ lệ cho phép trùng (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newTask.maxDuplicatePercent ?? 20}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      maxDuplicatePercent: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full p-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tỷ lệ % tối đa câu hỏi có thể trùng với task khác (0-100).
                  <br />
                  Ví dụ: 20% = cho phép tối đa 20% câu hỏi trùng, 80% còn lại sẽ là câu hỏi mới.
                  <br />
                  <strong>Mặc định: 20%</strong> - Hệ thống sẽ ưu tiên chọn câu hỏi chưa dùng.
                </p>
              </div>
            )}

            {/* Chọn folder */}
            <div className="mb-4 text-sm">
              <label className="block font-semibold mb-1">Folder</label>
              <select
                value={newTask.folder || ""}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    folder: e.target.value || null,
                  }))
                }
                className="w-full p-2 border rounded"
              >
                <option value="">Chưa phân loại</option>
                {folders.map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
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

      {/* Popup tạo/sửa folder */}
      {(showAddFolder || showEditFolder) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl w-[400px] relative">
            <h2 className="text-lg font-bold mb-3 text-center">
              {showEditFolder ? "✏️ Sửa folder" : "📁 Tạo folder mới"}
            </h2>

            <input
              type="text"
              placeholder="Tên folder"
              value={newFolder.name}
              onChange={(e) =>
                setNewFolder((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full p-2 mb-3 border rounded"
            />

            <input
              type="text"
              placeholder="Mô tả (tùy chọn)"
              value={newFolder.description || ""}
              onChange={(e) =>
                setNewFolder((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full p-2 mb-3 border rounded"
            />

            <input
              type="color"
              value={newFolder.color || "#f9ab0e"}
              onChange={(e) =>
                setNewFolder((prev) => ({ ...prev, color: e.target.value }))
              }
              className="w-full p-2 mb-3 border rounded"
            />

            <div className="flex justify-between">
              <button
                onClick={showEditFolder ? handleUpdateFolder : handleCreateFolder}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded w-[48%]"
              >
                {showEditFolder ? "Cập nhật" : "Tạo"}
              </button>
              <button
                onClick={() => {
                  setShowAddFolder(false);
                  setShowEditFolder(false);
                  setSelectedFolder(null);
                  setNewFolder({ name: "" });
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold px-4 py-2 rounded w-[48%]"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component TaskCard để hiển thị từng task
const TaskCard: React.FC<{
  task: Task;
  folders: Folder[];
  onExpand: () => void;
  onAddQuestion: () => void;
  onDelete: () => void;
  onMoveFolder: (folderId: string | null) => void;
  expanded: boolean;
  questions: Question[];
}> = ({
  task,
  folders,
  onExpand,
  onAddQuestion,
  onDelete,
  onMoveFolder,
  expanded,
  questions,
}) => {
  return (
    <div className="bg-[#f9ab0e] p-3 rounded-lg shadow-md text-black">
      <div className="flex justify-between items-center mb-1">
        <h2 className="font-bold text-xl">{task.name}</h2>
        <div className="flex gap-3 text-sm">
          <button
            onClick={onExpand}
            className="text-gray-800 hover:underline"
          >
            {expanded ? "Ẩn chi tiết" : "Xem chi tiết"}
          </button>
          <button onClick={onAddQuestion} className="text-blue-700 hover:underline">
            ➕ Thêm câu hỏi
          </button>
          <select
            onChange={(e) => onMoveFolder(e.target.value || null)}
            value={task.folder?._id || ""}
            className="text-xs border rounded px-2 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">Chưa phân loại</option>
            {folders.map((folder) => (
              <option key={folder._id} value={folder._id}>
                {folder.name}
              </option>
            ))}
          </select>
          <button onClick={onDelete} className="text-red-700 hover:underline">
            🗑️ Xóa
          </button>
        </div>
      </div>

      <div className="bg-[#fbeac6] rounded-lg p-2 text-sm italic">
        <p>
          Số lượng câu hỏi:{" "}
          {Array.isArray(task.question) ? task.question.length : 0}
        </p>
      </div>

      {expanded && Array.isArray(task.question) && (
        <div className="mt-3 bg-white rounded-lg p-3 text-sm space-y-2 max-h-64 overflow-y-auto">
          {task.question.length > 0 ? (
            task.question.map((q: Question, idx: number) => {
              const answers = Array.isArray((q as any).answer)
                ? (q as any).answer
                : [];
              return (
                <div
                  key={q._id || `${task._id}-q-${idx}`}
                  className="border-b border-gray-200 pb-2 mb-2"
                >
                  <div className="font-semibold mb-1">{q.question}</div>
                  <ul className="list-disc pl-5 text-xs">
                    {answers.map((ans, idx) => (
                      <li
                        key={idx}
                        className={
                          ans.isCorrect ? "text-green-700 font-semibold" : ""
                        }
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
  );
};

export default TaskList;
