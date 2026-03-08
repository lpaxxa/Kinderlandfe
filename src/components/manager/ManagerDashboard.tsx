import React from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp, FileText,
  Warehouse, DollarSign, Users, BarChart3, Settings, LogOut,
  ArrowLeftRight, FileBarChart, Megaphone, Shield, UserCog,
  ClipboardList, MessageSquare, Star, MapPin, Truck, AlertTriangle, Tag
} from 'lucide-react';

import { Badge } from '../ui/badge';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { adminUser, logoutAdmin } = useAdmin();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  // Statistics data
  const stats = [
    { label: 'Đơn hàng hôm nay', value: '48', change: '+12%', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Doanh thu hôm nay', value: '₫42.5M', change: '+8%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Sản phẩm sắp hết', value: '12', change: '-3 hôm nay', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Đánh giá mới', value: '23', change: '+5 hôm nay', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  // Manager features grouped by category
  const featureGroups = [
    {
      title: 'Quản lý sản phẩm',
      description: 'Quản lý danh mục sản phẩm và tồn kho',
      features: [
        {
          title: 'Quản lý sản phẩm',
          description: 'Thêm, sửa, xóa sản phẩm (UC-18, UC-45, UC-46, UC-47)',
          icon: Package,
          path: '/manager/products',
          color: 'bg-[#AF140B]'
        },
        {
          title: 'Quản lý danh mục',
          description: 'Quản lý danh mục và phân loại (UC-19)',
          icon: LayoutDashboard,
          path: '/manager/categories',
          color: 'bg-[#AF140B]'
        },
        {
          title: 'Kiểm tra tồn kho',
          description: 'Xem tình trạng tồn kho theo chi nhánh (UC-27)',
          icon: Warehouse,
          path: '/manager/inventory',
          color: 'bg-[#AF140B]'
        },
        {
          title: 'Cập nhật kho',
          description: 'Cập nhật số lượng hàng tồn kho (UC-35)',
          icon: ClipboardList,
          path: '/manager/storage',
          color: 'bg-[#AF140B]'
        },
      ]
    },
    {
      title: 'Quản lý đơn hàng & Bán hàng',
      description: 'Xử lý đơn hàng và hoàn trả',
      features: [
        {
          title: 'Quản lý đơn hàng',
          description: 'Xem và xử lý đơn hàng (UC-20)',
          icon: ShoppingCart,
          path: '/manager/orders',
          color: 'bg-[#D4AF37]'
        },
        {
          title: 'Tạo đơn hàng',
          description: 'Tạo đơn hàng mới cho khách (UC-36, UC-37)',
          icon: FileText,
          path: '/manager/create-order',
          color: 'bg-[#D4AF37]'
        },
        {
          title: 'Xử lý hoàn trả',
          description: 'Xử lý yêu cầu trả hàng (UC-24, UC-52)',
          icon: ArrowLeftRight,
          path: '/manager/returns',
          color: 'bg-[#D4AF37]'
        },
      ]
    },
    {
      title: 'Kho hàng & Vận chuyển',
      description: 'Quản lý nhập kho và luân chuyển',
      features: [
        {
          title: 'Yêu cầu chuyển kho',
          description: 'Chuyển hàng giữa các chi nhánh (UC-49)',
          icon: Truck,
          path: '/manager/stock-transfer',
          color: 'bg-blue-600'
        },
        {
          title: 'Nhập hàng từ kho chính',
          description: 'Tạo đơn nhập hàng (UC-50)',
          icon: Package,
          path: '/manager/import-orders',
          color: 'bg-blue-600'
        },
        {
          title: 'Quản lý tồn kho',
          description: 'Xem và điều chỉnh số lượng tồn kho',
          icon: Warehouse,
          path: '/manager/inventory',
          color: 'bg-blue-600'
        },
        {
          title: 'Quản lý nhập hàng',
          description: 'Theo dõi đơn nhập hàng (UC-51)',
          icon: ClipboardList,
          path: '/manager/import-management',
          color: 'bg-blue-600'
        },
        {
          title: 'Báo cáo hàng lỗi',
          description: 'Liệt kê và thanh lý hàng lỗi (UC-33)',
          icon: AlertTriangle,
          path: '/manager/defective-report',
          color: 'bg-orange-600'
        },
        {
          title: 'Kiểm kê thực tế',
          description: 'Ghi nhận số lượng thực tế (UC-34)',
          icon: ClipboardList,
          path: '/manager/physical-count',
          color: 'bg-blue-600'
        },
      ]
    },
    {
      title: 'Marketing & Nội dung',
      description: 'Quản lý khuyến mãi và blog',
      features: [
        {
          title: 'Quản lý khuyến mãi',
          description: 'Tạo và quản lý chương trình khuyến mãi (UC-21)',
          icon: Megaphone,
          path: '/manager/promotions',
          color: 'bg-[#D4AF37]'
        },
        {
          title: 'Quản lý Blog',
          description: 'Tạo và chỉnh sửa bài viết blog (UC-25)',
          icon: FileText,
          path: '/manager/blog',
          color: 'bg-purple-600'
        },
        {
          title: 'Quản lý chính sách',
          description: 'Cập nhật chính sách cửa hàng (UC-48)',
          icon: Shield,
          path: '/manager/policies',
          color: 'bg-purple-600'
        },
        {
          title: 'Quản lý đánh giá',
          description: 'Duyệt và phản hồi đánh giá (UC-31)',
          icon: MessageSquare,
          path: '/manager/reviews',
          color: 'bg-purple-600'
        },
      ]
    },
    {
      title: 'Báo cáo & Tài chính',
      description: 'Xem báo cáo và thống kê',
      features: [
        {
          title: 'Báo cáo tổng hợp',
          description: 'Xem báo cáo doanh số và hiệu suất (UC-23)',
          icon: BarChart3,
          path: '/manager/reports',
          color: 'bg-green-600'
        },
        {
          title: 'Quản lý tài chính',
          description: 'Theo dõi doanh thu và chi phí (UC-26)',
          icon: DollarSign,
          path: '/manager/financial',
          color: 'bg-green-600'
        },
        {
          title: 'Quản lý giá SKU',
          description: 'Chỉnh sửa giá bán theo từng SKU sản phẩm',
          icon: Tag,
          path: '/manager/sku-price',
          color: 'bg-green-600'
        },
      ]
    },
    {
      title: 'Quản lý tài khoản',
      description: 'Quản lý người dùng và phân quyền',
      features: [
        {
          title: 'Quản lý người dùng',
          description: 'Quản lý tài khoản khách hàng (UC-22)',
          icon: Users,
          path: '/manager/users',
          color: 'bg-indigo-600'
        },
        {
          title: 'Đổi mật khẩu',
          description: 'Thay đổi mật khẩu cá nhân (UC-39)',
          icon: UserCog,
          path: '/manager/change-password',
          color: 'bg-gray-600'
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2C2C2C]">Manager Dashboard</h1>
                <p className="text-sm text-gray-600">
                  {adminUser?.name} - {adminUser?.storeName || 'Tất cả chi nhánh'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="border-gray-300"
              >
                Về trang chủ
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-[#AF140B] text-[#AF140B] hover:bg-[#AF140B] hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-[#2C2C2C] mb-1">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.change}</p>
                    </div>
                    <div className={`${stat.bg} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Groups */}
        <div className="space-y-6">
          {featureGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-[#2C2C2C]">{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => navigate(feature.path)}
                        className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-[#AF140B] hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`${feature.color} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#2C2C2C] mb-1 group-hover:text-[#AF140B] transition-colors">
                              {feature.title}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md mt-6">
          <CardHeader>
            <CardTitle className="text-xl text-[#2C2C2C]">Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => navigate('/manager/create-order')}
                className="bg-[#AF140B] hover:bg-[#8D0F08] h-auto py-4 flex-col gap-2"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>Tạo đơn hàng</span>
              </Button>
              <Button
                onClick={() => navigate('/manager/products')}
                className="bg-[#D4AF37] hover:bg-[#B8860B] h-auto py-4 flex-col gap-2"
              >
                <Package className="w-6 h-6" />
                <span>Thêm sản phẩm</span>
              </Button>
              <Button
                onClick={() => navigate('/manager/inventory')}
                className="bg-blue-600 hover:bg-blue-700 h-auto py-4 flex-col gap-2"
              >
                <Warehouse className="w-6 h-6" />
                <span>Kiểm kho</span>
              </Button>
              <Button
                onClick={() => navigate('/manager/reports')}
                className="bg-green-600 hover:bg-green-700 h-auto py-4 flex-col gap-2"
              >
                <BarChart3 className="w-6 h-6" />
                <span>Xem báo cáo</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}