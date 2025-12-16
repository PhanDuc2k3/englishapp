import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import taskApi from "../../api/taskApi";
import folderApi from "../../api/folderApi";
import type { Task } from "../../types/task";
import type { Folder } from "../../types/folder";

const FolderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy folder info
        if (id && id !== "uncategorized") {
          const folderRes = await folderApi.getById(id);
          setFolder(folderRes.data.folder);
        }

        // Lấy tất cả tasks
        const taskRes = await taskApi.getAll();
        const allTasks = (taskRes as any)?.data?.task ?? [];

        // Lọc tasks theo folder
        if (id === "uncategorized") {
          // Tasks không có folder
          const uncategorizedTasks = allTasks.filter(
            (task: Task) => !task.folder || !task.folder._id
          );
          setTasks(uncategorizedTasks);
        } else if (id) {
          // Tasks có folder này
          const folderTasks = allTasks.filter(
            (task: Task) => task.folder?._id === id
          );
          setTasks(folderTasks);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Click vào task → add user vào task
  const handleClickTask = async (taskId: string) => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userString);
    const userId = user._id || user.id;

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

  // Sắp xếp task: mới nhất trước
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  if (loading) {
    return (
      <div className="bg-[#FFE1BD] min-h-screen flex items-center justify-center text-lg font-semibold">
        Đang tải...
      </div>
    );
  }

  const folderName = id === "uncategorized" ? "Chưa phân loại" : folder?.name || "Folder";
  const folderColor = id === "uncategorized" ? "#9ca3af" : folder?.color || "#f9ab0e";

  return (
    <div className="bg-[#FFE1BD] min-h-screen p-3">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded"
        >
          ← Quay lại
        </button>
        <h1
          className="text-2xl font-bold"
          style={{ color: folderColor }}
        >
          📂 {folderName}
        </h1>
      </div>

      <p className="text-gray-700 mb-4 italic">
        Có {tasks.length} bài kiểm tra trong folder này
      </p>

      <div className="flex flex-col gap-3">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <div
              key={task._id}
              onClick={() => handleClickTask(task._id)}
              className="cursor-pointer rounded-lg bg-[#f9ab0e] shadow-md transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center font-bold text-xl italic rounded">
                {task.name}
              </div>
              <div className="bg-[#fbeac6] p-2 mx-1 mb-2 rounded-[10px] text-[12px] italic">
                <div className="flex flex-col sm:flex-row sm:justify-between p-1 leading-tight gap-1">
                  <p>Người tạo: Admin</p>
                  <p>Số câu hỏi: {task.question?.length || 0}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between p-1 leading-tight gap-1">
                  <p>
                    Ngày tạo:{" "}
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleDateString()
                      : "Không rõ"}
                  </p>
                  <p>Top 1: Chưa có</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center italic text-gray-700">
            Chưa có bài kiểm tra nào trong folder này.
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderDetail;

