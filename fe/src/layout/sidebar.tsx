import React from "react";
import { Link } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile }) => {
  return (
    <>
      {/* Overlay cho mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={onClose}
        ></div>
      )}

      <div
        className={`fixed ${
          isMobile ? "top-0 h-full" : "top-[10vh] h-[90vh]"
        } left-0 bg-white shadow-md z-50 transform transition-transform duration-300
        ${isMobile ? "w-full" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b">
          <div className="w-full font-bold text-2xl italic text-center">
            Mục lục
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black text-xl font-bold ml-2"
            >
              ✕
            </button>
          )}
        </div>

        {/* Nội dung */}
        <div className="p-4 overflow-auto h-[calc(100%-64px)] space-y-4">
          <Link
            to="/"
            onClick={onClose}
            className="block w-full h-10 bg-[#fbeac6] font-bold text-2xl italic flex items-center justify-center rounded-xl hover:bg-[#f9d782] transition"
          >
            Làm bài kiểm tra
          </Link>
          <Link
            to="/score"
            onClick={onClose}
            className="block w-full h-10 bg-[#fbeac6] font-bold text-2xl italic flex items-center justify-center rounded-xl hover:bg-[#f9d782] transition"
          >
            Xem lịch sử
          </Link>
          <Link
            to="/store"
            onClick={onClose}
            className="block w-full h-10 bg-[#fbeac6] font-bold text-2xl italic flex items-center justify-center rounded-xl hover:bg-[#f9d782] transition"
          >
            Đổi quà
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
