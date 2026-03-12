import { useState, useEffect, useRef } from 'react';
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
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  ImageIcon,
  MoreVertical,
  Loader2,
  PackageX,
} from 'lucide-react';
import { toast } from 'sonner';
import { productApi, Product as APIProduct } from '../../services/productApi';
import { brandApi, Brand } from '../../services/brandApi';
import { categoryApi, Category } from '../../services/categoryApi';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const emptyForm = {
  name: '',
  price: '',
  categoryId: '',
  brandId: '',
  description: '',
  imageUrl: '',
};

export default function ProductManagement() {
  const [productList, setProductList] = useState<APIProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<APIProduct | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch all data on mount ──────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, cats, brnds] = await Promise.all([
        productApi.getAll(0, 1000), // Admin panel gets a large first page or needs full pagination logic eventually
        categoryApi.getAll(),
        brandApi.getAll(),
      ]);
      setProductList(prods?.content || []);
      setCategories(cats || []);
      setBrands(brnds || []);
    } catch (error: any) {
      toast.error('Không thể tải dữ liệu: ' + (error?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Debounced server-side search ─────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (!value.trim()) {
      fetchData();
      return;
    }

    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await productApi.search(value, 0, 1000);
        setProductList(results.content);
      } catch {
        // fallback to client-side filter already showing
      } finally {
        setSearchLoading(false);
      }
    }, 500);
  };

  // ── Client-side filter (category / brand) ────────────────────────────────
  const filteredProducts = productList.filter((p) => {
    const matchCat = filterCategory === 'all' || p.categoryName === filterCategory;
    const matchBrand = filterBrand === 'all' || p.brandName === filterBrand;
    return matchCat && matchBrand;
  });

  // ── CRUD handlers ────────────────────────────────────────────────────────

  // POST /api/v1/products
  const handleAddProduct = async () => {
    if (!formData.name || !formData.categoryId || !formData.brandId) {
      toast.error('Vui lòng điền đầy đủ Tên, Danh mục, Thương hiệu');
      return;
    }
    setSaving(true);
    try {
      await productApi.create({
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        categoryId: Number(formData.categoryId),
        brandId: Number(formData.brandId),
      });
      toast.success('✅ Thêm sản phẩm thành công!');
      setIsAddDialogOpen(false);
      setFormData({ ...emptyForm });
      fetchData();
    } catch (error: any) {
      toast.error('Thêm thất bại: ' + (error?.message || 'Lỗi không xác định'));
    } finally {
      setSaving(false);
    }
  };

  // PUT /api/v1/products/{id}
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    if (!formData.name || !formData.categoryId || !formData.brandId) {
      toast.error('Vui lòng điền đầy đủ Tên, Danh mục, Thương hiệu');
      return;
    }
    setSaving(true);
    try {
      await productApi.update(editingProduct.id, {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        categoryId: Number(formData.categoryId),
        brandId: Number(formData.brandId),
      });
      toast.success('✅ Cập nhật sản phẩm thành công!');
      setEditingProduct(null);
      setFormData({ ...emptyForm });
      fetchData();
    } catch (error: any) {
      toast.error('Cập nhật thất bại: ' + (error?.message || 'Lỗi không xác định'));
    } finally {
      setSaving(false);
    }
  };

  // DELETE /api/v1/products/{id}
  const handleDeleteProduct = async (product: APIProduct) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) return;
    setDeleting(product.id);
    try {
      await productApi.delete(product.id);
      toast.success('🗑️ Đã xóa sản phẩm');
      fetchData();
    } catch (error: any) {
      toast.error('Xóa thất bại: ' + (error?.message || 'Lỗi không xác định'));
    } finally {
      setDeleting(null);
    }
  };

  const openEditDialog = (product: APIProduct) => {
    const cat = categories.find((c) => c.name === product.categoryName);
    const brnd = brands.find((b) => b.name === product.brandName);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.minPrice?.toString() ?? '0',
      categoryId: cat ? cat.id.toString() : '',
      brandId: brnd ? brnd.id.toString() : '',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
    });
  };

  const formatPrice = (price?: number) =>
    price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price) : '—';

  // ── Shared form fields ───────────────────────────────────────────────────
  const ProductForm = () => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div className="col-span-2">
          <Label htmlFor="f-name">Tên sản phẩm *</Label>
          <Input
            id="f-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="VD: LEGO City Police Station"
          />
        </div>

        {/* Category */}
        <div>
          <Label>Danh mục *</Label>
          <Select value={formData.categoryId} onValueChange={(v: string) => setFormData({ ...formData, categoryId: v })}>
            <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand */}
        <div>
          <Label>Thương hiệu *</Label>
          <Select value={formData.brandId} onValueChange={(v: string) => setFormData({ ...formData, brandId: v })}>
            <SelectTrigger><SelectValue placeholder="Chọn thương hiệu" /></SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Image URL */}
        <div className="col-span-2">
          <Label htmlFor="f-img">URL hình ảnh</Label>
          <Input
            id="f-img"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          {formData.imageUrl && (
            <img src={formData.imageUrl} alt="preview" className="mt-2 h-24 object-cover rounded border" />
          )}
        </div>

        {/* Description */}
        <div className="col-span-2">
          <Label htmlFor="f-desc">Mô tả</Label>
          <Textarea
            id="f-desc"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Mô tả chi tiết sản phẩm..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="font-bold text-xl">Quản lý sản phẩm</h1>
              <p className="text-xs text-gray-500">{filteredProducts.length} sản phẩm</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>

              {/* Add Dialog */}
              <Dialog open={isAddDialogOpen} onOpenChange={(open: boolean) => { setIsAddDialogOpen(open); if (!open) setFormData({ ...emptyForm }); }}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sản phẩm
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Thêm sản phẩm mới</DialogTitle>
                    <DialogDescription>POST /api/v1/products</DialogDescription>
                  </DialogHeader>
                  <ProductForm />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleAddProduct} className="bg-indigo-600 hover:bg-indigo-700" disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Thêm sản phẩm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6 bg-white border border-gray-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search — GET /api/v1/products/search */}
              <div className="md:col-span-2">
                <Label htmlFor="search">Tìm kiếm (server-side)</Label>
                <div className="relative">
                  {searchLoading
                    ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
                    : <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
                  <Input
                    id="search"
                    placeholder="Tìm theo tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter category */}
              <div>
                <Label>Danh mục</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter brand */}
              <div>
                <Label>Thương hiệu</Label>
                <Select value={filterBrand} onValueChange={setFilterBrand}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle>Danh sách sản phẩm</CardTitle>
            <CardDescription>
              GET /api/v1/products · POST /api/v1/products · PUT /api/v1/products/&#123;id&#125; · DELETE /api/v1/products/&#123;id&#125;
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
                  <TableHead className="text-center">Khuyến mãi</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center text-gray-500">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2 text-indigo-500" />
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center text-gray-400">
                      <PackageX className="w-10 h-10 mx-auto mb-2" />
                      Không tìm thấy sản phẩm nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      {/* Image */}
                      <TableCell>
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden border">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Name */}
                      <TableCell>
                        <p className="font-medium line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400">ID: {product.id}</p>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Badge variant="outline">{product.categoryName || '—'}</Badge>
                      </TableCell>

                      {/* Brand */}
                      <TableCell className="text-sm">{product.brandName || '—'}</TableCell>

                      {/* Price */}
                      <TableCell className="text-right font-medium text-indigo-700">
                        {formatPrice(product.minPrice)}
                      </TableCell>

                      {/* Promotion */}
                      <TableCell className="text-center">
                        {product.promotion?.discountPercent ? (
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            -{product.promotion.discountPercent}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Actions */}
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
                              disabled={deleting === product.id}
                            >
                              {deleting === product.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                              )}
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
      </div>

      {/* Edit Dialog — PUT /api/v1/products/{id} */}
      <Dialog open={!!editingProduct} onOpenChange={(open: boolean) => { if (!open) { setEditingProduct(null); setFormData({ ...emptyForm }); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
            <DialogDescription>PUT /api/v1/products/{editingProduct?.id}</DialogDescription>
          </DialogHeader>
          <ProductForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingProduct(null); setFormData({ ...emptyForm }); }}>Hủy</Button>
            <Button onClick={handleUpdateProduct} className="bg-indigo-600 hover:bg-indigo-700" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}