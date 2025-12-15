import React, { useState, useEffect } from "react";
import { Menu, CircleUserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types/user";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setOpenDropdown(false);
    navigate("/login");
  };

  return (
    <div className="bg-[#FFE794] h-[10vh] flex items-center px-4 relative">
      <Menu
        className="w-10 h-10 cursor-pointer"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex justify-center items-center font-bold italic text-2xl">
        Ác Quỷ
      </div>

      {/* Avatar + dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpenDropdown((prev) => !prev)}
          className="flex items-center gap-2 cursor-pointer"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover border border-yellow-500"
            />
          ) : (
            <CircleUserRound className="w-10 h-10" />
          )}
          {user && (
            <span className="hidden sm:inline text-sm font-semibold">
              {user.username}
            </span>
          )}
        </button>

        {openDropdown && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50 text-sm">
            {user ? (
              <>
                {/* Thông tin user */}
                <div className="px-4 py-2 border-b text-xs text-gray-600 flex items-center gap-2">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border border-yellow-500"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold flex items-center gap-1">
                      <span className="truncate">{user.username}</span>
                      {user.role === "admin" && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="truncate">{user.email}</div>
                  </div>
                </div>

                {/* Ví tiền */}
                <div className="px-4 py-2 border-b text-xs text-gray-700 bg-yellow-50 flex items-center justify-between gap-2">
                  <span className="font-semibold">Ví của bạn:</span>
                  <span className="font-bold text-green-700 text-sm">
                    {(user.point ?? 0).toLocaleString("vi-VN")} đ
                  </span>
                </div>

                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Trang cá nhân
                </button>

                {isAdmin && (
                  <>
                    <div className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wide text-gray-500">
                      Quản lý (Admin)
                    </div>
                    <button
                      onClick={() => {
                        setOpenDropdown(false);
                        navigate("/task_management");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Quản lý bài tập
                    </button>
                    <button
                      onClick={() => {
                        setOpenDropdown(false);
                        navigate("/store_admin");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Quản lý quà & đổi quà
                    </button>
                    <button
                      onClick={() => {
                        setOpenDropdown(false);
                        navigate("/user_management");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Quản lý người dùng
                    </button>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 border-t mt-1"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    navigate("/login");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    setOpenDropdown(false);
                    navigate("/register");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
