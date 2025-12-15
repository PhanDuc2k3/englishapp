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
  createdAt?: string;
  updatedAt?: string;
}
