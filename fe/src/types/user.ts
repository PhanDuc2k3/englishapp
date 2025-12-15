export interface User {
  id: string;
  _id?: string;
  username: string;
  email: string;
  role?: "user" | "admin";
  point?: number;
  avatar?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
}

export interface LoginPayLoad {
  email: string;
  password: string;
}

export interface RegisterPayLoad {
  username: string;
  email: string;
  password: string;
}