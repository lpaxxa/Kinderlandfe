import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../ui/button';
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  Warehouse, DollarSign, Users, BarChart3, LogOut,
  ArrowLeftRight, Megaphone, Shield, UserCog,
  ClipboardList, MessageSquare, Truck, AlertTriangle, Tag,
  Menu, X, Home
} from 'lucide-react';

export default function ManagerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, logoutAdmin } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  // Sidebar navigation items
  const sidebarItems = [
    {
      section: 'Quản lý sản phẩm',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/manager/dashboard' },
        { title: 'Quản lý sản phẩm', icon: Package, path: '/manager/products' },
        { title: 'Quản lý danh mục', icon: LayoutDashboard, path: '/manager/categories' },
        { title: 'Kiểm tra tồn kho', icon: Warehouse, path: '/manager/inventory' },
        { title: 'Cập nhật kho', icon: ClipboardList, path: '/manager/storage' },
      ]
    },
    {
      section: 'Đơn hàng & Bán hàng',
      items: [
        { title: 'Quản lý đơn hàng', icon: ShoppingCart, path: '/manager/orders' },
        { title: 'Tạo đơn hàng', icon: FileText, path: '/manager/create-order' },
        { title: 'Xử lý hoàn trả', icon: ArrowLeftRight, path: '/manager/returns' },
      ]
    },
    {
      section: 'Kho hàng & Vận chuyển',
      items: [
        { title: 'Yêu cầu chuyển kho', icon: Truck, path: '/manager/stock-transfer' },
        { title: 'Nhập hàng từ kho chính', icon: Package, path: '/manager/import-orders' },
        { title: 'Quản lý nhập hàng', icon: ClipboardList, path: '/manager/import-management' },
        { title: 'Báo cáo hàng lỗi', icon: AlertTriangle, path: '/manager/defective-report' },
        { title: 'Kiểm kê thực tế', icon: ClipboardList, path: '/manager/physical-count' },
      ]
    },
    {
      section: 'Marketing & Nội dung',
      items: [
        { title: 'Quản lý khuyến mãi', icon: Megaphone, path: '/manager/promotions' },
        { title: 'Quản lý Blog', icon: FileText, path: '/manager/blog' },
        { title: 'Quản lý chính sách', icon: Shield, path: '/manager/policies' },
        { title: 'Quản lý đánh giá', icon: MessageSquare, path: '/manager/reviews' },
      ]
    },
    {
      section: 'Báo cáo & Tài chính',
      items: [
        { title: 'Báo cáo tổng hợp', icon: BarChart3, path: '/manager/reports' },
        { title: 'Quản lý tài chính', icon: DollarSign, path: '/manager/financial' },
        { title: 'Quản lý giá SKU', icon: Tag, path: '/manager/sku-price' },
      ]
    },
    {
      section: 'Tài khoản',
      items: [
        { title: 'Quản lý người dùng', icon: Users, path: '/manager/users' },
        { title: 'Đổi mật khẩu', icon: UserCog, path: '/manager/change-password' },
      ]
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Header Bar */}
      <header className="bg-[#AF140B] text-white sticky top-0 z-30 shadow-lg">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Manager Dashboard</h1>
              <p className="text-[11px] text-white/80 leading-tight">
                {adminUser?.storeName || 'Tất cả chi nhánh'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 border border-white/30 h-8 text-sm px-3"
            >
              <Home className="w-4 h-4 mr-1.5" />
              Về trang chủ
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:bg-white/20 border border-white/30 h-8 text-sm px-3"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-[#AF140B] overflow-y-auto transition-all duration-300 flex-shrink-0 ${
            sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
          }`}
          style={{ height: 'calc(100vh - 56px)' }}
        >
          <nav className="py-3">
            {sidebarItems.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-1">
                <h3 className="px-4 py-2 text-[11px] font-bold text-white/60 uppercase tracking-wider">
                  {group.section}
                </h3>
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={index}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors group border-l-3 ${
                        isActive
                          ? 'bg-white/20 text-white border-white font-semibold'
                          : 'text-white/90 hover:bg-white/15 hover:text-white border-transparent hover:border-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
                      }`} />
                      <span className="truncate">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content - Outlet renders the child route */}
        <main className="flex-1 overflow-y-auto bg-white" style={{ height: 'calc(100vh - 56px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
