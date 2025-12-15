import React, { useEffect, useState } from "react";
import giftApi from "../../api/giftApi";
import type { Gift } from "../../types/gift";

const StoreAdmin: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeems, setRedeems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"gift" | "redeem">("gift");

  const [form, setForm] = useState<{
    id?: string;
    name: string;
    description: string;
    price: string;
    stock: string;
    imagePreview: string;
    imageFile: File | null;
  }>({
    id: undefined,
    name: "",
    description: "",
    price: "",
    stock: "",
    imagePreview: "",
    imageFile: null,
  });

  const resetForm = () => {
    setForm({
      id: undefined,
      name: "",
      description: "",
      price: "",
      stock: "",
      imagePreview: "",
      imageFile: null,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [giftRes, redeemRes] = await Promise.all([
          giftApi.getAll(),
          giftApi.getRedeems(),
        ]);
        setGifts(giftRes.data.gifts || []);
        setRedeems(redeemRes.data.redeems || []);
      } catch (err: any) {
        console.error("❌ Lỗi khi lấy dữ liệu quản lý quà:", err);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Lỗi khi lấy dữ liệu quản lý quà"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const preview = reader.result;
        setForm((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: preview,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (gift: Gift) => {
    setForm({
      id: gift._id,
      name: gift.name,
      description: gift.description || "",
      price: String(gift.price),
      stock: String(gift.stock ?? ""),
      imagePreview: gift.image || "",
      imageFile: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = Number(form.price) || 0;
    const stock = form.stock === "" ? undefined : Number(form.stock);

    const payload: any = {
      name: form.name,
      description: form.description,
      price,
      stock,
    };

    if (form.imagePreview && form.imagePreview.startsWith("data:")) {
      payload.imageBase64 = form.imagePreview;
    }

    try {
      if (form.id) {
        const res = await giftApi.update(form.id, payload);
        setGifts((prev) =>
          prev.map((g) => (g._id === form.id ? res.data.gift : g))
        );
        alert("✅ Cập nhật quà tặng thành công");
      } else {
        const res = await giftApi.create(payload);
        setGifts((prev) => [res.data.gift, ...prev]);
        alert("✅ Thêm quà tặng thành công");
      }
      resetForm();
    } catch (err: any) {
      console.error("❌ Lỗi lưu quà tặng:", err);
      alert(
        err?.response?.data?.message || err.message || "Lưu quà tặng thất bại"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xoá quà tặng này?")) return;

    try {
      await giftApi.remove(id);
      setGifts((prev) => prev.filter((g) => g._id !== id));
      alert("✅ Xoá quà tặng thành công");
    } catch (err: any) {
      console.error("❌ Lỗi xoá quà tặng:", err);
      alert(
        err?.response?.data?.message || err.message || "Xoá quà tặng thất bại"
      );
    }
  };

  const handleUpdateRedeemStatus = async (
    id: string,
    status: "Đang chờ" | "Đã chuyển"
  ) => {
    try {
      const res = await giftApi.updateRedeemStatus(id, status);
      setRedeems((prev) =>
        prev.map((r) => (r._id === id ? res.data.redeem : r))
      );
    } catch (err: any) {
      console.error("❌ Lỗi cập nhật trạng thái:", err);
      alert(
        err?.response?.data?.message ||
          err.message ||
          "Cập nhật trạng thái thất bại"
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFE1BD] min-h-screen flex items-center justify-center text-lg font-semibold">
        Đang tải dữ liệu quản lý quà...
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
    <div className="bg-[#FFE1BD] min-h-screen p-4 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
        Quản lý quà & yêu cầu đổi quà
      </h1>

      {/* Tabs */}
      <div className="flex border-b text-sm bg-white rounded-xl shadow overflow-hidden">
        <button
          type="button"
          onClick={() => setActiveTab("gift")}
          className={`flex-1 py-2 text-center font-semibold ${
            activeTab === "gift"
              ? "bg-[#fbeac6] text-[#f59e0b]"
              : "bg-white text-gray-600"
          }`}
        >
          Quản lý quà
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("redeem")}
          className={`flex-1 py-2 text-center font-semibold border-l ${
            activeTab === "redeem"
              ? "bg-[#fbeac6] text-[#f59e0b]"
              : "bg-white text-gray-600"
          }`}
        >
          Yêu cầu đổi quà
        </button>
      </div>

      {/* Tab: Quản lý quà */}
      {activeTab === "gift" && (
        <>
          {/* Form thêm / sửa quà */}
          <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3 text-center sm:text-left">
          {form.id ? "Sửa quà tặng" : "Thêm quà tặng mới"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
        >
          <div className="flex flex-col gap-1">
            <label className="font-semibold">Tên quà</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
              className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#f9ab0e]"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold">Giá (đ)</label>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: e.target.value }))
              }
              className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#f9ab0e]"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold">Số lượng (tuỳ chọn)</label>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) =>
                setForm((p) => ({ ...p, stock: e.target.value }))
              }
              className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#f9ab0e]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold">Ảnh quà</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-xs"
            />
            {form.imagePreview && (
              <img
                src={form.imagePreview}
                alt={form.name}
                className="mt-1 w-20 h-20 object-cover rounded border"
              />
            )}
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-semibold">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-[#f9ab0e] min-h-[60px] resize-y"
            />
          </div>
          <div className="flex gap-2 sm:col-span-2 justify-end mt-1">
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
              >
                Huỷ
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#f9ab0e] hover:bg-[#f59e0b] text-white font-semibold text-sm"
            >
              {form.id ? "Lưu thay đổi" : "Thêm quà"}
            </button>
          </div>
        </form>
      </div>

          {/* Danh sách quà */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-3">Danh sách quà tặng</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gifts.length === 0 ? (
                <div className="col-span-full text-center italic text-sm">
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

                    <div className="flex justify-end gap-1 mt-1">
                      <button
                        onClick={() => handleEdit(gift)}
                        className="px-2 py-1 rounded bg-white hover:bg-gray-100 text-xs"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(gift._id)}
                        className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Tab: Yêu cầu đổi quà */}
      {activeTab === "redeem" && (
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3 text-center sm:text-left">
            Yêu cầu đổi quà
          </h2>
          {redeems.length === 0 ? (
            <div className="text-sm italic">Chưa có yêu cầu nào.</div>
          ) : (
            <div className="overflow-x-auto text-xs sm:text-sm">
              <table className="min-w-full border">
                <thead className="bg-[#f9ab0e] text-white">
                  <tr>
                    <th className="px-2 py-1 border">Thời gian</th>
                    <th className="px-2 py-1 border">User</th>
                    <th className="px-2 py-1 border">Quà</th>
                    <th className="px-2 py-1 border">Ngân hàng</th>
                    <th className="px-2 py-1 border">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {redeems.map((r) => (
                    <tr key={r._id} className="bg-[#fbeac6]">
                      <td className="px-2 py-1 border align-top">
                        {new Date(r.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-2 py-1 border align-top">
                        <div className="font-semibold">
                          {r.user?.username || "Ẩn danh"}
                        </div>
                        <div className="text-[11px] truncate">
                          {r.user?.email || "-"}
                        </div>
                      </td>
                      <td className="px-2 py-1 border align-top">
                        <div>{r.giftName || r.gift?.name}</div>
                        <div className="text-[11px]">
                          Giá:{" "}
                          {(r.giftPrice || r.gift?.price || 0).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          đ
                        </div>
                      </td>
                      <td className="px-2 py-1 border align-top text-[11px]">
                        <div>{r.bankName}</div>
                        <div>{r.bankAccountName}</div>
                        <div>{r.bankAccountNumber}</div>
                      </td>
                      <td className="px-2 py-1 border align-top">
                        <select
                          value={r.status}
                          onChange={(e) =>
                            handleUpdateRedeemStatus(
                              r._id,
                              e.target.value as "Đang chờ" | "Đã chuyển"
                            )
                          }
                          className="border rounded px-2 py-1 text-xs bg-white"
                        >
                          <option value="Đang chờ">Đang chờ</option>
                          <option value="Đã chuyển">Đã chuyển</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreAdmin;


