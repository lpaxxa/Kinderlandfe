import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  Warehouse, DollarSign, BarChart3,
  AlertTriangle, Star, ChevronRight
} from 'lucide-react';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { adminUser } = useAdmin();

  // Statistics data
  const stats = [
    { label: 'Đơn hàng hôm nay', value: '48', change: '+12%', icon: ShoppingCart, bg: 'bg-[#AF140B]' },
    { label: 'Doanh thu hôm nay', value: '₫42.5M', change: '+8%', icon: DollarSign, bg: 'bg-[#D4AF37]' },
    { label: 'Sản phẩm sắp hết', value: '12', change: '-3 hôm nay', icon: AlertTriangle, bg: 'bg-orange-500' },
    { label: 'Đánh giá mới', value: '23', change: '+5 hôm nay', icon: Star, bg: 'bg-[#AF140B]' },
  ];

  return (
    <div className="p-6 bg-white min-h-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#AF140B] to-[#D91810] rounded-xl p-5 mb-6 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">
              Xin chào, {adminUser?.name || 'Manager'}! 👋
            </h2>
            <p className="text-white/85 text-sm">
              Chào mừng bạn trở lại. Quản lý chi nhánh hiệu quả hơn mỗi ngày.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</p>
                    <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                  </div>
                  <div className={`${stat.bg} p-2.5 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Thao tác nhanh</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => navigate('/manager/create-order')}
          className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#AF140B] hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-[#AF140B] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-[#AF140B]">Tạo đơn hàng</span>
        </button>
        <button
          onClick={() => navigate('/manager/products')}
          className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#D4AF37] hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-[#D4AF37]">Thêm sản phẩm</span>
        </button>
        <button
          onClick={() => navigate('/manager/inventory')}
          className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Warehouse className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Kiểm kho</span>
        </button>
        <button
          onClick={() => navigate('/manager/reports')}
          className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">Xem báo cáo</span>
        </button>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <Package className="w-4 h-4 text-[#AF140B]" />
              Quản lý sản phẩm
            </CardTitle>
            <CardDescription className="text-xs">Quản lý danh mục sản phẩm và tồn kho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Quản lý sản phẩm', desc: 'Thêm, sửa, xóa sản phẩm', path: '/manager/products' },
              { label: 'Quản lý danh mục', desc: 'Quản lý danh mục và phân loại', path: '/manager/categories' },
              { label: 'Kiểm tra tồn kho', desc: 'Xem tình trạng tồn kho', path: '/manager/inventory' },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-[#AF140B]/5 hover:shadow-sm transition-all group"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-[#AF140B]">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#AF140B]" />
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <ShoppingCart className="w-4 h-4 text-[#D4AF37]" />
              Đơn hàng & Bán hàng
            </CardTitle>
            <CardDescription className="text-xs">Xử lý đơn hàng và hoàn trả</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Quản lý đơn hàng', desc: 'Xem và xử lý đơn hàng', path: '/manager/orders' },
              { label: 'Tạo đơn hàng', desc: 'Tạo đơn hàng mới cho khách', path: '/manager/create-order' },
              { label: 'Xử lý hoàn trả', desc: 'Xử lý yêu cầu trả hàng', path: '/manager/returns' },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-[#D4AF37]/5 hover:shadow-sm transition-all group"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-[#D4AF37]">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#D4AF37]" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}