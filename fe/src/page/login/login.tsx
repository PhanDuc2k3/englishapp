import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import userApi from "../../api/userApi";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // dùng để redirect sau khi login

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await userApi.login({ email, password });
      const token = res.data.token; // backend trả token
      const user = res.data.user;   // backend trả thông tin user (tuỳ backend)

      // ✅ Lưu token vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Đăng nhập thành công");
      navigate("/"); // chuyển tới trang home
    } catch (error: any) {
      if (error.response) {
        alert("Tài khoản hoặc mật khẩu không đúng");
      } else {
        alert("Lỗi server");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl p-6 shadow-md w-100 h-full mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Đăng nhập</h1>

        <iframe
          src="https://tenor.com/embed/16490985730045753004"
          width="100%"
          height="200"
          allowFullScreen
        ></iframe>

        <form onSubmit={handleSubmit}>
          <div>
            <span>Tài khoản:</span>
            <input
              type="email"
              value={email}
              placeholder="Hãy nhập email của bạn"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded placeholder-gray-400 placeholder-opacity-70 italic"
              required
            />
          </div>

          <div className="mt-6 mb-10">
            <span>Mật khẩu:</span>
            <input
              type="password"
              value={password}
              placeholder="Hãy nhập mật khẩu"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded placeholder-gray-400 placeholder-opacity-70 italic"
              required
            />
          </div>

          <button
            type="submit"
            className="w-1/2 mx-auto flex justify-center items-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>

          <Link to="/register" className="mx-auto justify-center flex my-5">
            Đăng ký tài khoản
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
