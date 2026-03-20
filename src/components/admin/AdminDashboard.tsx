import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  BarChart3, Package, ShoppingCart, Users,
  AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight,
  Store, FileText, Star, Gift, MessageSquare, Archive,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { stores } from '../../data/stores';
import { products } from '../../data/products';
import { financialApi } from '../../services/financialApi';

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminDashboard() {
  const { adminUser } = useAdmin();
  const navigate = useNavigate();

  const [realRevenue, setRealRevenue] = useState<number | null>(null);

  useEffect(() => {
    const fetchFinancial = async () => {
      try {
        const data = await financialApi.getFinancialOverview();
        setRealRevenue(data.thisMonthRevenue);
      } catch (err) {
        console.error("Failed to load financial overview:", err);
      }
    };
    fetchFinancial();
  }, []);

  // Calculate inventory alerts
  const getInventoryAlerts = () => {
    const alerts: Array<{ type: 'low' | 'excess'; store: string; product: string; qty: number; storeId: string }> = [];
    
    stores.forEach((store) => {
      Object.entries(store.inventory).forEach(([productId, qty]) => {
        if (qty <= 5 && qty > 0) {
          const product = products.find((p) => p.id === productId);
          alerts.push({
            type: 'low',
            store: store.name,
            product: product?.name || 'Unknown',
            qty,
            storeId: store.id,
          });
        } else if (qty >= 25) {
          const product = products.find((p) => p.id === productId);
          alerts.push({
            type: 'excess',
            store: store.name,
            product: product?.name || 'Unknown',
            qty,
            storeId: store.id,
          });
        }
      });
    });
    
    return alerts;
  };

  const inventoryAlerts = getInventoryAlerts();
  const lowStockAlerts = inventoryAlerts.filter((a) => a.type === 'low');

  // Mock statistics
  const stats = {
    revenue: {
      value: realRevenue !== null ? formatCurrency(realRevenue) : 'Đang tải...',
      change: 12.5,
      trend: 'up' as const,
      label: 'Doanh thu tháng này',
    },
    orders: {
      value: '1,234',
      change: 8.2,
      trend: 'up' as const,
      label: 'Đơn hàng',
    },
    customers: {
      value: '5,678',
      change: 15.3,
      trend: 'up' as const,
      label: 'Khách hàng',
    },
    products: {
      value: products.length.toString(),
      change: -2.1,
      trend: 'down' as const,
      label: 'Sản phẩm',
    },
  };

  const recentOrders = [
    { id: 'ORD-1234', customer: 'Nguyễn Văn A', total: '1.250.000đ', status: 'Đang giao', time: '10 phút trước' },
    { id: 'ORD-1233', customer: 'Trần Thị B', total: '890.000đ', status: 'Đã xác nhận', time: '25 phút trước' },
    { id: 'ORD-1232', customer: 'Lê Văn C', total: '2.100.000đ', status: 'Đang xử lý', time: '1 giờ trước' },
    { id: 'ORD-1231', customer: 'Phạm Thị D', total: '450.000đ', status: 'Hoàn thành', time: '2 giờ trước' },
  ];

  const pendingReturns = [
    { id: 'RET-101', order: 'ORD-1220', customer: 'Hoàng Văn E', reason: 'Sản phẩm lỗi', time: '1 giờ trước' },
    { id: 'RET-102', order: 'ORD-1215', customer: 'Vũ Thị F', reason: 'Giao sai hàng', time: '3 giờ trước' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đang giao':
        return 'bg-blue-100 text-blue-700';
      case 'Đã xác nhận':
        return 'bg-green-100 text-green-700';
      case 'Đang xử lý':
        return 'bg-amber-100 text-amber-700';
      case 'Hoàn thành':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statIcons: Record<string, React.ReactNode> = {
    revenue: <DollarSign className="w-5 h-5 text-white" />,
    orders: <ShoppingCart className="w-5 h-5 text-white" />,
    customers: <Users className="w-5 h-5 text-white" />,
    products: <Package className="w-5 h-5 text-white" />,
  };

  const statBgs: Record<string, string> = {
    revenue: 'bg-[#AF140B]',
    orders: 'bg-[#D4AF37]',
    customers: 'bg-blue-600',
    products: 'bg-green-600',
  };

  return (
    <div className="p-6 bg-white min-h-full">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(stats).map(([key, stat]) => (
          <Card key={key} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="text-xs text-gray-400">vs tháng trước</span>
                  </div>
                </div>
                <div className={`${statBgs[key]} p-2.5 rounded-lg`}>
                  {statIcons[key]}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory Alerts */}
      {lowStockAlerts.length > 0 && (
        <Card className="mb-6 border-l-4 border-l-[#AF140B] border border-gray-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#AF140B]" />
              <CardTitle className="text-base">Cảnh báo tồn kho thấp</CardTitle>
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{lowStockAlerts.length}</Badge>
            </div>
            <CardDescription className="text-xs">
              Các sản phẩm cần được bổ sung kho ngay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockAlerts.slice(0, 5).map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{alert.product}</p>
                    <p className="text-xs text-gray-500">{alert.store}</p>
                  </div>
                  <Badge variant="outline" className="bg-white text-xs">
                    {alert.qty} sản phẩm
                  </Badge>
                </div>
              ))}
              {lowStockAlerts.length > 5 && (
                <Button
                  variant="link"
                  className="w-full text-[#AF140B] text-sm"
                  onClick={() => navigate('/admin/inventory')}
                >
                  Xem tất cả {lowStockAlerts.length} cảnh báo →
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Recent Orders */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <ShoppingCart className="w-4 h-4 text-[#D4AF37]" />
              Đơn hàng gần đây
            </CardTitle>
            <CardDescription className="text-xs">Đơn hàng mới nhất trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{order.id}</p>
                    <p className="text-xs text-gray-500">{order.customer}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-gray-800 mb-1">{order.total}</p>
                    <Badge className={getStatusColor(order.status)} variant="outline">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-3 text-sm border-gray-200 hover:border-[#AF140B] hover:text-[#AF140B]"
              onClick={() => navigate('/admin/orders')}
            >
              Xem tất cả đơn hàng →
            </Button>
          </CardContent>
        </Card>

        {/* Pending Returns */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <Archive className="w-4 h-4 text-[#AF140B]" />
              Yêu cầu trả hàng
            </CardTitle>
            <CardDescription className="text-xs">Đang chờ xử lý</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingReturns.map((ret) => (
                <div key={ret.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{ret.id}</p>
                      <p className="text-xs text-gray-500">Đơn hàng: {ret.order}</p>
                    </div>
                    <Badge variant="outline" className="bg-white text-xs">
                      Chờ duyệt
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{ret.customer}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Lý do: {ret.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">{ret.time}</p>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-3 text-sm border-gray-200 hover:border-[#AF140B] hover:text-[#AF140B]"
              onClick={() => navigate('/admin/returns')}
            >
              Xem tất cả yêu cầu →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Quản lý nhanh</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Sản phẩm', icon: Package, path: '/admin/products', color: 'bg-[#AF140B]', hover: 'hover:border-[#AF140B]', textHover: 'group-hover:text-[#AF140B]' },
          { label: 'Đơn hàng', icon: ShoppingCart, path: '/admin/orders', color: 'bg-[#D4AF37]', hover: 'hover:border-[#D4AF37]', textHover: 'group-hover:text-[#D4AF37]' },
          { label: 'Người dùng', icon: Users, path: '/admin/users', color: 'bg-indigo-600', hover: 'hover:border-indigo-500', textHover: 'group-hover:text-indigo-600' },
          { label: 'Khuyến mãi', icon: Gift, path: '/admin/promotions', color: 'bg-purple-600', hover: 'hover:border-purple-500', textHover: 'group-hover:text-purple-600' },
          { label: 'Tồn kho', icon: Store, path: '/admin/inventory', color: 'bg-blue-600', hover: 'hover:border-blue-500', textHover: 'group-hover:text-blue-600' },
          { label: 'Bài viết', icon: FileText, path: '/admin/blog', color: 'bg-teal-600', hover: 'hover:border-teal-500', textHover: 'group-hover:text-teal-600' },
          { label: 'Đánh giá', icon: Star, path: '/admin/reviews', color: 'bg-amber-500', hover: 'hover:border-amber-500', textHover: 'group-hover:text-amber-600' },
          { label: 'Báo cáo', icon: BarChart3, path: '/admin/reports', color: 'bg-green-600', hover: 'hover:border-green-500', textHover: 'group-hover:text-green-600' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl ${item.hover} hover:shadow-md transition-all group`}
            >
              <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-sm font-medium text-gray-700 ${item.textHover}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}