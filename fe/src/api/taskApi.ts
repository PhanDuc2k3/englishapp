import axiosClient from "./axiosClient";
import type { Task, NewTask, QuestionAdd, AnswerSubmit } from "../types/task";

type TaskWithProgress = Task & {
  userAnswers?: Record<string, string>;
  submitted?: boolean;
};

const taskApi = {
  // Lấy tất cả task
  getAll: () =>
    axiosClient.get<{ message: string; task: Task[] }>("/task/getall"),

  // Lấy task theo ID (kèm tiến độ của user hiện tại)
  getTaskById: (id: string) =>
    axiosClient.get<{ message: string; task: TaskWithProgress }>(`/task/${id}`),

  // Lấy leaderboard của 1 task
  getLeaderboard: (id: string) =>
    axiosClient.get<{
      message: string;
      taskId: string;
      name: string;
      leaderboard: {
        userId: string;
        username: string;
        email: string;
        avatar?: string;
        correctCount: number;
        totalQuestions: number;
        score: number; // điểm 0 - 10
        money: number; // tiền nhận được 0 - 1000
      }[];
    }>(`/task/${id}/leaderboard`),

  // Tạo task mới
  create: (data: NewTask) =>
    axiosClient.post<{ message: string; task: Task }>("/task/newtask", data),

  // Xoá task
  delete: (id: string) =>
    axiosClient.delete<{ message: string; task: Task }>(`/task/delete/${id}`),

  // Cập nhật task
  updateTask: (id: string, data: Partial<NewTask>) =>
    axiosClient.put<{ message: string; task: Task }>(
      `/task/updatetask/${id}`,
      data
    ),

  // Thêm câu hỏi vào task
  addQuestion: (taskId: string, data: QuestionAdd) =>
    axiosClient.put<{ message: string; task: Task }>(
      `/task/addquestion/${taskId}`,
      data
    ),

  // Thêm user vào task
  addUser: (taskId: string, data: { id_user: string | null }) =>
    axiosClient.put<{ message: string; task: Task }>(
      `/task/adduser/${taskId}`,
      data
    ),

  // Xoá user khỏi task
  removeUser: (taskId: string, userId: string) =>
    axiosClient.delete<{ message: string; task: Task }>(
      `/task/removeuser/${taskId}?id_user=${userId}`
    ),

  // Xoá câu hỏi khỏi task
  removeQuestion: (taskId: string, questionId: string) =>
    axiosClient.delete<{ message: string; task: Task }>(
      `/task/removequestion/${taskId}?id_question=${questionId}`
    ),

  // Nộp bài task
  submitTask: (taskId: string, data: { id_user: string | null; answers: AnswerSubmit[] }) =>
    axiosClient.post<{
      message: string;
      task: Task;
      reward?: {
        correctCount: number;
        totalQuestions: number;
        score: number;
        money: number;
        currentPoint?: number;
      };
    }>(
      `/task/submittask/${taskId}`,
      data
    ),

  // Lưu tiến độ làm bài
  saveProgress: (taskId: string, data: { id_user: string | null; answers: AnswerSubmit[] }) =>
    axiosClient.put<{ message: string; task: Task }>(
      `/task/saveprogress/${taskId}`,
      data
    ),

  // Lịch sử làm bài của user hiện tại
  getHistory: () =>
    axiosClient.get<{
      message: string;
      history: {
        taskId: string;
        name: string;
        submitted: boolean;
        score: number;
        totalQuestions: number;
        createdAt?: string;
        updatedAt?: string;
      }[];
    }>("/task/user/history"),

  // Tính lại xu từ lịch sử làm bài
  recalculatePointsFromHistory: () =>
    axiosClient.put<{
      message: string;
      totalMoney: number;
      user: { point: number };
    }>("/task/user/recalculate-points"),
};

export default taskApi;
