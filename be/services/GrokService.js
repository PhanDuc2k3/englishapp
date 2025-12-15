const https = require("https");

// Ưu tiên GROQ_API_KEY (Groq gsk_xxx), fallback GROK_API_KEY nếu bạn vẫn dùng x.ai
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;

if (!GROQ_API_KEY) {
  console.warn(
    "[GrokService] Thiếu GROQ_API_KEY / GROK_API_KEY trong biến môi trường. Chức năng AI sẽ không hoạt động."
  );
}

/**
 * Gọi Groq (gsk_xxx) để sinh câu hỏi trắc nghiệm từ vựng.
 * Tạm thời chỉ hỗ trợ dạng từ vựng (vocabulary).
 *
 * @param {Object} options
 * @param {number} options.numQuestions - Số câu hỏi cần sinh
 * @param {string} options.category - Thể loại (vd: 'vocabulary')
 * @param {string} options.topic - Chủ đề (vd: 'travel', 'food')
 */
async function generateVocabularyQuestions({ numQuestions, category, topic }) {
  if (!GROQ_API_KEY) {
    throw new Error("Chưa cấu hình GROQ_API_KEY hoặc GROK_API_KEY");
  }

  const payload = {
    // Model Groq, ví dụ: mixtral-8x7b-32768, llama-3.1-70b-versatile, v.v.
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "Bạn là hệ thống tạo câu hỏi trắc nghiệm từ vựng tiếng Anh cho người Việt. " +
          "Mỗi câu hỏi phải hỏi nghĩa của MỘT từ/cụm từ tiếng Việt sang TIẾNG ANH, ví dụ: 'Máy tính' -> đáp án đúng là 'computer'. " +
          "QUY TẮC NGÔN NGỮ BẮT BUỘC:\n" +
          "- Trường `question` LUÔN LUÔN là TIẾNG VIỆT (câu hỏi/định nghĩa/ghi chú bằng tiếng Việt).\n" +
          "- TẤT CẢ đáp án trong mảng `answer[].text` PHẢI LÀ TIẾNG ANH.\n" +
          "- Không được dùng tiếng Việt trong đáp án.\n" +
          "Luôn đảm bảo chỉ có đúng 1 đáp án đúng (isCorrect = true). Chỉ trả về JSON hợp lệ.",
      },
      {
        role: "user",
        content: `Hãy tạo ${numQuestions} câu hỏi trắc nghiệm từ vựng tiếng Anh cho người học tiếng Việt.
Thể loại: ${category}.
Chủ đề (viết bằng tiếng Việt, hãy tự hiểu nghĩa và áp dụng cho từ vựng): ${topic}.

Mỗi câu hỏi phải tuân thủ QUY TẮC sau:
- Câu hỏi (field "question") là TIẾNG VIỆT, hỏi nghĩa của một từ/cụm từ (ngắn gọn, không dài dòng), ví dụ: "Từ tiếng Anh nào có nghĩa là 'máy tính'?" hoặc chỉ cần "máy tính".
- 4 đáp án (field "answer"[]."text") đều là TỪ/CỤM TỪ TIẾNG ANH, ngắn gọn, ví dụ: "computer", "table", "phone"...
- Không được có tiếng Việt trong bất kỳ đáp án nào.
- Đảm bảo chỉ có duy nhất 1 đáp án đúng (isCorrect = true).

Yêu cầu format JSON CHÍNH XÁC như sau:
[
  {
    "title": "từ vựng - ${topic}",
    "question": "Câu hỏi/định nghĩa/gợi ý bằng tiếng Việt",
    "name": "vocabulary",
    "answer": [
      { "text": "Từ/cụm từ tiếng Anh A", "isCorrect": false },
      { "text": "Từ/cụm từ tiếng Anh B", "isCorrect": true },
      { "text": "Từ/cụm từ tiếng Anh C", "isCorrect": false },
      { "text": "Từ/cụm từ tiếng Anh D", "isCorrect": false }
    ]
  }
]

Chỉ trả về MẢNG JSON, không thêm giải thích, không thêm text ngoài JSON.`,
      },
    ],
    temperature: 0.7,
  };

  const data = JSON.stringify(payload);

  const options = {
    hostname: "api.groq.com",
    // Groq dùng OpenAI-compatible endpoint
    path: "/openai/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Length": Buffer.byteLength(data),
    },
  };

  const responseBody = await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(
            new Error(
              `Groq API lỗi: ${res.statusCode} - ${body || res.statusMessage}`
            )
          );
        }

        resolve(body);
      });
    });

    req.on("error", (err) => reject(err));

    req.write(data);
    req.end();
  });

  const parsed = JSON.parse(responseBody);

  const content = parsed.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Không nhận được nội dung từ Groq");
  }

  let questions;
  try {
    questions = JSON.parse(content);
  } catch (err) {
    console.error("Lỗi parse JSON từ nội dung Groq:", content);
    throw new Error("Groq trả về nội dung không phải JSON hợp lệ");
  }

  if (!Array.isArray(questions)) {
    throw new Error("Dữ liệu Groq trả về không phải mảng câu hỏi");
  }

  return questions;
}

module.exports = {
  generateVocabularyQuestions,
};