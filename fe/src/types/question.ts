export interface AnswerOption {
  text: string;
  isCorrect: boolean;
}

export interface NewQuestion {
  question: string;
  answer: AnswerOption[];
  title: string;
  name: string;
}

export interface Question extends NewQuestion {
  _id: string;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  createdAt?: string;
  updatedAt?: string;
}
