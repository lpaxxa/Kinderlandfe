import React from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp, FileText,
  Warehouse, DollarSign, LogOut, Settings, Shield, UserCog, BarChart3,
  Megaphone, MessageSquare, Star, ClipboardList, LockKeyhole,
  UserPlus, Eye, Activity
} from 'lucide-react';

export default function EnhancedAdminDashboard() {
  const navigate = useNavigate();
  const { adminUser, logoutAdmin } = useAdmin();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  // Statistics data
  const stats = [
    { label: 'Tổng đơn hàng', value: '1,245', change: '+18.2%', icon: ShoppingCart, color: 'text-[#AF140B]', bg: 'bg-[#AF140B]/10' },
    { label: 'Doanh thu tháng này', value: '₫842M', change: '+23.5%', icon: DollarSign, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10' },
    { label: 'Khách hàng mới', value: '356', change: '+12.3%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Tỷ lệ chuyển đổi', value: '3.8%', change: '+0.4%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  // Admin features grouped by category
  const featureGroups = [
    {
      title: 'Quản lý Sản phẩm & Danh mục',
      description: 'Quản lý toàn bộ danh mục sản phẩm',
      features: [
        { 
          title: 'Quản lý Sản phẩm', 
          description: 'Thêm, sửa, xóa sản phẩm (UC-18, UC-45, UC-46, UC-47)', 
          icon: Package,
          path: '/admin/products',
          color: 'bg-[#AF140B]'
        },
        { 
          title: 'Quản lý Danh mục', 
          description: 'Tạo và quản lý danh mục (UC-19)', 
          icon: LayoutDashboard,
          path: '/admin/categories',
          color: 'bg-[#AF140B]'
        },
      ]
    },
    {
      title: 'Quản lý Đơn hàng',
      description: 'Xử lý và theo dõi đơn hàng',
      features: [
        { 
          title: 'Quản lý Đơn hàng', 
          description: 'Xem và xử lý tất cả đơn hàng (UC-20)', 
          icon: ShoppingCart,
          path: '/admin/orders',
          color: 'bg-[#D4AF37]'
        },
        { 
          title: 'Xử lý Hoàn trả', 
          description: 'Duyệt yêu cầu trả hàng và hoàn tiền (UC-24)', 
          icon: ClipboardList,
          path: '/admin/returns',
          color: 'bg-[#D4AF37]'
        },
      ]
    },
    {
      title: 'Marketing & Khuyến mãi',
      description: 'Quản lý chương trình khuyến mãi và nội dung',
      features: [
        { 
          title: 'Quản lý Khuyến mãi', 
          description: 'Tạo mã giảm giá và chương trình khuyến mãi (UC-21)', 
          icon: Megaphone,
          path: '/admin/promotions',
          color: 'bg-purple-600'
        },
        { 
          title: 'Quản lý Blog', 
          description: 'Tạo và chỉnh sửa bài viết (UC-25)', 
          icon: FileText,
          path: '/admin/blog',
          color: 'bg-purple-600'
        },
        { 
          title: 'Quản lý Chính sách', 
          description: 'Cập nhật chính sách website (UC-48)', 
          icon: Shield,
          path: '/admin/policies',
          color: 'bg-purple-600'
        },
        { 
          title: 'Quản lý Đánh giá', 
          description: 'Duyệt và phản hồi đánh giá (UC-31)', 
          icon: MessageSquare,
          path: '/admin/reviews',
          color: 'bg-purple-600'
        },
      ]
    },
    {
      title: 'Quản lý Người dùng & Phân quyền',
      description: 'Quản lý tài khoản và quyền truy cập',
      features: [
        { 
          title: 'Quản lý Người dùng', 
          description: 'Quản lý tất cả tài khoản khách hàng (UC-22)', 
          icon: Users,
          path: '/admin/users',
          color: 'bg-indigo-600'
        },
        { 
          title: 'Quản lý Phân quyền', 
          description: 'Thiết lập quyền truy cập (UC-43)', 
          icon: Shield,
          path: '/admin/permissions',
          color: 'bg-indigo-600'
        },
        { 
          title: 'Thêm Quyền cho Role', 
          description: 'Gán quyền cho vai trò (UC-44)', 
          icon: UserPlus,
          path: '/admin/role-permissions',
          color: 'bg-indigo-600'
        },
      ]
    },
    {
      title: 'Báo cáo & Tài chính',
      description: 'Xem báo cáo và thống kê kinh doanh',
      features: [
        { 
          title: 'Dashboard Tổng quan', 
          description: 'Xem thống kê tổng quan (UC-42)', 
          icon: Activity,
          path: '/admin/overview',
          color: 'bg-green-600'
        },
        { 
          title: 'Báo cáo Chi tiết', 
          description: 'Xem báo cáo doanh số, tồn kho (UC-23)', 
          icon: BarChart3,
          path: '/admin/reports',
          color: 'bg-green-600'
        },
        { 
          title: 'Quản lý Tài chính', 
          description: 'Theo dõi doanh thu, chi phí (UC-26)', 
          icon: DollarSign,
          path: '/admin/financial',
          color: 'bg-green-600'
        },
      ]
    },
    {
      title: 'Cài đặt Tài khoản',
      description: 'Quản lý tài khoản cá nhân',
      features: [
        { 
          title: 'Đổi Mật khẩu', 
          description: 'Thay đổi mật khẩu đăng nhập (UC-39)', 
          icon: LockKeyhole,
          path: '/admin/change-password',
          color: 'bg-gray-600'
        },
        { 
          title: 'Cài đặt Hệ thống', 
          description: 'Cấu hình hệ thống', 
          icon: Settings,
          path: '/admin/settings',
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
              <div className="w-10 h-10 bg-[#AF140B] rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2C2C2C]">Administrator Dashboard</h1>
                <p className="text-sm text-gray-600">
                  {adminUser?.name} - Toàn quyền quản trị
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
                      <p className="text-xs text-green-600 font-medium">{stat.change}</p>
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

        {/* Welcome Banner */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-[#AF140B] to-[#8D0F08] text-white mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại, {adminUser?.name}!</h2>
                <p className="text-white/90">
                  Bạn có toàn quyền quản trị hệ thống Kinderland. Quản lý sản phẩm, đơn hàng, khuyến mãi và nhiều hơn nữa.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                onClick={() => navigate('/admin/products')}
                className="bg-[#AF140B] hover:bg-[#8D0F08] h-auto py-4 flex-col gap-2"
              >
                <Package className="w-6 h-6" />
                <span>Thêm sản phẩm</span>
              </Button>
              <Button 
                onClick={() => navigate('/admin/promotions')}
                className="bg-[#D4AF37] hover:bg-[#B8860B] h-auto py-4 flex-col gap-2"
              >
                <Megaphone className="w-6 h-6" />
                <span>Tạo khuyến mãi</span>
              </Button>
              <Button 
                onClick={() => navigate('/admin/users')}
                className="bg-indigo-600 hover:bg-indigo-700 h-auto py-4 flex-col gap-2"
              >
                <Users className="w-6 h-6" />
                <span>Quản lý user</span>
              </Button>
              <Button 
                onClick={() => navigate('/admin/reports')}
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
