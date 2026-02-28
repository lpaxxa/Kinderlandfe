import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { Package, ShieldCheck } from 'lucide-react';

export type UserRole = 'admin' | 'staff' | 'manager';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  storeId?: string; // For staff/manager members
  storeName?: string;
}

// Mock users for demo
const MOCK_USERS: { email: string; password: string; user: AdminUser }[] = [
  {
    email: 'admin@kinderland.vn',
    password: 'admin123',
    user: {
      id: 'admin-1',
      email: 'admin@kinderland.vn',
      name: 'Nguyễn Văn Admin',
      role: 'admin',
    },
  },
  {
    email: 'manager@kinderland.vn',
    password: 'manager123',
    user: {
      id: 'manager-1',
      email: 'manager@kinderland.vn',
      name: 'Trần Thị Quản Lý',
      role: 'manager',
      storeId: 'store-1',
      storeName: 'Kinderland Vincom Center Đồng Khởi',
    },
  },
  {
    email: 'staff1@kinderland.vn',
    password: 'staff123',
    user: {
      id: 'staff-1',
      email: 'staff1@kinderland.vn',
      name: 'Trần Thị Nhân Viên',
      role: 'staff',
      storeId: 'store-1',
      storeName: 'Kinderland Vincom Center Đồng Khởi',
    },
  },
  {
    email: 'staff2@kinderland.vn',
    password: 'staff123',
    user: {
      id: 'staff-2',
      email: 'staff2@kinderland.vn',
      name: 'Lê Văn Thành',
      role: 'staff',
      storeId: 'store-6',
      storeName: 'Kinderland Royal City Hà Nội',
    },
  },
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock login check
    setTimeout(() => {
      const found = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (found) {
        toast.success(`Đăng nhập thành công! Xin chào ${found.user.name}`);
        loginAdmin(found.user);
        if (found.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (found.user.role === 'manager') {
          navigate('/manager/dashboard');
        } else {
          navigate('/staff/dashboard');
        }
      } else {
        toast.error('Email hoặc mật khẩu không đúng!');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Kinderland</h1>
          </div>
          <p className="text-gray-600">Hệ thống quản trị</p>
        </div>

        <Card className="border border-gray-200 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-gray-900" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-gray-900">Đăng nhập</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Dành cho quản trị viên, quản lý và nhân viên cửa hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@kinderland.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-700 mb-3 font-semibold">Tài khoản demo:</p>
              <div className="space-y-2 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-1">Administrator (Toàn quyền)</p>
                  <p className="text-gray-700 font-mono">admin@kinderland.vn / admin123</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="font-semibold text-gray-900 mb-1">Manager (Quản lý)</p>
                  <p className="text-gray-700 font-mono">manager@kinderland.vn / manager123</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-semibold text-gray-900 mb-1">Staff - Nhân viên HCM</p>
                  <p className="text-gray-700 font-mono">staff1@kinderland.vn / staff123</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-semibold text-gray-900 mb-1">Staff - Nhân viên Hà Nội</p>
                  <p className="text-gray-700 font-mono">staff2@kinderland.vn / staff123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to customer site */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Quay lại trang chủ Kinderland
          </Button>
        </div>
      </div>
    </div>
  );
}