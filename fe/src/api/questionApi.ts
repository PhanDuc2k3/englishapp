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
update: (id: string, data: NewQuestion) =>
    axiosClient.put(`/question/update/${id}`, data),
  // Xóa câu hỏi
  delete: (id: string) =>
    axiosClient.delete<{ message: string }>(`/question/delete/${id}`),
};

export default questionApi;
