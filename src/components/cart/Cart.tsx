import React from "react";
import { useNavigate } from "react-router";
import { useApp } from "../../context/AppContext";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";

export default function Cart() {
  const { cart, removeFromCart, updateCartItem, user } =
    useApp();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  const updateQuantity = (
    productId: string,
    currentQuantity: number,
    change: number,
    type?: string,
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateCartItem(productId, newQuantity, type);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#AF140B] via-[#D91810] to-[#AF140B] text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full mb-4 backdrop-blur-sm">
              <ShoppingBag className="size-6" />
              <span className="font-bold text-lg">
                GIỎ HÀNG
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Giỏ Hàng Của Bạn
            </h1>
            <p className="text-xl text-white/90">
              Quản lý sản phẩm yêu thích
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="size-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#AF140B] text-white px-8 py-4 rounded-2xl hover:bg-[#8D0F08] transition-all shadow-lg font-bold text-lg"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#AF140B] via-[#D91810] to-[#AF140B] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full mb-4 backdrop-blur-sm">
            <ShoppingBag className="size-6" />
            <span className="font-bold text-lg">GIỎ HÀNG</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Giỏ Hàng Của Bạn
          </h1>
          <p className="text-xl text-white/90">
            {cart.length} sản phẩm đang chờ
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#AF140B] hover:text-[#8D0F08] mb-6 font-semibold"
        >
          <ArrowLeft className="size-5" />
          Tiếp tục mua sắm
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div
                key={`${item.product.id}-${item.type || "default"}-${index}`}
                className="bg-white rounded-2xl shadow-lg p-5 flex gap-4 hover:shadow-xl transition-shadow border-2 border-gray-200 hover:border-[#AF140B]"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-28 h-28 object-cover rounded-xl"
                />

                <div className="flex-1">
                  <h3 className="font-bold text-[#2C2C2C] mb-1 text-lg">
                    {item.product.name}
                  </h3>
                  {item.type && (
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      Loại: {item.type}
                    </p>
                  )}
                  <p className="text-[#AF140B] font-bold text-lg">
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() =>
                      removeFromCart(item.product.id)
                    }
                    className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="size-5" />
                  </button>

                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantity,
                          -1,
                          item.type,
                        )
                      }
                      className="p-2 hover:bg-[#FFE5E3] rounded-lg transition-all text-[#AF140B]"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-[#2C2C2C]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantity,
                          1,
                          item.type,
                        )
                      }
                      className="p-2 hover:bg-[#FFE5E3] rounded-lg transition-all text-[#AF140B]"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">
                Tóm Tắt Đơn Hàng
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold">
                    Tính sau
                  </span>
                </div>
                <div className="border-t-2 border-dashed border-gray-300 pt-3 flex justify-between font-bold text-xl">
                  <span className="text-[#2C2C2C]">
                    Tổng cộng:
                  </span>
                  <span className="text-[#78A2D2]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-[#AF140B] text-white py-4 rounded-xl hover:bg-[#8D0F08] transition-all shadow-lg font-bold text-lg"
              >
                Đặt Hàng
              </button>

              <div className="mt-4 text-sm text-gray-600 space-y-2 bg-[#FFE5E3] p-4 rounded-xl">
                <p className="flex items-center gap-2">
                  <span className="text-[#AF140B]">✓</span>
                  Miễn phí vận chuyển đơn từ 500.000đ
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-[#AF140B]">✓</span>
                  Thanh toán an toàn & bảo mật
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}