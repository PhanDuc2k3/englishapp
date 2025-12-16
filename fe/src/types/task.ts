export interface AnswerType {
  _id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionType {
  _id: string;
  question: string;
  answer: AnswerType[];
  title?: string;
  name?: string;
}

export interface Task {
  _id: string;
  name: string;
  folder?: {
    _id: string;
    name: string;
    color?: string;
  } | null;
  question: QuestionType[];
  users?: string[]; // danh sách userId
  createdAt?: string;
  updatedAt?: string;
}

export interface NewTask {
  name: string;
  question?: string[];
  mode?: "ai" | "auto" | "manual";
  numQuestions?: number;
  category?: string;
  topic?: string;
  maxDuplicatePercent?: number; // Tỷ lệ % cho phép trùng (0-100, mặc định 20)
  folder?: string | null; // ID của folder (null = không có folder)
}

export interface QuestionAdd {
  id_question: string;
}

export interface AnswerSubmit {
  id_question: string;
  selectedAnswer: string;
}
