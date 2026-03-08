import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  ImageIcon,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { productApi, Product as APIProduct } from '../../services/productApi';
import { brandApi, Brand } from '../../services/brandApi';
import { categoryApi, Category } from '../../services/categoryApi';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export default function ProductManagement() {
  const navigate = useNavigate();
  const [productList, setProductList] = useState<APIProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<APIProduct | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    brandId: '',
    stock: '0',
    description: '',
    imageUrl: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, cats, brnds] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
        brandApi.getAll()
      ]);
      setProductList(prods || []);
      setCategories(cats || []);
      setBrands(brnds || []);
    } catch (error) {
      console.error('Failed to fetch product data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = productList.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brandName && product.brandName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || product.categoryName === filterCategory;
    const matchesBrand = filterBrand === 'all' || product.brandName === filterBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.categoryId || !formData.brandId) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      await productApi.create({
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        categoryId: Number(formData.categoryId),
        brandId: Number(formData.brandId)
      });
      toast.success('Thêm sản phẩm thành công!');
      setIsAddDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Thêm sản phẩm thất bại');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      await productApi.update(editingProduct.id, {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        categoryId: Number(formData.categoryId),
        brandId: Number(formData.brandId)
      });
      toast.success('Cập nhật sản phẩm thành công!');
      setEditingProduct(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Cập nhật sản phẩm thất bại');
    }
  };

  const handleDeleteProduct = async (product: APIProduct) => {
    if (confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
      try {
        await productApi.delete(product.id);
        toast.success('Đã xóa sản phẩm');
        fetchData();
      } catch (error) {
        toast.error('Xóa sản phẩm thất bại');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      categoryId: '',
      brandId: '',
      stock: '0',
      description: '',
      imageUrl: '',
    });
  };

  const openEditDialog = (product: APIProduct) => {
    setEditingProduct(product);
    const cat = categories.find(c => c.name === product.categoryName);
    const brnd = brands.find(b => b.name === product.brandName);

    setFormData({
      name: product.name,
      price: product.minPrice ? product.minPrice.toString() : '0',
      categoryId: cat ? cat.id.toString() : '',
      brandId: brnd ? brnd.id.toString() : '',
      stock: '0',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
    });
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Hết hàng</Badge>;
    if (stock <= 10) return <Badge variant="outline" className="bg-[#FFE5E3] text-[#AF140B] border-[#AF140B]/30">Sắp hết</Badge>;
    return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">Còn hàng</Badge>;
  };

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-xl">Quản lý sản phẩm</h1>
                <p className="text-xs text-gray-500">{filteredProducts.length} sản phẩm</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Thêm sản phẩm mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin sản phẩm mới vào hệ thống
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="name">Tên sản phẩm *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="VD: LEGO City Police Station"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Danh mục *</Label>
                      <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="brand">Thương hiệu *</Label>
                      <Select value={formData.brandId} onValueChange={(value) => setFormData({ ...formData, brandId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thương hiệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="price">Giá bán (đ) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="500000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Số lượng *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="100"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="imageUrl">URL hình ảnh</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Mô tả</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Mô tả chi tiết về sản phẩm..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleAddProduct} className="bg-indigo-600 hover:bg-indigo-700">
                    Thêm sản phẩm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6 bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Tìm theo tên, thương hiệu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="filterCategory">Danh mục</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filterBrand">Thương hiệu</Label>
                <Select value={filterBrand} onValueChange={setFilterBrand}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle>Danh sách sản phẩm</CardTitle>
            <CardDescription>
              Quản lý toàn bộ sản phẩm trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Hình</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Thương hiệu</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead className="text-center">Tồn kho</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-48 text-center text-gray-500">
                      <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
                      Đang tải danh sách sản phẩm...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-48 text-center text-gray-500">
                      Không tìm thấy sản phẩm nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden border">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">ID: {product.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.categoryName}</Badge>
                      </TableCell>
                      <TableCell>{product.brandName}</TableCell>
                      <TableCell className="text-right font-medium">
                        {product.minPrice?.toLocaleString()}đ
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        0
                      </TableCell>
                      <TableCell className="text-center">
                        {getStockBadge(0)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(product)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product)}
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
        <Dialog open={!!editingProduct} onOpenChange={(open: boolean) => !open && setEditingProduct(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin sản phẩm
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="edit-name">Tên sản phẩm *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Danh mục *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-brand">Thương hiệu *</Label>
                  <Select value={formData.brandId} onValueChange={(value) => setFormData({ ...formData, brandId: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-price">Giá bán (đ) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-stock">Số lượng *</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-imageUrl">URL hình ảnh</Label>
                  <Input
                    id="edit-imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-description">Mô tả</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                Hủy
              </Button>
              <Button onClick={handleUpdateProduct} className="bg-indigo-600 hover:bg-indigo-700">
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}