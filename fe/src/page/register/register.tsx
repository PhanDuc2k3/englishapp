import React from "react";
import { useState } from "react";
import userApi from "../../api/userApi"
import {Link} from "react-router-dom"
const Register: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [username, setusername] = useState("");

    async function registerSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (password !== confirmPass) {
                alert("Tai khoan va mat khau khong dung");
                return;
            }
            const res = await userApi.register({ username, email, password });
            alert("Dang ky thanh cong")

                   
        }
        catch (error: any) {
            if (error.response) {
                alert("Dang ky that bai");
            }
            else {
                alert("Loi , vui long thu lai sau");
            }
        }

    }
    return (
        <div className="min-h-screen flex items-center justify-center  bg-gray-100 ">
            <div className="bg-white rounded-2xl p-6 shadow-md w-100 h-full  mx-auto ">
                <h1 className="text-2xl font-bold mb-4  text-center">Đăng ký</h1>
                <iframe
  src="https://tenor.com/embed/16490985730045753004"
  width="100%"
  height="200"
  frameBorder="0"
  allowFullScreen
></iframe>
                <form className="" onSubmit = {registerSubmit}>
                    <div className="mt-6 mb-4">
                        <span>username:</span>
                        <input
                            type="text"
                            placeholder="Hay nhap ten cua ban"
                            value = {username}
                            className="w-full px-3 py-2 border rounded placeholder-gray-400 placeholder-opacity-70 italic"
                            onChange = {u => setusername(u.target.value)}
                            required
                        />
                    </div>
                    <div className="mt-6 mb-4">
                        <span>Email</span>
                        <input
                            type="email"
                            placeholder="Hay nhap email cua ban"
                            value={email}
                            onChange = {u => setEmail(u.target.value)}
                            className = "w-full px-3 py-2 border rounded placeholder-gray-400 placeholder-opacity-70 italic"
                            required
                        />
                    </div>
                    <div className="mt-6 mb-4">
                        <span>Mật khẩu</span>
                        <input
                            type="password"
                            value = {password}
                            placeholder="Hay nhap mat khau cua ban"
                            onChange={u=>setPassword(u.target.value)}
                            className = "w-full px-3 py-2 border rounded placeholder-gray-400 placeholder-opacity-70 italic"
                            required
                        />
                    </div>
                    <div className="mt-6 mb-10">
                        <span>Nhập lại mật khẩu:</span>
                        <input
                            type="password"
                            placeholder="Xac nhan mat khau"
                            value={confirmPass}
                            onChange ={u=>setConfirmPass(u.target.value)}
                            className = "w-full px-3 py-2 border rounded placeholder-gray-400 placeholder-opacity-70   italic"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className = "w-1/2 mx-auto flex justify-center items-center  bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Đăng ký
                    </button>

                    <Link to="/login" className="mx-auto justify-center flex my-5">Đăng nhập tài khoản tại đây</Link>
                </form>
            </div>
        </div>
    )
}

export default Register;