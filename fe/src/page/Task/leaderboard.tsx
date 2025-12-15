import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import taskApi from "../../api/taskApi";

interface LeaderboardItem {
  userId: string;
  username: string;
  email: string;
  avatar?: string;
  correctCount: number;
  totalQuestions: number;
  score: number;
  money: number;
}

const Leaderboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<{
    name: string;
    leaderboard: LeaderboardItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchLeaderboard = async () => {
      try {
        const res = await taskApi.getLeaderboard(id);
        setData({
          name: res.data.name,
          leaderboard: res.data.leaderboard || [],
        });
      } catch (err: any) {
        console.error("❌ Lỗi khi lấy leaderboard:", err);
        setError(err?.response?.data?.message || err.message || "Lỗi khi lấy bảng xếp hạng");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#FFE1BD] min-h-screen flex items-center justify-center text-lg font-semibold">
        Đang tải bảng xếp hạng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFE1BD] min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#FFE1BD] min-h-screen flex items-center justify-center">
        Không có dữ liệu bảng xếp hạng
      </div>
    );
  }

  return (
    <div className="bg-[#FFE1BD] min-h-screen p-4 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Bảng xếp hạng - {data.name}
        </h1>
        <p className="text-xs sm:text-sm italic text-gray-700 text-center sm:text-right">
          Điểm học tập tính theo thang 10. Mỗi bài tối đa 1000 đồng, tiền được chia đều cho số câu hỏi.
        </p>
      </div>

      {data.leaderboard.length === 0 ? (
        <div className="text-center italic">
          Chưa có ai hoàn thành bài kiểm tra này.
        </div>
      ) : (
        <div className="bg-[#f9ab0e] rounded-lg shadow-md overflow-hidden">
          <div className="hidden sm:grid grid-cols-7 bg-[#f59e0b] text-white font-semibold text-sm py-2 px-3">
            <div>#</div>
            <div>Ảnh</div>
            <div>Người dùng</div>
            <div className="text-center">Email</div>
            <div className="text-center">Điểm (0 - 10)</div>
            <div className="text-center">Đúng / Tổng</div>
            <div className="text-center">Tiền (đ)</div>
          </div>
          {data.leaderboard.map((item, index) => (
            <div
              key={item.userId + index}
              className="bg-[#fbeac6] text-sm py-2 px-3 border-t border-[#f9ab0e] flex flex-col sm:grid sm:grid-cols-7 gap-1"
            >
              <div className="font-semibold sm:flex sm:items-center">
                #{index + 1}
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.username}
                    className="w-10 h-10 rounded-full object-cover border border-yellow-500"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#f9ab0e] flex items-center justify-center text-xs font-bold text-white">
                    {item.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold">{item.username || "Ẩn danh"}</div>
                <div className="sm:hidden text-xs text-gray-700 truncate">
                  {item.email || "-"}
                </div>
              </div>
              <div className="hidden sm:flex sm:items-center sm:justify-center truncate">
                {item.email || "-"}
              </div>
              <div className="flex sm:block items-center justify-between">
                <span className="sm:hidden text-xs text-gray-600 mr-2">
                  Điểm (0 - 10):
                </span>
                <span className="font-semibold text-center sm:block">
                  {item.score}
                </span>
              </div>
              <div className="flex sm:block items-center justify-between">
                <span className="sm:hidden text-xs text-gray-600 mr-2">
                  Đúng / Tổng:
                </span>
                <span className="text-center sm:block">
                  {item.correctCount}/{item.totalQuestions}
                </span>
              </div>
              <div className="flex sm:block items-center justify-between">
                <span className="sm:hidden text-xs text-gray-600 mr-2">
                  Tiền nhận:
                </span>
                <span className="text-center sm:block font-semibold text-green-700">
                  {item.money.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 sm:mt-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;


