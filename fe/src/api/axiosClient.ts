import axios, { type AxiosInstance } from "axios";

// Base URL:
// - Ưu tiên VITE_API_URL nếu có
// - Nếu đang dev: dùng localhost
// - Nếu build production (deploy): dùng BE trên Render
const API =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV
    ? "http://localhost:3000/api"
    : "https://englishapp-qpn7.onrender.com/api");

const axiosClient: AxiosInstance = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: tự động thêm Authorization header nếu có token
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // token lưu sau khi login
    if (token) {
        if (config.headers) {
            // update existing headers object to preserve AxiosHeaders methods
            (config.headers as any).Authorization = `Bearer ${token}`; // gửi token kèm request
        } else {
            // create headers object when none exists
            config.headers = { Authorization: `Bearer ${token}` } as any;
        }
    }
    return config;
});

export default axiosClient;
