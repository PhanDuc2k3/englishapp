import axiosClient from "./axiosClient";
import type { Gift, GiftPayload } from "../types/gift";

const giftApi = {
  getAll: () =>
    axiosClient.get<{
      message: string;
      gifts: Gift[];
    }>("/gift"),

  create: (data: GiftPayload) =>
    axiosClient.post<{ message: string; gift: Gift }>("/gift", data),

  update: (id: string, data: Partial<GiftPayload>) =>
    axiosClient.put<{ message: string; gift: Gift }>(`/gift/${id}`, data),

  remove: (id: string) =>
    axiosClient.delete<{ message: string; gift: Gift }>(`/gift/${id}`),

  // User đổi quà
  redeem: (id: string) =>
    axiosClient.post<{
      message: string;
      redeem: any;
      currentPoint: number;
    }>(`/gift/${id}/redeem`, {}),

  // Admin: danh sách yêu cầu đổi quà
  getRedeems: () =>
    axiosClient.get<{
      message: string;
      redeems: any[];
    }>("/gift/redeem/list"),

  // Admin: cập nhật trạng thái
  updateRedeemStatus: (id: string, status: "Đang chờ" | "Đã chuyển") =>
    axiosClient.put<{ message: string; redeem: any }>(
      `/gift/redeem/${id}/status`,
      { status }
    ),

  // User: lịch sử đổi quà của chính mình
  getMyRedeems: () =>
    axiosClient.get<{
      message: string;
      redeems: any[];
    }>("/gift/redeem/my"),
};

export default giftApi;


