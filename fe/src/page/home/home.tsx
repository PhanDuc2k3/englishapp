import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import taskApi from "../../api/taskApi";

// Kiểu dữ liệu Task
interface Task {
  _id: string;
  name: string;
  question?: any[];
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
    alert(err?.response?.data?.message || err.message || "Thêm user thất bại");
  }
};


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

      <div className="flex flex-col gap-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
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
          <div className="text-center italic">Chưa có bài kiểm tra nào được tạo.</div>
        )}
      </div>
    </div>
  );
};

export default Home;
