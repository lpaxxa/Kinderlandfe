import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
    ArrowLeft,
    Plus,
    Search,
    Edit,
    Trash2,
    MoreVertical,
    RefreshCw,
    ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { brandApi, Brand, BrandPayload } from '../../services/brandApi';

export default function AdminBrandManagement() {
    const navigate = useNavigate();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    // Form state
    const [formData, setFormData] = useState<BrandPayload>({
        name: '',
        logoUrl: '',
    });

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const data = await brandApi.getAll();
            setBrands(data);
        } catch (error) {
            console.error('Failed to fetch brands:', error);
            toast.error('Không thể tải danh sách thương hiệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const filteredBrands = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddBrand = async () => {
        if (!formData.name) {
            toast.error('Vui lòng nhập tên thương hiệu');
            return;
        }

        try {
            await brandApi.create(formData);
            toast.success('Thêm thương hiệu thành công!');
            setIsAddDialogOpen(false);
            resetForm();
            fetchBrands();
        } catch (error) {
            toast.error('Thêm thương hiệu thất bại');
        }
    };

    const handleUpdateBrand = async () => {
        if (!editingBrand) return;
        if (!formData.name) {
            toast.error('Vui lòng nhập tên thương hiệu');
            return;
        }

        try {
            await brandApi.update(editingBrand.id, formData);
            toast.success('Cập nhật thương hiệu thành công!');
            setEditingBrand(null);
            resetForm();
            fetchBrands();
        } catch (error) {
            toast.error('Cập nhật thương hiệu thất bại');
        }
    };

    const handleDeleteBrand = async (brand: Brand) => {
        if (window.confirm(`Bạn có chắc muốn xóa thương hiệu "${brand.name}"?`)) {
            try {
                await brandApi.delete(brand.id);
                toast.success('Đã xóa thương hiệu');
                fetchBrands();
            } catch (error) {
                toast.error('Xóa thương hiệu thất bại');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            logoUrl: '',
        });
    };

    const openEditDialog = (brand: Brand) => {
        setEditingBrand(brand);
        setFormData({
            name: brand.name,
            logoUrl: brand.logoUrl || '',
        });
    };

    return (
        <div className="min-h-full bg-white">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="font-bold text-xl">Quản lý thương hiệu</h1>
                                <p className="text-xs text-gray-500">{filteredBrands.length} thương hiệu</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={fetchBrands} disabled={loading}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Dialog open={isAddDialogOpen} onOpenChange={(open: boolean) => {
                                setIsAddDialogOpen(open);
                                if (!open) resetForm();
                            }}>
                                <DialogTrigger asChild>
                                    <Button className="bg-[#AF140B] hover:bg-[#8e1009] text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm thương hiệu
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Thêm thương hiệu mới</DialogTitle>
                                        <DialogDescription>
                                            Tạo thương hiệu sản phẩm mới trong hệ thống
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Tên thương hiệu *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="VD: Hasbro, LEGO, Mattel"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="logoUrl">URL Logo</Label>
                                            <Input
                                                id="logoUrl"
                                                value={formData.logoUrl || ''}
                                                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                            Hủy
                                        </Button>
                                        <Button onClick={handleAddBrand} className="bg-[#AF140B] hover:bg-[#8e1009] text-white">
                                            Lưu thương hiệu
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm thương hiệu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Brands Table */}
                <Card className="bg-white border border-gray-200">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px] pl-6">ID</TableHead>
                                    <TableHead className="w-[100px]">Logo</TableHead>
                                    <TableHead>Tên thương hiệu</TableHead>
                                    <TableHead className="w-[100px] pr-6 text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                            Đang tải dữ liệu...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredBrands.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                            Không tìm thấy thương hiệu nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredBrands.map((brand) => (
                                        <TableRow key={brand.id}>
                                            <TableCell className="pl-6 font-mono text-xs text-gray-400">
                                                #{brand.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-10 h-10 bg-gray-50 rounded border border-gray-100 flex items-center justify-center overflow-hidden">
                                                    {brand.logoUrl ? (
                                                        <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-gray-300" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-gray-900">{brand.name}</span>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditDialog(brand)}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteBrand(brand)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Xóa
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={!!editingBrand} onOpenChange={(open: boolean) => !open && setEditingBrand(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa thương hiệu</DialogTitle>
                            <DialogDescription>
                                Cập nhật thông tin cho thương hiệu #{editingBrand?.id}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Tên thương hiệu *</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-logo">URL Logo</Label>
                                <Input
                                    id="edit-logo"
                                    value={formData.logoUrl || ''}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingBrand(null)}>
                                Hủy
                            </Button>
                            <Button onClick={handleUpdateBrand} className="bg-[#AF140B] hover:bg-[#8e1009] text-white">
                                Lưu thay đổi
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
