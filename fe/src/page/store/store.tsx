import React, { useEffect, useState } from "react";
import giftApi from "../../api/giftApi";
import type { Gift } from "../../types/gift";
import type { User } from "../../types/user";

const Store: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const res = await giftApi.getAll();
        setGifts(res.data.gifts || []);
      } catch (err: any) {
        console.error("❌ Lỗi khi lấy danh sách quà:", err);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Lỗi khi lấy danh sách quà"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGifts();
  }, []);

  const handleRedeem = async (gift: Gift) => {
    if (!user) {
      alert("Vui lòng đăng nhập để đổi quà.");
      return;
    }
    if ((user.point ?? 0) < gift.price) {
      alert("Bạn không đủ điểm để đổi quà này.");
      return;
    }

    try {
      const res = await giftApi.redeem(gift._id);
      const newPoint = res.data.currentPoint;

      const updatedUser: User = {
        ...(user as User),
        point: newPoint,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert(
        "✅ Tạo yêu cầu đổi quà thành công. Admin sẽ kiểm tra và chuyển khoản cho bạn."
      );
    } catch (err: any) {
      console.error("❌ Lỗi đổi quà:", err);
      alert(err?.response?.data?.message || err.message || "Đổi quà thất bại");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFE1BD] min-h-screen flex items-center justify-center text-lg font-semibold">
        Đang tải quà tặng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFE1BD] min-h-screen flex items-center justify-center text-center p-4">
        <div className="bg-white p-4 rounded-lg shadow text-red-600 text-sm max-w-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFE1BD] min-h-screen p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 text-center sm:text-left">
        Đổi quà
      </h1>

      {user && (
        <p className="text-sm mb-4 text-center sm:text-left">
          Ví hiện tại:{" "}
          <span className="font-bold text-green-700">
            {(user.point ?? 0).toLocaleString("vi-VN")} đ
          </span>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.length === 0 ? (
          <div className="col-span-full text-center italic">
            Chưa có quà tặng nào.
          </div>
        ) : (
          gifts.map((gift) => (
            <div
              key={gift._id}
              className="bg-[#f9ab0e] rounded-xl shadow-md p-3 flex flex-col gap-2"
            >
              {gift.image && (
                <img
                  src={gift.image}
                  alt={gift.name}
                  className="w-full h-32 object-cover rounded-lg border border-yellow-200"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1">{gift.name}</h3>
                <p className="text-sm text-gray-700 mb-1">
                  Giá:{" "}
                  <span className="font-semibold">
                    {gift.price.toLocaleString("vi-VN")} đ
                  </span>
                </p>
                {typeof gift.stock === "number" && (
                  <p className="text-xs text-gray-700 mb-1">
                    Số lượng còn: {gift.stock}
                  </p>
                )}
                {gift.description && (
                  <p className="text-xs text-gray-800 italic line-clamp-3">
                    {gift.description}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mt-1">
                <button
                  onClick={() => handleRedeem(gift)}
                  className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white text-xs font-semibold disabled:opacity-60"
                  disabled={!user || (user.point ?? 0) < gift.price}
                >
                  Đổi quà
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Store;