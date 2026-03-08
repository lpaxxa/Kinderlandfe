import { useState, useEffect } from 'react';
import { Link } from 'react-router';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RotateCcw,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface OrderItem {
  id: number;
  productName: string;
  thumbnail: string;
  quantity: number;
  price: number;
  skuCode?: string;
}

interface Order {
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
}

export default function OrderHistory() {

  const [selectedTab, setSelectedTab] = useState('ALL');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getMyOrders();
      // Handle the case where the API response is an object with a data property
      if (response && response.data && Array.isArray(response.data)) {
        setOrders(response.data);
      } else if (Array.isArray(response)) {
        setOrders(response);
      } else {
        setOrders([]);
        console.warn('Unexpected API response structure:', response);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusInfo = (status: Order['status']) => {
    const statusMap = {
      PENDING: {
        label: 'Đang xác nhận',
        icon: Clock,
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        iconColor: 'text-amber-600',
      },
      CONFIRMED: {
        label: 'Chờ lấy hàng',
        icon: Package,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        iconColor: 'text-blue-600',
      },
      SHIPPING: {
        label: 'Chờ giao hàng',
        icon: Truck,
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        iconColor: 'text-indigo-600',
      },
      DELIVERED: {
        label: 'Đã giao',
        icon: CheckCircle,
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        iconColor: 'text-emerald-600',
      },
      CANCELLED: {
        label: 'Đã hủy',
        icon: XCircle,
        color: 'bg-rose-100 text-rose-800 border-rose-200',
        iconColor: 'text-rose-600',
      },
      RETURNED: {
        label: 'Trả hàng',
        icon: RotateCcw,
        color: 'bg-slate-100 text-slate-800 border-slate-200',
        iconColor: 'text-slate-600',
      },
      DELIVERY_FAILED: {
        label: 'Giao thất bại',
        icon: AlertCircle,
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        iconColor: 'text-orange-600',
      },
    };
    return statusMap[status] || {
      label: status,
      icon: Package,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      iconColor: 'text-gray-600',
    };
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;

    try {
      await api.updateOrderStatus(orderId, 'CANCELLED');
      toast.success('Hủy đơn hàng thành công');
      fetchOrders();
    } catch (err: any) {
      toast.error('Không thể hủy đơn hàng: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  const handleReturnOrder = async (orderId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn yêu cầu trả hàng cho đơn hàng này không?')) return;

    try {
      await api.updateOrderStatus(orderId, 'RETURNED');
      toast.success('Gửi yêu cầu trả hàng thành công');
      fetchOrders();
    } catch (err: any) {
      toast.error('Không thể yêu cầu trả hàng: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  const isReturnable = (deliveredAt?: string) => {
    if (!deliveredAt) return false;
    const deliveryDate = new Date(deliveredAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - deliveryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const filterOrders = (status: string) => {
    if (!Array.isArray(orders)) return [];
    if (status === 'ALL') return orders;
    return orders.filter((order) => order.status === status);
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;

    return (
      <Card className="mb-5 overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className={`h-1.5 w-full ${statusInfo.color.split(' ')[0]}`} />
        <CardHeader className="pb-4 bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-[#AF140B] transition-colors">
                  Đơn hàng #{order.orderCode}
                </CardTitle>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Đặt ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <Badge variant="outline" className={`${statusInfo.color || ''} border font-bold px-3 py-1 rounded-full shadow-sm`}>
              {StatusIcon && <StatusIcon className={`w-3.5 h-3.5 mr-1.5 ${statusInfo.iconColor || ''}`} />}
              {statusInfo.label || order.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 bg-white">
          <div className="divide-y divide-gray-50">
            {order.items && Array.isArray(order.items) && order.items.map((item, idx) => (
              <div key={item.id || `item-${order.id}-${idx}`} className="py-4 flex items-center gap-5">
                <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-inner">
                  <img
                    src={item.thumbnail}
                    alt={item.productName}
                    className="w-20 h-20 object-cover transform transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-0 right-0 bg-gray-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                    x{item.quantity}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 line-clamp-1">{item.productName}</p>
                  {item.skuCode && (
                    <p className="text-xs text-gray-400 mt-0.5">SKU: {item.skuCode}</p>
                  )}
                  <p className="text-[#AF140B] font-bold mt-1">
                    {(item.price || 0).toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="shrink-0">Thanh toán:</span>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-medium border-none px-2 py-0">
                    {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán trực tuyến'}
                  </Badge>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                    order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {order.paymentStatus === 'PAID' ? 'Đã trả' : 'Chưa trả'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="shrink-0">Địa chỉ:</span>
                  <span className="truncate max-w-[250px] italic">{order.shippingAddress}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Thành tiền</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight">
                  {(order.totalAmount || 0).toLocaleString('vi-VN')}<span className="text-sm font-bold ml-1">₫</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none border-gray-200 hover:bg-[#AF140B] hover:text-white hover:border-[#AF140B] transition-all rounded-xl font-bold h-11" 
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Chi tiết
            </Button>
            
            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <Button 
                variant="destructive" 
                className="flex-1 sm:flex-none bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all rounded-xl font-bold h-11 shadow-none" 
                size="sm"
                onClick={() => handleCancelOrder(order.id)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Hủy đơn
              </Button>
            )}

            {order.status === 'DELIVERED' && isReturnable(order.createdAt) && (
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none border-slate-200 text-slate-700 hover:bg-slate-50 transition-all rounded-xl font-bold h-11" 
                size="sm"
                onClick={() => handleReturnOrder(order.id)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Trả hàng
              </Button>
            )}
            
            {order.status === 'DELIVERED' && (
              <Button 
                variant="default" 
                className="flex-1 sm:flex-none bg-[#AF140B] hover:bg-[#8D0F08] transition-all rounded-xl font-bold h-11 group/btn" 
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2 group-hover/btn:rotate-[-45deg] transition-transform" />
                Mua lại
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-16 text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-[#AF140B]/10 blur-2xl rounded-full scale-150" />
          <Package className="w-20 h-20 text-gray-300 mx-auto relative z-10 animate-bounce transition-all duration-1000" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{message}</h3>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">Có vẻ như bạn chưa có đơn hàng nào trong trạng thái này.</p>
        <Link to="/products">
          <Button className="bg-[#AF140B] hover:bg-[#8D0F08] px-8 rounded-full font-bold shadow-lg shadow-[#AF140B]/20 h-12">
            Mua sắm ngay
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <Link to="/account" className="inline-block group mb-6">
            <Button variant="ghost" className="pl-0 text-gray-500 group-hover:text-[#AF140B] transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Quay lại tài khoản
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Đơn hàng của tôi</h1>
              <p className="text-gray-500 font-medium text-lg">Quản lý và theo dõi hành trình niềm vui của bé</p>
            </div>
            {orders.length > 0 && (
              <Badge className="bg-[#AF140B]/10 text-[#AF140B] border-none px-4 py-1.5 text-sm font-bold rounded-full">
                Tổng cộng {orders.length} đơn hàng
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs for filtering orders */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-10">
          <div className="overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="flex w-max sm:w-full bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
              {[
                { value: 'ALL', label: 'Tất cả' },
                { value: 'PENDING', label: 'Đang xác nhận' },
                { value: 'CONFIRMED', label: 'Chờ lấy hàng' },
                { value: 'SHIPPING', label: 'Chờ giao hàng' },
                { value: 'DELIVERED', label: 'Đã giao' },
                { value: 'RETURNED', label: 'Trả hàng' },
                { value: 'CANCELLED', label: 'Đã hủy' },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all data-[state=active]:bg-[#AF140B] data-[state=active]:text-white data-[state=active]:shadow-md flex-1 min-w-[120px]"
                >
                  {tab.label}
                  {filterOrders(tab.value).length > 0 && (
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                      selectedTab === tab.value ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {filterOrders(tab.value).length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-gray-50">
                <Loader2 className="w-12 h-12 text-[#AF140B] animate-spin mb-4" />
                <p className="text-gray-500 font-bold animate-pulse">Đang tải hành trình đơn hàng...</p>
              </div>
            ) : error ? (
              <Card className="border-rose-100 bg-rose-50 p-8 rounded-3xl">
                <div className="flex flex-col items-center text-center">
                  <XCircle className="w-16 h-16 text-rose-500 mb-4" />
                  <p className="text-rose-800 font-bold mb-4">{error}</p>
                  <Button onClick={fetchOrders} className="bg-rose-600 hover:bg-rose-700 rounded-xl font-bold">
                    Thử lại
                  </Button>
                </div>
              </Card>
            ) : filterOrders(selectedTab).length === 0 ? (
              <EmptyState message={selectedTab === 'ALL' ? 'Bạn chưa có đơn hàng nào' : 'Không tìm thấy đơn hàng'} />
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filterOrders(selectedTab).map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}