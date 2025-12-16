import axiosClient from "./axiosClient";
import type { Question, NewQuestion } from "../types/question";

const questionApi = {
  // Lấy tất cả câu hỏi
  getAll: () =>
    axiosClient.get<{ message: string; question: Question[] }>("/question/getall"),

  // Tạo mới 1 câu hỏi
  create: (data: NewQuestion) =>
    axiosClient.post<{ message: string; question: Question }>(
      "/question/new",
      data
    ),

  // Gọi AI (Grok) để sinh câu hỏi – chỉ admin mới có quyền
  generateByAI: (params: {
    numQuestions: number;
    category: string;
    topic: string;
  }) =>
    axiosClient.post<{
      message: string;
      total: number;
      questions: Question[];
    }>("/question/generate-ai", params),

  // Gọi AI để sinh từ vựng TOEIC theo cấp độ CEFR – chỉ admin mới có quyền
  generateTOEICByLevel: (params: {
    numQuestions: number;
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  }) =>
    axiosClient.post<{
      message: string;
      total: number;
      level: string;
      questions: Question[];
    }>("/question/generate-toeic", params),

  update: (id: string, data: NewQuestion) =>
    axiosClient.put(`/question/update/${id}`, data),
  // Xóa câu hỏi
  delete: (id: string) =>
    axiosClient.delete<{ message: string }>(`/question/delete/${id}`),
};

export default questionApi;
