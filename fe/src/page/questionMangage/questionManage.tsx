import React, { useEffect, useState } from "react";
import questionApi from "../../api/questionApi";
import type { Question, NewQuestion } from "../../types/question";

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // ✅ kiểm tra đang sửa hay thêm
  const [editingId, setEditingId] = useState<string | null>(null);

  // ⚙️ cấu hình sinh câu hỏi AI
  const [aiConfig, setAiConfig] = useState({
    numQuestions: 5,
    category: "vocabulary",
    topic: "daily life",
  });

  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    title: "",
    name: "",
    question: "",
    answer: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  // 🟢 Lấy tất cả câu hỏi
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await questionApi.getAll();
        const data = res?.data?.question ?? [];
        setQuestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách câu hỏi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // 🟢 Thêm câu hỏi
  const handleAddQuestion = async () => {
    try {
      if (!newQuestion.title || !newQuestion.name || !newQuestion.question) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      if (isEditing && editingId) {
        // 🟡 Sửa câu hỏi
        const res = await questionApi.update(editingId, newQuestion);
        const updated = res?.data?.question ?? null;
        if (updated) {
          setQuestions((prev) =>
            prev.map((q) => (q._id === editingId ? updated : q))
          );
        }
        setIsEditing(false);
        setEditingId(null);
      } else {
        // 🟢 Thêm mới
        const res = await questionApi.create(newQuestion);
        const created = res?.data?.question ?? null;
        if (created) {
          setQuestions((prev) => [...prev, created]);
        }
      }

      // Reset form
      setNewQuestion({
        title: "",
        name: "",
        question: "",
        answer: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      });
      setShowPopup(false);
    } catch (error) {
      console.error("Lỗi khi thêm/sửa câu hỏi:", error);
    }
  };

  // 🗑️ Xóa câu hỏi
  const handleDelete = async (id: string) => {
    try {
      await questionApi.delete(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa câu hỏi:", error);
    }
  };

  // ✏️ Sửa câu hỏi
  const handleEdit = (q: Question) => {
    setNewQuestion({
      title: q.title,
      name: q.name,
      question: q.question,
      answer: q.answer.map((a) => ({ ...a })),
    });
    setIsEditing(true);
    setEditingId(q._id);
    setShowPopup(true);
  };

  if (loading)
    return (
      <div className="bg-[#FFE1BD] min-h-screen flex items-center justify-center text-lg font-semibold">
        Đang tải danh sách câu hỏi...
      </div>
    );

  return (
    <div className="bg-[#FFE1BD] min-h-screen p-3 relative">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">📘 Quản lý câu hỏi</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingId(null);
              setNewQuestion({
                title: "",
                name: "",
                question: "",
                answer: [
                  { text: "", isCorrect: false },
                  { text: "", isCorrect: false },
                  { text: "", isCorrect: false },
                  { text: "", isCorrect: false },
                ],
              });
              setShowPopup(true);
            }}
            className="bg-[#f9ab0e] hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded"
          >
            ➕ Thêm câu hỏi
          </button>

          {/* Nút sinh câu hỏi AI cho admin */}
          <button
            onClick={async () => {
              try {
                const res = await questionApi.generateByAI({
                  numQuestions: aiConfig.numQuestions,
                  category: aiConfig.category,
                  topic: aiConfig.topic,
                });
                const created = res.data.questions ?? [];
                if (created.length > 0) {
                  setQuestions((prev) => [...prev, ...created]);
                  alert(`Đã sinh ${created.length} câu hỏi AI và lưu vào hệ thống`);
                } else {
                  alert("AI không sinh được câu hỏi nào. Vui lòng thử lại.");
                }
              } catch (error: any) {
                console.error("Lỗi khi sinh câu hỏi AI:", error);
                const msg =
                  error?.response?.data?.message ||
                  "Lỗi khi sinh câu hỏi AI. Có thể bạn không phải admin hoặc server AI lỗi.";
                alert(msg);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded"
          >
            🤖 Sinh câu hỏi AI
          </button>
        </div>
      </div>

      {/* Form cấu hình AI */}
      <div className="bg-white rounded-lg p-3 mb-4 shadow-sm flex flex-wrap gap-3 text-sm">
        <div>
          <label className="block font-semibold mb-1">Số câu hỏi</label>
          <input
            type="number"
            min={1}
            max={50}
            value={aiConfig.numQuestions}
            onChange={(e) =>
              setAiConfig((prev) => ({
                ...prev,
                numQuestions: Number(e.target.value) || 1,
              }))
            }
            className="border rounded px-2 py-1 w-24"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Thể loại</label>
          <select
            value={aiConfig.category}
            onChange={(e) =>
              setAiConfig((prev) => ({ ...prev, category: e.target.value }))
            }
            className="border rounded px-2 py-1"
          >
            <option value="vocabulary">Từ vựng</option>
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block font-semibold mb-1">Chủ đề</label>
          <input
            type="text"
            placeholder="VD: travel, food, technology..."
            value={aiConfig.topic}
            onChange={(e) =>
              setAiConfig((prev) => ({ ...prev, topic: e.target.value }))
            }
            className="border rounded px-2 py-1 w-full"
          />
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      <div className="flex flex-col gap-3">
        {questions.length > 0 ? (
          questions.map((q, index) => (
            <div
              key={q._id}
              className="bg-[#f9ab0e] rounded-lg p-3 shadow-md text-black"
            >
              <div className="flex justify-between mb-1 font-bold">
                <p>
                  {index + 1}. {q.question}
                </p>
                <p className="italic text-sm text-gray-800">
                  ({q.title} - Mã: {q.name})
                </p>
              </div>

              <ul className="list-disc pl-5 text-sm mb-2">
                {q.answer.map((ans, i) => (
                  <li
                    key={i}
                    className={`${
                      ans.isCorrect
                        ? "font-semibold text-green-700"
                        : "text-gray-800"
                    }`}
                  >
                    {ans.text} {ans.isCorrect && "✅"}
                  </li>
                ))}
              </ul>

              <div className="flex justify-between text-xs italic">
                <p>Người tạo: Minh Đức</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(q)}
                    className="text-blue-700 hover:underline"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="text-red-700 hover:underline"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center italic text-gray-700">
            Chưa có câu hỏi nào.
          </div>
        )}
      </div>

      {/* 🟡 Popup thêm/sửa câu hỏi */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl w-[500px] relative">
            <h2 className="text-lg font-bold mb-3 text-center">
              {isEditing ? "✏️ Cập nhật câu hỏi" : "➕ Thêm câu hỏi mới"}
            </h2>

            <input
              type="text"
              placeholder="Tên chủ đề (VD: Từ vựng tiếng Anh)"
              value={newQuestion.title}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, title: e.target.value })
              }
              className="w-full p-2 mb-2 border rounded"
            />

            <input
              type="text"
              placeholder="Mã câu hỏi (VD: EN_VOCAB_1)"
              value={newQuestion.name}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, name: e.target.value })
              }
              className="w-full p-2 mb-2 border rounded"
            />

            <textarea
              placeholder="Nội dung câu hỏi"
              value={newQuestion.question}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, question: e.target.value })
              }
              className="w-full p-2 mb-2 border rounded"
            />

            <h3 className="text-sm font-semibold mb-1">Đáp án:</h3>
            {newQuestion.answer.map((ans, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  placeholder={`Đáp án ${idx + 1}`}
                  value={ans.text}
                  onChange={(e) => {
                    const newAns = [...newQuestion.answer];
                    newAns[idx].text = e.target.value;
                    setNewQuestion({ ...newQuestion, answer: newAns });
                  }}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="checkbox"
                  checked={ans.isCorrect}
                  onChange={(e) => {
                    const newAns = [...newQuestion.answer];
                    newAns[idx].isCorrect = e.target.checked;
                    setNewQuestion({ ...newQuestion, answer: newAns });
                  }}
                />
                <span className="text-sm">Đúng</span>
              </div>
            ))}

            <div className="flex justify-between mt-4">
              <button
                onClick={handleAddQuestion}
                className="bg-[#f9ab0e] hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded w-[48%]"
              >
                {isEditing ? "Cập nhật" : "Thêm"}
              </button>
              <button
                onClick={() => setShowPopup(false)}
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

export default QuestionList;
