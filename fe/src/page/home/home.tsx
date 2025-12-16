import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import taskApi from "../../api/taskApi";

// Kiểu dữ liệu Folder (lấy từ Task.populate("folder"))
interface FolderRef {
  _id: string;
  name: string;
  color?: string;
  createdAt?: string;
}

// Kiểu dữ liệu Task
interface Task {
  _id: string;
  name: string;
  question?: any[];
  folder?: FolderRef | null;
  createdAt?: string;
  updatedAt?: string;
}

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lấy danh sách bài kiểm tra
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await taskApi.getAll();
        const data = res?.data?.task ?? [];
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách bài kiểm tra:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Click vào task → add user vào task
  const handleClickTask = async (taskId: string) => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userString);
    const userId = user._id || user.id; // dùng _id hoặc id từ user

    try {
      await taskApi.addUser(taskId, { id_user: userId });
      navigate(`/task/${taskId}`);
    } catch (err: any) {
      console.error("❌ Lỗi khi thêm user vào task:", err);
      alert(
        err?.response?.data?.message || err.message || "Thêm user thất bại"
      );
    }
  };

  // Nhóm task theo folder để hiển thị: folder trước, task bên trong
  const tasksByFolder = tasks.reduce((acc, task) => {
    const folderId = task.folder?._id || "uncategorized";
    if (!acc[folderId]) {
      acc[folderId] = [];
    }
    acc[folderId].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Lấy danh sách folder từ task + sắp xếp: folder mới nhất trước
  const folderMap: Record<string, FolderRef> = {};
  tasks.forEach((task) => {
    if (task.folder?._id) {
      folderMap[task.folder._id] = task.folder;
    }
  });

  const sortedFolders = Object.values(folderMap).sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA; // DESC: mới nhất trước
  });

  // Sắp xếp task trong mỗi folder: mới nhất trước
  Object.keys(tasksByFolder).forEach((folderId) => {
    tasksByFolder[folderId].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  });

  if (loading) {
    return (
      <div className="bg-[#FFE1BD] min-h-screen flex items-center justify-center text-lg font-semibold">
        Đang tải danh sách bài kiểm tra...
      </div>
    );
  }

  return (
    <div className="bg-[#FFE1BD] min-h-screen p-3">
      <div className="flex items-center justify-center font-bold text-xl sm:text-2xl mb-2">
        Bài kiểm tra
      </div>
      <p className="text-red-500 mb-4 italic text-sm sm:text-base text-center sm:text-left">
        Hiện tại có {tasks.length} bài kiểm tra bạn có thể làm
      </p>

      <div className="flex flex-col gap-4">
        {/* Folder: Chưa phân loại */}
        {tasksByFolder["uncategorized"] &&
          tasksByFolder["uncategorized"].length > 0 && (
            <div className="bg-gray-100 rounded-lg p-3">
              <h2
                onClick={() => navigate("/folder/uncategorized")}
                className="font-bold text-lg mb-2 text-gray-700 cursor-pointer flex items-center gap-2 hover:opacity-80"
              >
                <span>▶</span>
                📂 Chưa phân loại ({tasksByFolder["uncategorized"].length})
              </h2>
            </div>
          )}

        {/* Các folder khác - hiển thị trước, mới nhất trước */}
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
              <h2
                onClick={() => navigate(`/folder/${folder._id}`)}
                className="font-bold text-lg mb-2 cursor-pointer flex items-center gap-2 hover:opacity-80"
                style={{ color: folder.color || "#f9ab0e" }}
              >
                <span>▶</span>
                📂 {folder.name} ({folderTasks.length})
              </h2>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center italic">
            Chưa có bài kiểm tra nào được tạo.
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
