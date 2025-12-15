import React, { useState } from "react";
import type { User } from "../../types/user";
import axiosClient from "../../api/axiosClient";
import taskApi from "../../api/taskApi";
import giftApi from "../../api/giftApi";

const Profile: React.FC = () => {
  const storedUser = localStorage.getItem("user");
  const parsedUser: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [user, setUser] = useState<User | null>(parsedUser);
  const [username, setUsername] = useState(parsedUser?.username || "");
  const [avatarPreview, setAvatarPreview] = useState<string>(parsedUser?.avatar || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [bankName, setBankName] = useState(parsedUser?.bankName || "");
  const [bankAccountName, setBankAccountName] = useState(parsedUser?.bankAccountName || "");
  const [bankAccountNumber, setBankAccountNumber] = useState(parsedUser?.bankAccountNumber || "");
  const [activeTab, setActiveTab] = useState<"info" | "redeem">("info");
  const [myRedeems, setMyRedeems] = useState<any[]>([]);
  const [loadingRedeem, setLoadingRedeem] = useState(false);

  const VN_BANKS = [
    "Vietcombank",
    "VietinBank",
    "BIDV",
    "Agribank",
    "Techcombank",
    "MB Bank",
    "ACB",
    "Sacombank",
    "TPBank",
    "VPBank",
    "VIB",
    "SHB",
    "Eximbank",
  ];

  if (!user) {
    return (
      <div className="bg-[#FFE1BD] min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="font-semibold mb-2">Bạn chưa đăng nhập.</p>
          <p className="text-sm text-gray-600">
            Vui lòng đăng nhập để xem và chỉnh sửa trang cá nhân.
          </p>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let avatarBase64: string | undefined;
      if (avatarFile && avatarPreview.startsWith("data:")) {
        avatarBase64 = avatarPreview;
      }

      const res = await axiosClient.put("/user/me", {
        username,
        avatarBase64,
        bankName,
        bankAccountName,
        bankAccountNumber,
      });

      const updated: User = {
        id: res.data.user._id || res.data.user.id,
        _id: res.data.user._id,
        username: res.data.user.username,
        email: res.data.user.email,
        role: res.data.user.role,
        point: res.data.user.point,
        avatar: res.data.user.avatar,
        bankName: res.data.user.bankName,
        bankAccountName: res.data.user.bankAccountName,
        bankAccountNumber: res.data.user.bankAccountNumber,
      };

      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      alert("✅ Cập nhật thông tin thành công");
    } catch (err: any) {
      console.error("❌ Lỗi cập nhật thông tin:", err);
      alert(err?.response?.data?.message || err.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFE1BD] min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Trang cá nhân</h1>

        {/* Tabs */}
        <div className="flex mb-4 border-b text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-2 text-center font-semibold ${
              activeTab === "info"
                ? "border-b-2 border-[#f9ab0e] text-[#f59e0b]"
                : "text-gray-500"
            }`}
          >
            Thông tin & ngân hàng
          </button>
          <button
            type="button"
            onClick={async () => {
              setActiveTab("redeem");
              if (myRedeems.length === 0 && !loadingRedeem) {
                try {
                  setLoadingRedeem(true);
                  const res = await giftApi.getMyRedeems();
                  setMyRedeems(res.data.redeems || []);
                } catch (err) {
                  console.error("❌ Lỗi lấy lịch sử đổi quà:", err);
                } finally {
                  setLoadingRedeem(false);
                }
              }
            }}
            className={`flex-1 py-2 text-center font-semibold ${
              activeTab === "redeem"
                ? "border-b-2 border-[#f9ab0e] text-[#f59e0b]"
                : "text-gray-500"
            }`}
          >
            Lịch sử đổi quà
          </button>
        </div>

        {activeTab === "info" && (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={username}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#f9ab0e]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#f9ab0e] flex items-center justify-center text-3xl font-bold text-white">
                {username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-[#f9ab0e] text-white text-xs px-2 py-1 rounded-full cursor-pointer shadow">
              Đổi ảnh
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="w-full space-y-3 text-sm">
            <div className="flex flex-col gap-1">
              <label className="font-semibold">Tên hiển thị</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#f9ab0e]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold">Email (không thể đổi)</label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="border rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-semibold">Vai trò:</span>
              <span className="italic">
                {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-semibold">Ví hiện tại:</span>
              <span className="font-bold text-green-700">
                {(user.point ?? 0).toLocaleString("vi-VN")} đ
              </span>
            </div>

            <div className="border-t pt-3 mt-2 space-y-2">
              <div className="font-semibold text-sm">Thông tin tài khoản ngân hàng</div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Ngân hàng</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#f9ab0e] bg-white"
                >
                  <option value="">-- Chọn ngân hàng --</option>
                  {VN_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Tên chủ tài khoản</label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  className="border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#f9ab0e]"
                  placeholder="VD: NGUYEN VAN A"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Số tài khoản</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#f9ab0e]"
                  placeholder="Nhập số tài khoản ngân hàng"
                />
              </div>

              <p className="text-[11px] text-gray-500 italic">
                Thông tin này sẽ được gửi cho admin mỗi lần bạn yêu cầu đổi quà để chuyển tiền thưởng.
              </p>
            </div>
          </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-[#f9ab0e] hover:bg-[#f59e0b] text-white font-semibold py-2 rounded-lg disabled:opacity-70"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await taskApi.recalculatePointsFromHistory();
                  const newPoint = res.data.user?.point ?? user.point ?? 0;
                  const updatedUser: User = { ...user, point: newPoint };
                  setUser(updatedUser);
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                  alert(
                    `✅ Đã tính lại ví từ lịch sử.\nTổng xu: ${newPoint.toLocaleString(
                      "vi-VN"
                    )} đ`
                  );
                } catch (err: any) {
                  console.error("❌ Lỗi tính lại xu từ lịch sử:", err);
                  alert(
                    err?.response?.data?.message ||
                      err.message ||
                      "Không thể tính lại xu từ lịch sử"
                  );
                }
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg text-sm"
            >
              Đồng bộ lại ví từ lịch sử
            </button>
          </form>
        )}

        {activeTab === "redeem" && (
          <div className="mt-2 text-sm">
            {loadingRedeem ? (
              <div className="text-center italic">Đang tải lịch sử đổi quà...</div>
            ) : myRedeems.length === 0 ? (
              <div className="text-center italic">
                Bạn chưa có yêu cầu đổi quà nào.
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-auto">
                {myRedeems.map((r) => (
                  <div
                    key={r._id}
                    className="border rounded-lg p-2 bg-[#fbeac6] text-xs sm:text-sm"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">
                        {r.giftName || r.gift?.name || "Quà tặng"}
                      </span>
                      <span className="italic">{r.status}</span>
                    </div>
                    <div>
                      Giá:{" "}
                      {(r.giftPrice || r.gift?.price || 0).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      đ
                    </div>
                    <div>
                      Thời gian:{" "}
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleString("vi-VN")
                        : "-"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;