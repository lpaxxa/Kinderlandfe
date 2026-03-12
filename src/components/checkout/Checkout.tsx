import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useApp } from '../../context/AppContext';
import {
  CreditCard, Truck, AlertCircle, MapPin, Loader2, Plus, X, Edit, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { addressApi, AddressResponse, AddressRequest } from '../../services/addressApi';
import { orderApi } from '../../services/orderApi';

// ──────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: 'COD', label: '💵 Thanh toán khi nhận hàng (COD)', desc: 'Thanh toán bằng tiền mặt khi nhận hàng' },
  { value: 'VNPAY', label: '💳 Thanh toán qua VNPay', desc: 'Thanh toán bảo mật qua cổng VNPay' },
] as const;

type PaymentMethod = 'COD' | 'VNPAY';

const emptyAddressForm: AddressRequest = {
  street: '',
  provinceId: 0,
  provinceName: '',
  districtId: 0,
  districtName: '',
  wardId: 0,
  wardName: '',
};

// ──────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────
export default function Checkout() {
  const { cart, user, removeFromCart } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Use selectedItems if passed from Cart, otherwise fallback to full cart
  const displayItems: any[] = location.state?.selectedItems || cart;

  // ── Address State ───────────────────────────────────────────────────
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressRequest>({ ...emptyAddressForm });
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);

  // ── Order State ─────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [pointsToUse, setPointsToUse] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // ── Fetch Addresses ──────────────────────────────────────────────────
  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const list = await addressApi.getMyAddresses();
      setAddresses(list);
      if (list.length > 0 && !selectedAddressId) {
        setSelectedAddressId(list[0].addressId);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      toast.error('Không thể tải danh sách địa chỉ.');
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAddresses();
    } else {
      setLoadingAddresses(false);
    }
  }, [user]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSaveAddress = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.provinceName || !addressForm.districtName || !addressForm.wardName) {
      toast.error('Vui lòng điền đầy đủ thông tin địa chỉ.');
      return;
    }
    setSavingAddress(true);
    try {
      if (editingAddressId) {
        // Cập nhật địa chỉ
        const updated = await addressApi.updateAddress(editingAddressId, addressForm);
        setAddresses(prev => prev.map(a => a.addressId === editingAddressId ? updated : a));
        toast.success('✅ Đã cập nhật địa chỉ!');
      } else {
        // Thêm mới địa chỉ
        const saved = await addressApi.createAddress(addressForm);
        setAddresses(prev => [...prev, saved]);
        setSelectedAddressId(saved.addressId);
        toast.success('✅ Đã thêm địa chỉ mới!');
      }
      setAddressForm({ ...emptyAddressForm });
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (err: any) {
      toast.error((editingAddressId ? 'Cập nhật' : 'Thêm') + ' địa chỉ thất bại: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = (addr: AddressResponse) => {
    setAddressForm({
      street: addr.street,
      provinceId: addr.provinceId,
      provinceName: addr.provinceName,
      districtId: addr.districtId,
      districtName: addr.districtName,
      wardId: addr.wardId,
      wardName: addr.wardName,
    });
    setEditingAddressId(addr.addressId);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;

    setDeletingAddressId(addressId);
    try {
      await addressApi.deleteAddress(addressId);
      setAddresses(prev => prev.filter(a => a.addressId !== addressId));
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
      toast.success('✅ Đã xóa địa chỉ!');
    } catch (err: any) {
      toast.error('Xóa địa chỉ thất bại: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      toast.error('Vui lòng chọn địa chỉ giao hàng!');
      return;
    }
    if (displayItems.length === 0) {
      toast.error('Giỏ hàng trống!');
      return;
    }

    setIsPlacingOrder(true);
    const loadingToast = toast.loading('Đang xử lý đặt hàng...');

    try {
      // Step 1: Create order from cart
      const order = await orderApi.createOrderFromCart(selectedAddressId);
      const orderId = order?.orderId;

      if (!orderId) throw new Error('Không nhận được orderId từ server.');

      // Step 2: Checkout (pay)
      const paymentUrl = await orderApi.checkout(orderId, {
        paymentMethod,
        pointsToUse: pointsToUse || 0,
      });

      toast.dismiss(loadingToast);
      toast.success('🎉 Đặt hàng thành công!');

      // Clean up cart items
      await Promise.all(
        displayItems.map(async (item: any) => {
          const cartItemId = item.id || item.cartItemId || item.idCart || item.cartId;
          if (cartItemId) {
            try { await removeFromCart(cartItemId); } catch { /* ignore */ }
          }
        })
      );

      // Redirect for VNPay
      if (paymentMethod === 'VNPAY' && paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      navigate('/order-success', {
        state: {
          orderInfo: {
            orderId,
            paymentMethod,
            total: order.totalAmount,
            shippingAddress: order.shippingAddress,
            orderDate: new Date().toISOString(),
          }
        }
      });
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error('Order error:', err);
      toast.error(err.message || 'Đặt hàng thất bại. Vui lòng thử lại!');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // ── Price calculations ────────────────────────────────────────────────
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const subtotal = displayItems.reduce((sum: number, item: any) => {
    const sku = item.skuResponse || item.sku || {};
    const product = item.productResponse || sku.productResponse || item.product || {};
    const price = sku.price || item.price || item.unitPrice || product.minPrice || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  // ── Guard ─────────────────────────────────────────────────────────────
  if (displayItems.length === 0) {
    navigate('/');
    return null;
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#AF140B] via-[#D91810] to-[#AF140B] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full mb-4 backdrop-blur-sm">
            <CreditCard className="size-6" />
            <span className="font-bold text-lg">THANH TOÁN</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Hoàn Tất Đơn Hàng</h1>
          <p className="text-xl text-white/90">{displayItems.length} sản phẩm trong đơn hàng</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Left Column ─────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#AF140B] rounded-xl">
                      <Truck className="size-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Địa Chỉ Giao Hàng</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {loadingAddresses && <Loader2 className="animate-spin text-[#AF140B]" />}
                    <button
                      type="button"
                      onClick={() => {
                        setAddressForm({ ...emptyAddressForm });
                        setEditingAddressId(null);
                        setShowAddressForm(v => !v);
                      }}
                      className="flex items-center gap-1 text-sm text-[#AF140B] hover:underline font-semibold"
                    >
                      <Plus className="size-4" />
                      Thêm địa chỉ
                    </button>
                  </div>
                </div>

                {/* Add Address Form */}
                {showAddressForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-[#AF140B]/30 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                      </h3>
                      <button type="button" onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddressId(null);
                        setAddressForm({ ...emptyAddressForm });
                      }}>
                        <X className="size-4 text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Số nhà / Đường *</label>
                        <input
                          type="text"
                          value={addressForm.street}
                          onChange={e => setAddressForm(f => ({ ...f, street: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#AF140B] focus:border-[#AF140B]"
                          placeholder="VD: 123 Nguyễn Huệ"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Tỉnh / Thành phố *</label>
                        <input
                          type="text"
                          value={addressForm.provinceName}
                          onChange={e => setAddressForm(f => ({ ...f, provinceName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#AF140B]"
                          placeholder="VD: Hà Nội"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Quận / Huyện *</label>
                        <input
                          type="text"
                          value={addressForm.districtName}
                          onChange={e => setAddressForm(f => ({ ...f, districtName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#AF140B]"
                          placeholder="VD: Hoàn Kiếm"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Phường / Xã *</label>
                        <input
                          type="text"
                          value={addressForm.wardName}
                          onChange={e => setAddressForm(f => ({ ...f, wardName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#AF140B]"
                          placeholder="VD: Phường Tràng Tiền"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSaveAddress}
                        disabled={savingAddress}
                        className="flex-1 bg-[#AF140B] text-white py-2 rounded-lg text-sm font-bold hover:bg-[#8D0F08] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {savingAddress && <Loader2 className="animate-spin size-4" />}
                        {editingAddressId ? 'Cập nhật' : 'Lưu địa chỉ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                          setAddressForm({ ...emptyAddressForm });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Address List */}
                {addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.addressId;
                      return (
                        <div
                          key={addr.addressId}
                          onClick={() => setSelectedAddressId(addr.addressId)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected
                            ? 'border-[#AF140B] bg-[#FFE5E3]'
                            : 'border-gray-200 hover:border-[#AF140B]/40'}`}
                        >
                          <div className="flex items-start gap-3">
                            <MapPin className={`size-5 mt-0.5 shrink-0 ${isSelected ? 'text-[#AF140B]' : 'text-gray-400'}`} />
                            <div className="flex-1">
                              <p className="font-bold text-gray-800 text-sm">{addr.street}</p>
                              <p className="text-sm text-gray-500">
                                {addr.wardName}, {addr.districtName}, {addr.provinceName}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {isSelected && (
                                <span className="text-[10px] bg-[#AF140B] text-white px-2 py-0.5 rounded-full font-bold uppercase">
                                  Đã chọn
                                </span>
                              )}
                              <div className="flex items-center gap-2 mt-1" onClick={e => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleEditAddress(addr)}
                                  className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                  title="Sửa địa chỉ"
                                >
                                  <Edit className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAddress(addr.addressId)}
                                  disabled={deletingAddressId === addr.addressId}
                                  className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                                  title="Xóa địa chỉ"
                                >
                                  {deletingAddressId === addr.addressId ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : !loadingAddresses ? (
                  <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl text-orange-700 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="size-5 shrink-0" />
                    Bạn chưa có địa chỉ giao hàng. Nhấn &quot;Thêm địa chỉ&quot; để tạo mới.
                  </div>
                ) : null}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#AF140B] rounded-xl">
                    <CreditCard className="size-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Phương Thức Thanh Toán</h2>
                </div>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map(m => (
                    <label
                      key={m.value}
                      className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all has-[:checked]:border-[#AF140B] has-[:checked]:bg-[#FFE5E3]"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.value}
                        checked={paymentMethod === m.value}
                        onChange={() => setPaymentMethod(m.value)}
                        className="size-5 text-[#AF140B]"
                      />
                      <div>
                        <p className="font-bold text-gray-800">{m.label}</p>
                        <p className="text-sm text-gray-500">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right Column — Order Summary ──────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📦 Đơn Hàng</h2>

                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {displayItems.map((item: any, index: number) => {
                    const sku = item.skuResponse || item.sku || {};
                    const product = item.productResponse || sku.productResponse || item.product || {};
                    const name = product.name || item.productName || item.name || 'Sản phẩm';
                    const imageUrl = product.imageUrl || item.imageUrl || 'https://placehold.co/100x100?text=No+Image';
                    const price = sku.price || item.price || item.unitPrice || product.minPrice || 0;
                    const key = item.id || item.cartItemId || item.idCart || `item-${index}`;
                    return (
                      <div key={key} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg">
                        <img src={imageUrl} alt={name} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 line-clamp-2">{name}</p>
                          <p className="text-xs text-gray-500">x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-[#AF140B] shrink-0">{formatPrice(price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t-2 border-dashed border-gray-300 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Tạm tính:</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Phí vận chuyển:</span>
                    <span className={shippingFee === 0 ? 'text-green-600 font-bold' : 'font-semibold'}>
                      {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                    </span>
                  </div>
                  <div className="border-t-2 border-dashed border-gray-300 pt-3 flex justify-between font-bold text-xl">
                    <span className="text-gray-800">Tổng cộng:</span>
                    <span className="text-[#AF140B] text-2xl">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPlacingOrder || loadingAddresses || !selectedAddressId}
                  className="w-full mt-6 bg-[#AF140B] text-white py-4 rounded-xl hover:bg-[#8D0F08] transition-all shadow-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="animate-spin size-5" />
                      Đang xử lý...
                    </>
                  ) : 'Đặt Hàng'}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}