import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';

import { Loader2, Package, Truck, CheckCircle, XCircle, Clock, AlertCircle, RotateCcw, Building2 } from 'lucide-react';
import { api } from '../../services/api';

interface OrderItem {
  id: number;
  productName: string;
  thumbnail: string;
  quantity: number;
  price: number;
  skuCode?: string;
}

interface OrderDetail {
  id: number;
  orderCode: string;
  createdAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'DELIVERY_FAILED';
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveredAt?: string;
  note?: string;
  pickupStore?: {
    id: number;
    name: string;
    address: string;
  };
}

interface OrderDetailModalProps {
  orderId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderCancelled?: () => void;
}

export default function OrderDetailModal({ orderId, isOpen, onClose }: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    } else {
      setOrder(null);
      setError(null);
    }
  }, [isOpen, orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getOrderById(orderId!);
      if (response && response.data) {
        setOrder(response.data);
      } else {
        setOrder(response); // fallback if it's already the object
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const statusMap = {
    PENDING: { label: 'Đang xác nhận', icon: Clock, color: 'bg-amber-100 text-amber-800' },
    CONFIRMED: { label: 'Chờ lấy hàng', icon: Package, color: 'bg-blue-100 text-blue-800' },
    SHIPPING: { label: 'Chờ giao hàng', icon: Truck, color: 'bg-indigo-100 text-indigo-800' },
    DELIVERED: { label: 'Đã giao', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800' },
    CANCELLED: { label: 'Đã hủy', icon: XCircle, color: 'bg-rose-100 text-rose-800' },
    RETURNED: { label: 'Trả hàng', icon: RotateCcw, color: 'bg-slate-100 text-slate-800' },
    DELIVERY_FAILED: { label: 'Giao thất bại', icon: AlertCircle, color: 'bg-orange-100 text-orange-800' },
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] rounded-2xl p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <DialogTitle className="text-xl font-extrabold flex items-center justify-between mt-2">
            <span>Chi tiết đơn hàng {order?.orderCode ? `#${order.orderCode}` : ''}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#AF140B] animate-spin mb-4" />
              <p className="text-sm text-gray-500 font-medium">Đang tải thông tin...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3 opacity-50" />
              <p className="text-rose-600 font-medium">{error}</p>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Status & Info */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-gray-500 font-medium">Trạng thái:</span>
                      {(() => {
                        const statusInfo = statusMap[order.status] || { label: order.status, icon: Package, color: 'bg-gray-100 text-gray-800' };
                        const StatusIcon = statusInfo.icon;
                        return (
                          <Badge variant="outline" className={`${statusInfo.color} font-bold px-2.5 py-0.5 rounded-full border-none`}>
                            <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                            {statusInfo.label}
                          </Badge>
                        );
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="text-gray-500 font-medium">Ngày đặt: </span>
                      <span className="font-semibold text-gray-900">
                        {new Date(order.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                     <div className="text-sm">
                        <span className="text-gray-500 font-medium">Thanh toán: </span>
                        <span className="font-semibold text-gray-900">
                          {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}
                        </span>
                     </div>
                     <div className="text-sm">
                        <span className="text-gray-500 font-medium">Tình trạng: </span>
                        <Badge variant="secondary" className={`font-bold border-none px-2 py-0 ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                           {order.paymentStatus === 'PAID' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                        </Badge>
                     </div>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                  {order.pickupStore ? <Building2 className="w-4 h-4 text-gray-400" /> : <Truck className="w-4 h-4 text-gray-400" />}
                  Thông tin nhận hàng
                </h3>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-sm text-gray-700 leading-relaxed">
                  {order.pickupStore ? (
                    <div>
                      <p className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                        Nhận tại cửa hàng: {order.pickupStore.name}
                      </p>
                      <p className="text-gray-600 italic">{order.pickupStore.address}</p>
                    </div>
                  ) : (
                    <p className="italic">{order.shippingAddress || 'Chưa cung cấp địa chỉ'}</p>
                  )}
                  
                  {order.note && (
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <span className="font-medium text-gray-500">Ghi chú: </span>
                      <span className="text-gray-900 truncate">{order.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  Sản phẩm ({order.items?.length || 0})
                </h3>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                  {order.items?.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 flex gap-4">
                      <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center">
                        <img 
                          src={item.thumbnail || '/placeholder-product.jpg'} 
                          alt={item.productName} 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                             (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="font-bold text-gray-900 text-sm line-clamp-2">{item.productName}</p>
                        {item.skuCode && <p className="text-xs text-gray-400 mt-0.5">SKU: {item.skuCode}</p>}
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm font-semibold text-gray-600">x{item.quantity}</p>
                          <p className="font-bold text-[#AF140B] whitespace-nowrap">
                            {(item.price || 0).toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-rose-50/50 rounded-xl p-5 border border-rose-100 flex flex-col items-end">
                <p className="text-sm text-gray-500 font-medium mb-1">Tổng tiền thanh toán</p>
                <p className="text-2xl font-black text-[#AF140B]">
                  {(order.totalAmount || 0).toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
