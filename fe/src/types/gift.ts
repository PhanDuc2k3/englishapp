export interface Gift {
  _id: string;
  name: string;
  description?: string;
  price: number; // giá đổi (đồng/điểm)
  image?: string;
  stock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GiftPayload {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  imageBase64?: string;
}


