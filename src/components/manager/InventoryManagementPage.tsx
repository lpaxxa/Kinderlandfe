import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import {
    Warehouse, ArrowLeft, LogOut, RefreshCw,
    AlertCircle, Search, Package, SlidersHorizontal,
    CheckCircle, Loader2,
} from 'lucide-react';
import { inventoryApi, InventoryItem } from '../../services/inventoryApi';
import { useStoreId } from '../../hooks/useStoreId';


// --- Skeleton Row ---
function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                </td>
            ))}
        </tr>
    );
}

export default function InventoryManagementPage() {
    const navigate = useNavigate();
    const { adminUser, logoutAdmin } = useAdmin();

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [search, setSearch] = useState('');

    // StoreId — read from localStorage, let manager override if missing
    const { storeId, setStoreId } = useStoreId();
    const [storeIdInput, setStoreIdInput] = useState(storeId ?? '');

    // Adjust dialog
    const [showAdjust, setShowAdjust] = useState(false);
    const [adjStoreId, setAdjStoreId] = useState('');
    const [adjSkuId, setAdjSkuId] = useState('');
    const [adjQty, setAdjQty] = useState('');
    const [adjusting, setAdjusting] = useState(false);
    const [adjError, setAdjError] = useState<string | null>(null);
    const [adjSuccess, setAdjSuccess] = useState(false);

    const handleLogout = () => {
        logoutAdmin();
        navigate('/admin/login');
    };

    const fetchInventory = async (sid?: string) => {
        const effectiveId = sid ?? storeId ?? '';
        setLoading(true);
        setError(null);
        try {
            const data = await inventoryApi.getAllInventory(effectiveId || undefined);
            setItems(data);
            setLastUpdated(new Date());
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu tồn kho.');
        } finally {
            setLoading(false);
        }
    };

    const applyStoreId = () => {
        const trimmed = storeIdInput.trim();
        if (!trimmed) return;
        setStoreId(trimmed);
        fetchInventory(trimmed);
    };

    const handleAdjust = async () => {
        const sid = parseInt(adjStoreId, 10);
        const kid = parseInt(adjSkuId, 10);
        const qty = parseInt(adjQty, 10);
        if (isNaN(sid) || sid <= 0 || isNaN(kid) || kid <= 0 || isNaN(qty)) {
            setAdjError('Vui lòng nhập đầy đủ Store ID, SKU ID và số lượng hợp lệ.');
            return;
        }
        setAdjusting(true);
        setAdjError(null);
        setAdjSuccess(false);
        try {
            await inventoryApi.adjustInventory(sid, kid, qty);
            setAdjSuccess(true);
            fetchInventory();
            setTimeout(() => {
                setShowAdjust(false);
                setAdjSuccess(false);
                setAdjStoreId('');
                setAdjSkuId('');
                setAdjQty('');
            }, 1400);
        } catch (err: unknown) {
            setAdjError(err instanceof Error ? err.message : 'Điều chỉnh thất bại.');
        } finally {
            setAdjusting(false);
        }
    };

    // Dispose state
    const [showDispose, setShowDispose] = useState(false);
    const [dispStoreId, setDispStoreId] = useState('');
    const [dispSkuId, setDispSkuId] = useState('');
    const [dispQty, setDispQty] = useState('');
    const [disposing, setDisposing] = useState(false);
    const [dispError, setDispError] = useState<string | null>(null);
    const [dispSuccess, setDispSuccess] = useState(false);

    const handleDispose = async () => {
        const sid = parseInt(dispStoreId, 10);
        const kid = parseInt(dispSkuId, 10);
        const qty = parseInt(dispQty, 10);
        if (isNaN(sid) || sid <= 0 || isNaN(kid) || kid <= 0 || isNaN(qty) || qty <= 0) {
            setDispError('Vui lòng nhập đầy đủ Store ID, SKU ID và số lượng hợp lệ (> 0).');
            return;
        }
        setDisposing(true);
        setDispError(null);
        setDispSuccess(false);
        try {
            await inventoryApi.disposeInventory(sid, kid, qty);
            setDispSuccess(true);
            fetchInventory();
            setTimeout(() => {
                setShowDispose(false);
                setDispSuccess(false);
                setDispStoreId('');
                setDispSkuId('');
                setDispQty('');
            }, 1400);
        } catch (err: unknown) {
            setDispError(err instanceof Error ? err.message : 'Thanh lý thất bại.');
        } finally {
            setDisposing(false);
        }
    };

    // Only auto-fetch when storeId is known
    useEffect(() => { if (storeId) fetchInventory(); }, [storeId]);

    // Dynamic columns matching real BE response
    const knownColumns: { key: keyof InventoryItem; label: string }[] = [
        { key: 'id', label: 'ID' },
        { key: 'storeName', label: 'Cửa hàng' },
        { key: 'skuId', label: 'SKU ID' },
        { key: 'skuCode', label: 'SKU Code' },
        { key: 'quantity', label: 'Số lượng' },
    ];

    // Filter by storeName or skuCode
    const filtered = items.filter((item) => {
        const q = search.toLowerCase();
        return (
            item.storeName.toLowerCase().includes(q) ||
            item.skuCode.toLowerCase().includes(q) ||
            String(item.skuId).includes(q)
        );
    });

    // Stats based on quantity thresholds
    const outOfStock = items.filter((i) => i.quantity === 0).length;
    const lowStock = items.filter((i) => i.quantity > 0 && i.quantity <= 5).length;

    return (
        <div className="min-h-full bg-white">

            {/* Header */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#AF140B] rounded-lg flex items-center justify-center">
                                <Warehouse className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#2C2C2C]">Quản Lý Tồn Kho</h1>
                                <p className="text-sm text-gray-600">
                                    {adminUser?.name} · {adminUser?.storeName || 'Tất cả chi nhánh'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={() => { setShowAdjust(true); setAdjError(null); setAdjSuccess(false); }}
                                className="bg-[#AF140B] hover:bg-[#8D0F08] text-white">
                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                Điều chỉnh
                            </Button>
                            <Button onClick={() => { setShowDispose(true); setDispError(null); setDispSuccess(false); }}
                                className="bg-orange-600 hover:bg-orange-700 text-white">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Thanh lý hàng lỗi
                            </Button>
                            <Button variant="outline" onClick={fetchInventory} disabled={loading} className="border-gray-300">
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Làm mới
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/manager/dashboard')} className="border-gray-300">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                            <Button variant="outline" onClick={handleLogout}
                                className="border-[#AF140B] text-[#AF140B] hover:bg-[#AF140B] hover:text-white">
                                <LogOut className="w-4 h-4 mr-2" />
                                Đăng xuất
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* StoreId Banner — shown when storeId not in localStorage */}
                {!storeId && (
                    <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <p className="text-sm text-yellow-800 font-medium flex-1">
                            Chưa xác định Store ID. Nhập Store ID của cửa hàng bạn quản lý:
                        </p>
                        <Input
                            type="number" min={1} placeholder="VD: 1"
                            value={storeIdInput}
                            onChange={(e) => setStoreIdInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyStoreId()}
                            className="w-28 h-8 text-sm" />
                        <Button size="sm" onClick={applyStoreId} disabled={!storeIdInput}
                            className="h-8 bg-yellow-600 hover:bg-yellow-700 text-white">
                            Xác nhận
                        </Button>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Tổng bản ghi', value: items.length, color: 'text-[#AF140B]', border: 'border-red-200' },
                        { label: 'Hết hàng', value: outOfStock, color: 'text-red-600', border: 'border-red-300' },
                        { label: 'Sắp hết', value: lowStock, color: 'text-yellow-600', border: 'border-yellow-200' },
                    ].map((s, i) => (
                        <Card key={i} className={`bg-white border ${s.border} shadow-sm`}>
                            <CardContent className="p-4">
                                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                                <p className={`text-2xl font-bold ${s.color}`}>
                                    {loading ? '…' : s.value}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Không thể tải dữ liệu</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Table Card */}
                <Card className="border border-gray-200 shadow-sm bg-white">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <CardTitle className="text-lg text-[#2C2C2C]">
                                    Danh sách tồn kho
                                    {filtered.length > 0 && (
                                        <Badge className="ml-2 bg-[#AF140B] text-white">{filtered.length}</Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {lastUpdated
                                        ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString('vi-VN')}`
                                        : 'Đang tải...'}
                                </CardDescription>
                            </div>
                            {/* Search */}
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm cửa hàng, sản phẩm, SKU..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto rounded-b-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        {knownColumns.map((col) => (
                                            <th key={String(col.key)} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading && (
                                        Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                                    )}

                                    {!loading && filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={knownColumns.length} className="py-16 text-center text-gray-400">
                                                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                {items.length === 0
                                                    ? 'Chưa có dữ liệu tồn kho.'
                                                    : 'Không tìm thấy kết quả.'}
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && filtered.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.id}</td>
                                            <td className="px-4 py-3 font-medium text-[#2C2C2C]">{item.storeName}</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{item.skuId}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="font-mono text-xs">{item.skuCode}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-bold text-base ${item.quantity === 0 ? 'text-red-600' : item.quantity <= 5 ? 'text-yellow-600' : 'text-green-700'}`}>
                                                    {item.quantity}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Adjust Inventory Dialog */}
            <Dialog open={showAdjust} onOpenChange={(open: boolean) => !open && setShowAdjust(false)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
                        <DialogDescription>Nhập thông tin để tăng/giảm số lượng tại cửa hàng</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="adj-store" className="mb-1 block">
                                Store ID <span className="text-[#AF140B]">*</span>
                            </Label>
                            <Input id="adj-store" type="number" min={1} placeholder="VD: 1"
                                value={adjStoreId} onChange={(e) => setAdjStoreId(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="adj-sku" className="mb-1 block">
                                SKU ID <span className="text-[#AF140B]">*</span>
                            </Label>
                            <Input id="adj-sku" type="number" min={1} placeholder="VD: 1"
                                value={adjSkuId} onChange={(e) => setAdjSkuId(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="adj-qty" className="mb-1 block">
                                Số lượng <span className="text-[#AF140B]">*</span>
                                <span className="ml-2 text-xs text-gray-400 font-normal">(số âm để giảm)</span>
                            </Label>
                            <Input id="adj-qty" type="number" placeholder="VD: 10 hoặc -5"
                                value={adjQty} onChange={(e) => setAdjQty(e.target.value)} />
                        </div>
                        {adjError && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />{adjError}
                            </div>
                        )}
                        {adjSuccess && (
                            <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />Điều chỉnh thành công!
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAdjust(false)} disabled={adjusting}>Hủy</Button>
                        <Button onClick={handleAdjust} disabled={adjusting || adjSuccess}
                            className="bg-[#AF140B] hover:bg-[#8D0F08]">
                            {adjusting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {adjSuccess ? 'Đã lưu ✓' : 'Xác nhận'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dispose Dialog */}
            <Dialog open={showDispose} onOpenChange={(open: boolean) => !open && setShowDispose(false)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-orange-700">Thanh lý hàng lỗi</DialogTitle>
                        <DialogDescription>
                            Ghi nhận số lượng hàng lỗi cần thanh lý tại cửa hàng
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="disp-store" className="mb-1 block">
                                Store ID <span className="text-[#AF140B]">*</span>
                            </Label>
                            <Input id="disp-store" type="number" min={1} placeholder="VD: 1"
                                value={dispStoreId} onChange={(e) => setDispStoreId(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="disp-sku" className="mb-1 block">
                                SKU ID <span className="text-[#AF140B]">*</span>
                            </Label>
                            <Input id="disp-sku" type="number" min={1} placeholder="VD: 1"
                                value={dispSkuId} onChange={(e) => setDispSkuId(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="disp-qty" className="mb-1 block">
                                Số lượng thanh lý <span className="text-[#AF140B]">*</span>
                            </Label>
                            <Input id="disp-qty" type="number" min={1} placeholder="VD: 2"
                                value={dispQty} onChange={(e) => setDispQty(e.target.value)} />
                        </div>
                        {dispError && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />{dispError}
                            </div>
                        )}
                        {dispSuccess && (
                            <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />Thanh lý thành công!
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDispose(false)} disabled={disposing}>Hủy</Button>
                        <Button onClick={handleDispose} disabled={disposing || dispSuccess}
                            className="bg-orange-600 hover:bg-orange-700">
                            {disposing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {dispSuccess ? 'Đã thanh lý ✓' : 'Xác nhận thanh lý'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
