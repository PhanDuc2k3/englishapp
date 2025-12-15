import axios, { type AxiosInstance } from "axios";

// Dùng biến môi trường khi build (Vite), fallback về localhost khi dev
const API =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
