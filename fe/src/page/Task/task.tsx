import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import taskApi from "../../api/taskApi";

// ======= TYPE =======
interface AnswerType {
  _id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionType {
  _id: string;
  question: string;
  answer: AnswerType[];
  title?: string;
  name?: string;
}

interface TaskType {
  _id: string;
  name: string;
  question: QuestionType[];
  userAnswers?: Record<string, string>;
  submitted?: boolean;
}

interface AnswerSubmit {
  id_question: string;
  selectedAnswer: string;
}

// ======= COMPONENT =======
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

const Task: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<TaskType | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lấy task + leaderboard
  useEffect(() => {
    if (!id) return;

    const fetchTaskAndLeaderboard = async () => {
      try {
        const [taskRes, lbRes] = await Promise.all([
          taskApi.getTaskById(id),
          taskApi.getLeaderboard(id),
        ]);
        const t = taskRes.data.task;
        setTask(t);
        if (t.userAnswers) {
          setSelectedAnswers(t.userAnswers);
        }
        setLeaderboard(lbRes.data.leaderboard || []);
      } catch (err: any) {
        console.error("❌ Lỗi khi lấy task hoặc leaderboard:", err);
        setError(err.message || "Lỗi khi lấy task");
      } finally {
        setLoading(false);
        setLoadingLeaderboard(false);
      }
    };

    setLoading(true);
    setLoadingLeaderboard(true);
    fetchTaskAndLeaderboard();
  }, [id]);

  // Chọn đáp án + lưu tiến độ
  const handleSelect = async (qId: string, answerId: string) => {
    if (!task || task.submitted) return;

    setSelectedAnswers((prev) => ({ ...prev, [qId]: answerId }));

    try {
      const payload: { id_user: string | null; answers: AnswerSubmit[] } = {
        id_user: null,
        answers: [{ id_question: qId, selectedAnswer: answerId }],
      };
      await taskApi.saveProgress(task._id, payload);
    } catch (err) {
      // Lỗi lưu tiến độ thì log thôi, không chặn người dùng làm bài
      console.error("❌ Lỗi khi lưu tiến độ:", err);
    }
  };

const handleSubmit = async () => {
  if (!task) return;
  if (task.submitted || submitting) {
    // Đã nộp hoặc đang nộp, không cho bấm thêm
    return;
  }

  const answers: AnswerSubmit[] = Object.entries(selectedAnswers).map(
    ([id_question, selectedAnswer]) => ({ id_question, selectedAnswer })
  );

  setSubmitting(true);

  try {
    // Không cần lấy userId từ localStorage nữa
    const res = await taskApi.submitTask(task._id, {
      id_user: null,
      answers,
    }); // backend tự lấy từ token

    const reward = res.data.reward;
    if (reward) {
      // cập nhật ví trong localStorage nếu BE trả currentPoint
      const storedUser = localStorage.getItem("user");
      if (storedUser && typeof reward.currentPoint === "number") {
        try {
          const parsed = JSON.parse(storedUser);
          parsed.point = reward.currentPoint;
          localStorage.setItem("user", JSON.stringify(parsed));
        } catch (e) {
          console.error("❌ Lỗi khi cập nhật ví trong localStorage:", e);
        }
      }
      alert(
        `✅ Nộp bài thành công!\nSố câu đúng: ${reward.correctCount}/${reward.totalQuestions}\nĐiểm: ${reward.score.toFixed?.(2) ?? reward.score}/10\nTiền nhận: ${reward.money.toLocaleString(
          "vi-VN"
        )} đ`
      );
    } else {
      alert("✅ Nộp bài thành công!");
    }
    // Cập nhật trạng thái submitted ở FE để chặn làm lại
    setTask((prev) => (prev ? { ...prev, submitted: true } : prev));
    navigate("/"); // Quay về trang chủ
  } catch (err: any) {
    console.error("❌ Lỗi khi nộp bài:", err);
    alert(
      err?.response?.data?.message || err.message || "❌ Nộp bài thất bại"
    );
    setSubmitting(false); // Cho phép nộp lại nếu có lỗi
  }
};


  if (loading) return <div className="p-4">Đang tải task...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!task) return <div className="p-4">Không tìm thấy task</div>;

  return (
    <div className="bg-[#FFE1BD] min-h-screen p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 text-center sm:text-left">
        Bài kiểm tra: {task.name}
      </h1>

      {/* Leaderboard mini ở trên */}
      <div className="mb-4 bg-white rounded-xl shadow p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm sm:text-base">Bảng xếp hạng (top)</h2>
          <button
            onClick={() => navigate(`/task/${task._id}/leaderboard`)}
            className="text-xs sm:text-sm text-blue-600 hover:underline"
          >
            Xem chi tiết
          </button>
        </div>
        {loadingLeaderboard ? (
          <div className="text-xs italic">Đang tải bảng xếp hạng...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-xs italic">Chưa có ai hoàn thành bài kiểm tra này.</div>
        ) : (
          <div className="space-y-1 text-xs sm:text-sm">
            {leaderboard.slice(0, 3).map((item, index) => (
              <div
                key={item.userId}
                className="flex items-center justify-between bg-[#fbeac6] rounded px-2 py-1"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">#{index + 1}</span>
                  <span>{item.username || "Ẩn danh"}</span>
                </div>
                <div className="text-right">
                  <div>
                    Điểm:{" "}
                    <span className="font-semibold">
                      {item.score}/10
                    </span>
                  </div>
                  <div className="text-[11px]">
                    Tiền: {item.money.toLocaleString("vi-VN")} đ
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {task.submitted && (
        <div className="mb-3 text-red-600 font-semibold">
          Bạn đã nộp bài cho bài kiểm tra này. Dưới đây là kết quả chi tiết (đáp án đúng màu xanh, lựa chọn sai màu đỏ).
        </div>
      )}

      <div className="flex flex-col gap-5">
        {task.question.map((q) => {
          const selected = selectedAnswers[q._id];
          return (
            <div
              key={q._id}
              className="rounded-xl bg-[#f9ab0e] shadow-md p-3 transition-transform hover:scale-[1.02]"
            >
              <div className="font-bold italic text-lg mb-2 text-center">
                {q.question}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {q.answer.map((opt) => {
                  const isSelected = selected === opt._id;
                  const isCorrect = opt.isCorrect;

                  let extraClass = "";

                  if (task.submitted) {
                    if (isCorrect) {
                      extraClass = "bg-green-500 text-white border-green-700";
                    } else if (isSelected && !isCorrect) {
                      extraClass = "bg-red-500 text-white border-red-700";
                    } else {
                      extraClass = "bg-[#fbeac6] border-transparent";
                    }
                  } else {
                    extraClass = isSelected
                      ? "bg-[#FFD580] border-[#f59e0b]"
                      : "bg-[#fbeac6] hover:bg-[#fde7aa] border-transparent";
                  }

                  return (
                    <button
                      key={opt._id}
                      onClick={() => handleSelect(q._id, opt._id)}
                      className={`py-2 rounded-lg border text-sm font-semibold transition ${extraClass}`}
                      disabled={task.submitted}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={() => navigate(`/task/${task._id}/leaderboard`)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Xem bảng xếp hạng
        </button>
        {!task.submitted && (
          <button
            onClick={handleSubmit}
          disabled={submitting}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
          {submitting ? "Đang nộp..." : "Nộp bài"}
          </button>
        )}
        <button
          onClick={() => navigate("/")}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default Task;
