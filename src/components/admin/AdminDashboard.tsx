<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> 5760d309298dc1d2e8cb142e354f345a7dbcff28
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import {
  BarChart3, Package, ShoppingCart, Users,
  DollarSign, ArrowDownRight,
  Store, FileText, Star, Gift, Archive,
  TrendingUp, AlertCircle, RefreshCw,
} from 'lucide-react';
<<<<<<< HEAD
=======
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
>>>>>>> 5760d309298dc1d2e8cb142e354f345a7dbcff28

import { financialApi } from '../../services/financialApi';
import { productApi } from '../../services/productApi';
import { storeApi } from '../../services/storeApi';
import { adminAccountApi } from '../../services/adminAccountApi';
import { inventoryApi } from '../../services/inventoryApi';

// ----------------------------------------------------------------
// Mini SVG Pie Chart
// ----------------------------------------------------------------
interface PieSlice {
  value: number;
  color: string;
  label: string;
}

function PieChart({ slices, size = 140 }: { slices: PieSlice[]; size?: number }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return (
    <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-400">Không có dữ liệu</span>
      </div>
    </div>
  );

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  let cumulative = 0;
  const paths = slices.map((sl, i) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += sl.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sl.value / total > 0.5 ? 1 : 0;

    // Don't draw if 100%
    if (slices.length === 1) {
      return <circle key={i} cx={cx} cy={cy} r={r} fill={sl.color} />;
    }

    return (
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={sl.color}
        stroke="white"
        strokeWidth={2}
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
      {/* Donut hole */}
      <circle cx={cx} cy={cy} r={r * 0.5} fill="white" />
    </svg>
  );
}

// ----------------------------------------------------------------
// Format helpers
// ----------------------------------------------------------------
const formatVND = (amount: number): string => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)} triệu`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString('vi-VN');
};

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
interface DashboardData {
  totalRevenue: number;
  todayRevenue: number;
  thisMonthRevenue: number;
  totalProducts: number;
  activeProducts: number;
  totalStores: number;
  activeStores: number;
  totalAccounts: number;
  lowStockItems: { productName: string; storeName: string; quantity: number; skuCode: string }[];
}

// ----------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------
export default function AdminDashboard() {
  const { adminUser } = useAdmin();
  const navigate = useNavigate();

<<<<<<< HEAD
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [financial, products, stores, accounts, inventory] = await Promise.allSettled([
        financialApi.getFinancialOverview(),
        productApi.getAll(),
        storeApi.getStores(),
        adminAccountApi.getAccounts(),
        inventoryApi.getAllInventory(),
      ]);

      const fin = financial.status === 'fulfilled' ? financial.value : null;
      const prods = products.status === 'fulfilled' ? products.value : [];
      const storeList = stores.status === 'fulfilled' ? stores.value : [];
      const accts = accounts.status === 'fulfilled' ? accounts.value : [];
      const inv = inventory.status === 'fulfilled' ? inventory.value : [];

      // Low stock: quantity <= 5
      const lowStock = inv
        .filter(item => item.quantity <= 5 && item.quantity >= 0)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 6);

      setData({
        totalRevenue: fin?.totalRevenue ?? 0,
        todayRevenue: fin?.todayRevenue ?? 0,
        thisMonthRevenue: fin?.thisMonthRevenue ?? 0,
        totalProducts: prods.length,
        activeProducts: prods.filter(p => p.active !== false).length,
        totalStores: storeList.length,
        activeStores: storeList.filter(s => s.active).length,
        totalAccounts: accts.length,
        lowStockItems: lowStock.map(item => ({
          productName: item.productName,
          storeName: item.storeName,
          quantity: item.quantity,
          skuCode: item.skuCode,
        })),
      });
      setLastUpdated(new Date());
    } catch {
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setLoading(false);
=======
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
>>>>>>> 5760d309298dc1d2e8cb142e354f345a7dbcff28
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ----------------------------------------------------------------
  // Stat cards config
  // ----------------------------------------------------------------
  const statCards = data ? [
    {
      key: 'revenue',
      label: 'Doanh thu tháng này',
      value: formatVND(data.thisMonthRevenue),
      sub: `Hôm nay: ${formatVND(data.todayRevenue)}`,
      trend: data.thisMonthRevenue > 0 ? 'up' : 'neutral',
      icon: <DollarSign className="w-5 h-5 text-white" />,
      bg: 'bg-gradient-to-br from-[#AF140B] to-[#d4190e]',
      ringColor: 'ring-red-200',
    },
    {
      key: 'products',
      label: 'Sản phẩm',
      value: data.totalProducts.toLocaleString(),
      sub: `${data.activeProducts} đang hoạt động`,
      trend: 'up',
      icon: <Package className="w-5 h-5 text-white" />,
      bg: 'bg-gradient-to-br from-green-500 to-green-600',
      ringColor: 'ring-green-200',
    },
    {
      key: 'stores',
      label: 'Cửa hàng',
      value: data.totalStores.toLocaleString(),
      sub: `${data.activeStores} đang mở cửa`,
      trend: 'up',
      icon: <Store className="w-5 h-5 text-white" />,
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      ringColor: 'ring-blue-200',
    },
    {
      key: 'accounts',
      label: 'Tài khoản hệ thống',
      value: data.totalAccounts.toLocaleString(),
      sub: 'Admin / Manager / Staff',
      trend: 'neutral',
      icon: <Users className="w-5 h-5 text-white" />,
      bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      ringColor: 'ring-purple-200',
    },
  ] : [];

  // ------------------------------------------------
  // Pie chart data
  // ------------------------------------------------
  const productPieSlices: PieSlice[] = data ? [
    { value: data.activeProducts, color: '#22c55e', label: 'Đang bán' },
    { value: data.totalProducts - data.activeProducts, color: '#e5e7eb', label: 'Tạm ngưng' },
  ] : [];

  const storePieSlices: PieSlice[] = data ? [
    { value: data.activeStores, color: '#3b82f6', label: 'Mở cửa' },
    { value: data.totalStores - data.activeStores, color: '#e5e7eb', label: 'Tạm ngưng' },
  ] : [];

  const revenuePieSlices: PieSlice[] = data ? [
    { value: data.thisMonthRevenue, color: '#AF140B', label: 'Tháng này' },
    { value: Math.max(data.totalRevenue - data.thisMonthRevenue, 0), color: '#fca5a5', label: 'Các tháng trước' },
  ] : [];

  // ----------------------------------------------------------------
  // Quick actions
  // ----------------------------------------------------------------
  const quickActions = [
    { label: 'Sản phẩm', icon: Package, path: '/admin/products', color: 'bg-[#AF140B]', hover: 'hover:border-[#AF140B]', textHover: 'group-hover:text-[#AF140B]' },
    { label: 'Đơn hàng', icon: ShoppingCart, path: '/admin/orders', color: 'bg-amber-500', hover: 'hover:border-amber-500', textHover: 'group-hover:text-amber-600' },
    { label: 'Cửa hàng', icon: Store, path: '/admin/stores', color: 'bg-blue-600', hover: 'hover:border-blue-500', textHover: 'group-hover:text-blue-600' },
    { label: 'Tài khoản', icon: Users, path: '/admin/users', color: 'bg-purple-600', hover: 'hover:border-purple-500', textHover: 'group-hover:text-purple-600' },
    { label: 'Khuyến mãi', icon: Gift, path: '/admin/promotions', color: 'bg-rose-500', hover: 'hover:border-rose-500', textHover: 'group-hover:text-rose-600' },
    { label: 'Bài viết', icon: FileText, path: '/admin/blog', color: 'bg-teal-600', hover: 'hover:border-teal-500', textHover: 'group-hover:text-teal-600' },
    { label: 'Đánh giá', icon: Star, path: '/admin/reviews', color: 'bg-amber-400', hover: 'hover:border-amber-400', textHover: 'group-hover:text-amber-500' },
    { label: 'Hoàn trả', icon: Archive, path: '/admin/returns', color: 'bg-gray-600', hover: 'hover:border-gray-500', textHover: 'group-hover:text-gray-600' },
    { label: 'Báo cáo', icon: BarChart3, path: '/admin/reports', color: 'bg-green-600', hover: 'hover:border-green-500', textHover: 'group-hover:text-green-600' },
  ];

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  return (
    <div className="p-6 bg-gray-50 min-h-full">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Xin chào, {adminUser?.name || 'Admin'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lastUpdated
              ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString('vi-VN')}`
              : 'Đang tải dữ liệu thực tế...'}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={fetchAll} className="ml-auto px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700">Thử lại</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-2.5 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Stat Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map(card => (
            <div
              key={card.key}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 relative overflow-hidden group"
            >
              {/* Decorative blob */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-5 bg-current" />

              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shadow-md ring-4 ${card.ringColor}`}>
                  {card.icon}
                </div>
                {card.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 mt-1" />}
                {card.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500 mt-1" />}
              </div>

              <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">{card.label}</p>
              <p className="text-xs text-gray-400">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pie Charts row */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Revenue Pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-[#AF140B]" />
              <h3 className="text-sm font-bold text-gray-800">Phân bổ Doanh thu</h3>
            </div>
            <div className="flex items-center gap-4">
              <PieChart slices={revenuePieSlices} size={120} />
              <div className="flex flex-col gap-2">
                {revenuePieSlices.map((sl, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sl.color }} />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{sl.label}</p>
                      <p className="text-xs text-gray-400">{formatVND(sl.value)}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-1 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Tổng: <span className="font-bold text-gray-900">{formatVND(data.totalRevenue)}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-bold text-gray-800">Trạng thái Sản phẩm</h3>
            </div>
            <div className="flex items-center gap-4">
              <PieChart slices={productPieSlices} size={120} />
              <div className="flex flex-col gap-2">
                {productPieSlices.map((sl, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sl.color }} />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{sl.label}</p>
                      <p className="text-xs text-gray-400">{i === 0 ? data.activeProducts : data.totalProducts - data.activeProducts} SP</p>
                    </div>
                  </div>
                ))}
                <div className="mt-1 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Tổng: <span className="font-bold text-gray-900">{data.totalProducts} SP</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Stores Pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-gray-800">Trạng thái Cửa hàng</h3>
            </div>
            <div className="flex items-center gap-4">
              <PieChart slices={storePieSlices} size={120} />
              <div className="flex flex-col gap-2">
                {storePieSlices.map((sl, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sl.color }} />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{sl.label}</p>
                      <p className="text-xs text-gray-400">{i === 0 ? data.activeStores : data.totalStores - data.activeStores} CH</p>
                    </div>
                  </div>
                ))}
                <div className="mt-1 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Tổng: <span className="font-bold text-gray-900">{data.totalStores} CH</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {data && data.lowStockItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 bg-[#AF140B] rounded-full" />
              <h3 className="text-sm font-bold text-gray-800">⚠️ Cảnh báo tồn kho thấp</h3>
              <span className="px-2 py-0.5 bg-red-100 text-[#AF140B] text-xs font-bold rounded-full">{data.lowStockItems.length}</span>
            </div>
            <button
              onClick={() => navigate('/admin/inventory')}
              className="text-xs text-[#AF140B] font-semibold hover:underline"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {data.lowStockItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.productName}</p>
                  <p className="text-xs text-gray-500">{item.storeName} · <span className="font-mono text-gray-400">{item.skuCode}</span></p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.quantity === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.quantity === 0 ? 'Hết hàng' : `Còn ${item.quantity}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          Truy cập nhanh
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {quickActions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl ${item.hover} hover:shadow-sm transition-all group`}
              >
                <div className={`w-9 h-9 ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className={`text-xs font-semibold text-gray-600 ${item.textHover} text-center leading-tight`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}