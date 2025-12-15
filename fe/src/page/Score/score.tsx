import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import taskApi from "../../api/taskApi";

interface HistoryItem {
  taskId: string;
  name: string;
  submitted: boolean;
  score: number;
  totalQuestions: number;
  createdAt?: string;
  updatedAt?: string;
}

const Score: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await taskApi.getHistory();
        setHistory(res.data.history || []);
      } catch (err) {
        console.error("❌ Lỗi khi lấy lịch sử làm bài:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#FFE1BD] min-h-screen flex items-center justify-center text-lg font-semibold">
        Đang tải lịch sử làm bài...
      </div>
    );
  }

  return (
    <div className="bg-[#FFE1BD] min-h-screen p-3">
      <div className="flex items-center justify-center font-bold text-xl sm:text-2xl mb-2">
        Lịch sử làm bài
      </div>
      <p className="text-black-500 mb-4 italic text-sm sm:text-base text-center sm:text-left">
        Hiện tại bạn đã tham gia {history.length} bài kiểm tra
      </p>

      <div className="flex flex-col gap-3">
        {history.length > 0 ? (
          history.map((item) => (
            <button
              key={item.taskId}
              type="button"
              onClick={() => navigate(`/task/${item.taskId}`)}
              className="rounded-lg bg-[#f9ab0e] shadow-md transition-transform hover:scale-[1.02] text-left cursor-pointer"
            >
              <div className="flex items-center justify-center font-bold text-xl italic rounded">
                {item.name}
              </div>
              <div className="bg-[#fbeac6] p-1.5 mx-1 rounded-[10px] text-[12px] italic">
                <div className="flex justify-between p-1 leading-tight">
                  <p>
                    Điểm:{" "}
                    {item.submitted
                      ? `${item.score}/${item.totalQuestions}`
                      : "Chưa có (chưa nộp bài)"
                    }
                  </p>
                  <p>
                    Trạng thái:{" "}
                    {item.submitted ? "Đã nộp bài" : "Chưa nộp / đang làm dở"}
                  </p>
                </div>
                <div className="flex justify-between p-1 leading-tight">
                  <p>
                    Ngày làm:{" "}
                    {item.updatedAt
                      ? new Date(item.updatedAt).toLocaleString()
                      : item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "Không rõ"}
                  </p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center italic">
            Bạn chưa tham gia bài kiểm tra nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default Score;
