import axiosClient from "./axiosClient";

const userApi = {
  login: (data: { email: string; password: string }) =>
    axiosClient.post("/user/login", data),
  register: (data: any) => axiosClient.post("/user/register", data),
  getProfile: () =>
    axiosClient.get("/user/profile", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }),
};

export default userApi;
