export interface Folder {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewFolder {
  name: string;
  description?: string;
  color?: string;
  order?: number;
}

