import axiosClient from "./axiosClient";
import type { Folder, NewFolder } from "../types/folder";

const folderApi = {
  // Lấy tất cả folder
  getAll: () =>
    axiosClient.get<{ message: string; folders: Folder[] }>("/folder/getall"),

  // Lấy folder theo ID
  getById: (id: string) =>
    axiosClient.get<{ message: string; folder: Folder }>(`/folder/${id}`),

  // Tạo folder mới (chỉ admin)
  create: (data: NewFolder) =>
    axiosClient.post<{ message: string; folder: Folder }>("/folder/new", data),

  // Cập nhật folder (chỉ admin)
  update: (id: string, data: Partial<NewFolder>) =>
    axiosClient.put<{ message: string; folder: Folder }>(
      `/folder/update/${id}`,
      data
    ),

  // Xóa folder (chỉ admin)
  delete: (id: string) =>
    axiosClient.delete<{ message: string; folder: Folder }>(
      `/folder/delete/${id}`
    ),
};

export default folderApi;

