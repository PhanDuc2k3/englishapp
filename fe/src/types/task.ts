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
}

export interface QuestionAdd {
  id_question: string;
}

export interface AnswerSubmit {
  id_question: string;
  selectedAnswer: string;
}
