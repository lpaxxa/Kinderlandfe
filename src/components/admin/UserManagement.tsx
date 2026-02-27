import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  ArrowLeft, Plus, Search, Filter, Edit2, Trash2, Shield,
  Users, UserPlus, Mail, Phone, Calendar, Award, Key,
  CheckCircle2, XCircle, AlertTriangle, Eye, Save, History,
  User, Crown, UserCog, Lock
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Types
type UserRole = 'customer' | 'staff' | 'manager' | 'admin';
type UserStatus = 'active' | 'inactive';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'diamond';
  mfaEnabled: boolean;
  createdAt: Date;
  lastLogin?: Date;
  totalOrders: number;
  totalSpent: number;
  childBirthday?: Date;
}

// Mock data
const mockUsers: User[] = [
  {
    id: 'USR-001',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    role: 'customer',
    status: 'active',
    loyaltyPoints: 1250,
    loyaltyTier: 'gold',
    mfaEnabled: false,
    createdAt: new Date('2025-01-15'),
    lastLogin: new Date('2026-02-19'),
    totalOrders: 15,
    totalSpent: 12500000,
    childBirthday: new Date('2020-03-10'),
  },
  {
    id: 'USR-002',
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    phone: '0912345678',
    role: 'customer',
    status: 'active',
    loyaltyPoints: 3500,
    loyaltyTier: 'diamond',
    mfaEnabled: false,
    createdAt: new Date('2024-06-20'),
    lastLogin: new Date('2026-02-20'),
    totalOrders: 32,
    totalSpent: 35000000,
    childBirthday: new Date('2019-07-22'),
  },
  {
    id: 'STF-001',
    name: 'Lê Văn Staff',
    email: 'staff1@kinderland.vn',
    phone: '0923456789',
    role: 'staff',
    status: 'active',
    loyaltyPoints: 0,
    loyaltyTier: 'bronze',
    mfaEnabled: true,
    createdAt: new Date('2025-12-01'),
    lastLogin: new Date('2026-02-20'),
    totalOrders: 0,
    totalSpent: 0,
  },
  {
    id: 'MGR-001',
    name: 'Trần Thị Quản Lý',
    email: 'manager@kinderland.vn',
    phone: '0934567890',
    role: 'manager',
    status: 'active',
    loyaltyPoints: 0,
    loyaltyTier: 'bronze',
    mfaEnabled: true,
    createdAt: new Date('2025-11-15'),
    lastLogin: new Date('2026-02-20'),
    totalOrders: 0,
    totalSpent: 0,
  },
];

export default function UserManagement() {
  const navigate = useNavigate();
  const { adminUser } = useAdmin();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const [pointsAdjustment, setPointsAdjustment] = useState(0);
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setEditForm(user);
    setShowEditDialog(true);
  };

  const handleSaveChanges = () => {
    if (!selectedUser) return;

    // BR-54: Only Administrator can create/delete Staff or Manager accounts
    if (editForm.role && ['staff', 'manager', 'admin'].includes(editForm.role)) {
      if (adminUser?.role !== 'admin') {
        toast.error('Chỉ Administrator mới có thể thay đổi role Staff/Manager');
        return;
      }
    }

    // Exception: Cannot deactivate own account
    if (selectedUser.email === adminUser?.email && editForm.status === 'inactive') {
      toast.error('Không thể vô hiệu hóa tài khoản của chính mình để tránh khóa hệ thống');
      return;
    }

    // Check email uniqueness
    const emailExists = users.some(u => u.email === editForm.email && u.id !== selectedUser.id);
    if (emailExists) {
      toast.error('Email đã được sử dụng bởi tài khoản khác');
      return;
    }

    // Update user
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editForm } : u));
    
    // Log audit trail
    console.log('Audit Trail:', {
      action: 'UPDATE_USER',
      userId: selectedUser.id,
      changes: editForm,
      admin: adminUser?.email,
      timestamp: new Date(),
    });

    toast.success('Cập nhật thông tin người dùng thành công');
    setShowEditDialog(false);
  };

  const handleAdjustPoints = () => {
    if (!selectedUser) return;

    // BR-55: Cannot manually increase more than 500 points without secondary approval
    if (pointsAdjustment > 500) {
      toast.error('Không thể tăng điểm quá 500 một lần. Cần phê duyệt cấp hai để tăng số điểm lớn hơn.');
      return;
    }

    const newPoints = selectedUser.loyaltyPoints + pointsAdjustment;
    if (newPoints < 0) {
      toast.error('Số điểm không thể âm');
      return;
    }

    setUsers(users.map(u => 
      u.id === selectedUser.id 
        ? { ...u, loyaltyPoints: newPoints }
        : u
    ));

    // Log audit trail
    console.log('Audit Trail:', {
      action: 'ADJUST_LOYALTY_POINTS',
      userId: selectedUser.id,
      oldPoints: selectedUser.loyaltyPoints,
      adjustment: pointsAdjustment,
      newPoints: newPoints,
      admin: adminUser?.email,
      timestamp: new Date(),
    });

    toast.success(`Đã ${pointsAdjustment > 0 ? 'cộng' : 'trừ'} ${Math.abs(pointsAdjustment)} điểm thành công`);
    setShowPointsDialog(false);
    setPointsAdjustment(0);
    setSelectedUser({ ...selectedUser, loyaltyPoints: newPoints });
  };

  const handleResetPassword = (user: User) => {
    // BR-57: Password complexity requirement
    const tempPassword = 'TempPass123!';
    
    toast.success(`Đã gửi email reset mật khẩu đến ${user.email}`);
    
    // Log audit trail
    console.log('Audit Trail:', {
      action: 'RESET_PASSWORD',
      userId: user.id,
      admin: adminUser?.email,
      timestamp: new Date(),
    });
  };

  const handlePromoteRole = (user: User, newRole: UserRole) => {
    // Alternative Flow 5.1: Role Assignment
    if (adminUser?.role !== 'admin') {
      toast.error('Chỉ Administrator mới có thể thay đổi role');
      return;
    }

    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, role: newRole, mfaEnabled: ['manager', 'admin'].includes(newRole) ? true : u.mfaEnabled }
        : u
    ));

    // Log audit trail
    console.log('Audit Trail:', {
      action: 'PROMOTE_ROLE',
      userId: user.id,
      oldRole: user.role,
      newRole: newRole,
      admin: adminUser?.email,
      timestamp: new Date(),
    });

    toast.success(`Đã chuyển role của ${user.name} thành ${newRole}`);
  };

  const handleMassDeactivate = () => {
    // Alternative Flow 5.2: Mass Deactivation
    const inactiveUsers = users.filter(u => u.role === 'customer' && u.status === 'inactive');
    
    if (inactiveUsers.length === 0) {
      toast.error('Không có tài khoản khách hàng nào đang inactive');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn lưu trữ ${inactiveUsers.length} tài khoản inactive?`)) {
      // In real implementation, this would archive the accounts
      toast.success(`Đã lưu trữ ${inactiveUsers.length} tài khoản thành công`);
      
      console.log('Audit Trail:', {
        action: 'MASS_DEACTIVATE',
        count: inactiveUsers.length,
        userIds: inactiveUsers.map(u => u.id),
        admin: adminUser?.email,
        timestamp: new Date(),
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      customer: { bg: 'bg-blue-50', text: 'text-blue-700', icon: User },
      staff: { bg: 'bg-gray-50', text: 'text-gray-700', icon: UserCog },
      manager: { bg: 'bg-purple-50', text: 'text-purple-700', icon: Crown },
      admin: { bg: 'bg-red-50', text: 'text-red-700', icon: Shield },
    };
    const style = styles[role];
    const Icon = style.icon;
    return (
      <Badge className={`${style.bg} ${style.text} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {role === 'customer' ? 'Khách hàng' : role === 'staff' ? 'Nhân viên' : role === 'manager' ? 'Quản lý' : 'Admin'}
      </Badge>
    );
  };

  const getStatusBadge = (status: UserStatus) => {
    return status === 'active' ? (
      <Badge className="bg-green-50 text-green-700 border-0">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Hoạt động
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-600 border-0">
        <XCircle className="w-3 h-3 mr-1" />
        Vô hiệu
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const styles = {
      bronze: { bg: 'bg-amber-100', text: 'text-amber-800' },
      silver: { bg: 'bg-gray-200', text: 'text-gray-800' },
      gold: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      diamond: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
    };
    const style = styles[tier as keyof typeof styles];
    return (
      <Badge className={`${style.bg} ${style.text} border-0 text-xs`}>
        {tier.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
                <p className="text-sm text-gray-600">UC-22: Manage User's Accounts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAuditLog(!showAuditLog)}
                className="border-gray-300 text-gray-700"
              >
                <History className="w-4 h-4 mr-2" />
                Lịch sử thay đổi
              </Button>
              {adminUser?.role === 'admin' && (
                <Button 
                  variant="outline"
                  onClick={handleMassDeactivate}
                  className="border-gray-300 text-gray-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Lưu trữ hàng loạt
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng khách hàng</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'customer').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nhân viên</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'staff').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <UserCog className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quản lý</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'manager').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm theo tên, email hoặc số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                </div>
              </div>
              <Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
                <SelectTrigger className="w-full md:w-48 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="customer">Khách hàng</SelectItem>
                  <SelectItem value="staff">Nhân viên</SelectItem>
                  <SelectItem value="manager">Quản lý</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-full md:w-48 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Vô hiệu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Danh sách người dùng ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Người dùng</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vai trò</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Điểm / Hạng</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">MFA</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="py-4 px-4">
                        {user.role === 'customer' ? (
                          <div>
                            <p className="font-semibold text-gray-900">{user.loyaltyPoints.toLocaleString()} điểm</p>
                            {getTierBadge(user.loyaltyTier)}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {user.mfaEnabled ? (
                          <Badge className="bg-green-50 text-green-700 border-0 text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Bật
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">Tắt</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(user)}
                            className="text-gray-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Chi tiết
                          </Button>
                          {user.role === 'customer' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowPointsDialog(true);
                              }}
                              className="text-gray-700"
                            >
                              <Award className="w-4 h-4 mr-1" />
                              Điểm
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleResetPassword(user)}
                            className="text-gray-700"
                          >
                            <Key className="w-4 h-4 mr-1" />
                            Reset MK
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Business Rules */}
        <Card className="mt-8 border border-gray-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Business Rules - Quy tắc nghiệp vụ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-gray-900 font-semibold">BR-54:</span>
                  <p>Chỉ Administrator mới có thể tạo/xóa tài khoản Staff/Manager</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-gray-900 font-semibold">BR-55:</span>
                  <p>Không thể cộng quá 500 điểm một lần (cần phê duyệt cấp 2)</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-gray-900 font-semibold">BR-56:</span>
                  <p>Tài khoản Manager/Admin phải bật MFA</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-gray-900 font-semibold">BR-57:</span>
                  <p>Mật khẩu tối thiểu 8 ký tự, có số và ký tự đặc biệt</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Chỉnh sửa thông tin người dùng</DialogTitle>
            <DialogDescription className="text-gray-600">
              Cập nhật thông tin, role và trạng thái tài khoản
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Họ tên *</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Email *</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="border-gray-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Số điện thoại</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Vai trò</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: UserRole) => setEditForm({ ...editForm, role: value })}
                  disabled={adminUser?.role !== 'admin'}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Khách hàng</SelectItem>
                    <SelectItem value="staff">Nhân viên</SelectItem>
                    <SelectItem value="manager">Quản lý</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Trạng thái tài khoản</p>
                <p className="text-sm text-gray-600">Kích hoạt hoặc vô hiệu hóa tài khoản</p>
              </div>
              <Switch
                checked={editForm.status === 'active'}
                onCheckedChange={(checked) => 
                  setEditForm({ ...editForm, status: checked ? 'active' : 'inactive' })
                }
              />
            </div>
            {['manager', 'admin'].includes(editForm.role || '') && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-gray-900">Multi-Factor Authentication (MFA)</p>
                  <p className="text-sm text-gray-600">BR-56: Bắt buộc cho Manager/Admin</p>
                </div>
                <Switch
                  checked={editForm.mfaEnabled}
                  onCheckedChange={(checked) => 
                    setEditForm({ ...editForm, mfaEnabled: checked })
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-gray-300">
              Hủy
            </Button>
            <Button onClick={handleSaveChanges} className="bg-gray-900 hover:bg-gray-800 text-white">
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Points Dialog */}
      <Dialog open={showPointsDialog} onOpenChange={setShowPointsDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Điều chỉnh điểm thưởng</DialogTitle>
            <DialogDescription className="text-gray-600">
              Cộng hoặc trừ điểm cho khách hàng {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Điểm hiện tại</p>
              <p className="text-2xl font-bold text-gray-900">{selectedUser?.loyaltyPoints.toLocaleString()} điểm</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Số điểm điều chỉnh</Label>
              <Input
                type="number"
                placeholder="Nhập số dương để cộng, số âm để trừ"
                value={pointsAdjustment}
                onChange={(e) => setPointsAdjustment(Number(e.target.value))}
                className="border-gray-300"
              />
              <p className="text-xs text-gray-500">
                BR-55: Không thể cộng quá 500 điểm một lần
              </p>
            </div>
            {selectedUser && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 mb-1">Điểm sau khi điều chỉnh</p>
                <p className="text-xl font-bold text-gray-900">
                  {(selectedUser.loyaltyPoints + pointsAdjustment).toLocaleString()} điểm
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPointsDialog(false)} className="border-gray-300">
              Hủy
            </Button>
            <Button onClick={handleAdjustPoints} className="bg-gray-900 hover:bg-gray-800 text-white">
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
