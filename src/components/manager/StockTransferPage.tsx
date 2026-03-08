import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
    Truck, ArrowLeft, LogOut, Search, Loader2,
    AlertCircle, ArrowRight, CheckCircle, Package,
    MapPin, Phone, Clock, RefreshCw,
} from 'lucide-react';
import { inventoryApi, StoreAvailability } from '../../services/inventoryApi';

// --- Availability Badge ---
function AvailBadge({ status }: { status: string }) {
    const s = status.toLowerCase();
    if (s.includes('hết')) return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Hết hàng</Badge>;
    if (s.includes('ít') || s.includes('thấp') || s.includes('sắp'))
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">{status}</Badge>;
    return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">{status}</Badge>;
}

// Is this store a valid source (has stock)?
function hasStock(status: string) {
    const s = status.toLowerCase();
    return !s.includes('hết');
}

export default function StockTransferPage() {
    const navigate = useNavigate();
    const { adminUser, logoutAdmin } = useAdmin();

    // Step 1 — SKU search
    const [skuInput, setSkuInput] = useState('');
    const [skuId, setSkuId] = useState<number | null>(null);
    const [stores, setStores] = useState<StoreAvailability[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Step 2 — selection
    const [sourceId, setSourceId] = useState<number | null>(null);
    const [destId, setDestId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState('');

    // Step 3 — submit
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleLogout = () => { logoutAdmin(); navigate('/admin/login'); };

    const handleSearch = async () => {
        const id = parseInt(skuInput.trim(), 10);
        if (isNaN(id) || id <= 0) { setFetchError('Vui lòng nhập SKU ID hợp lệ.'); return; }
        setLoading(true);
        setFetchError(null);
        setStores([]);
        setSourceId(null);
        setDestId(null);
        setQuantity('');
        setSubmitSuccess(false);
        setSubmitError(null);
        try {
            const res = await inventoryApi.getStoreAvailability(id);
            setSkuId(id);
            setStores(res.data);
        } catch (err: unknown) {
            setFetchError(err instanceof Error ? err.message : 'Không thể tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    };

    const validQty = () => {
        const n = parseInt(quantity, 10);
        return !isNaN(n) && n > 0;
    };

    const canSubmit = sourceId !== null && destId !== null && sourceId !== destId && validQty();

    const handleSubmit = async () => {
        if (!canSubmit) { setSubmitError('Vui lòng chọn kho nguồn, kho đích khác nhau và số lượng hợp lệ.'); return; }
        setSubmitting(true);
        setSubmitError(null);
        try {
            await inventoryApi.transferInventory(sourceId!, destId!, skuId!, parseInt(quantity, 10));
            setSubmitSuccess(true);
        } catch (err: unknown) {
            setSubmitError(err instanceof Error ? err.message : 'Tạo yêu cầu thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setSubmitSuccess(false);
        setSkuInput('');
        setSkuId(null);
        setStores([]);
        setSourceId(null);
        setDestId(null);
        setQuantity('');
        setSubmitError(null);
    };

    const sourceStore = stores.find((s) => s.storeId === sourceId);
    const destStore = stores.find((s) => s.storeId === destId);
    const sourceStores = stores.filter((s) => hasStock(s.availabilityStatus));
    const destStores = stores.filter((s) => !hasStock(s.availabilityStatus));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

            {/* Header */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Truck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#2C2C2C]">Yêu Cầu Chuyển Kho</h1>
                                <p className="text-sm text-gray-600">{adminUser?.name} · {adminUser?.storeName || 'Quản lý kho'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => navigate('/manager/dashboard')} className="border-gray-300">
                                <ArrowLeft className="w-4 h-4 mr-2" />Quay lại
                            </Button>
                            <Button variant="outline" onClick={handleLogout}
                                className="border-[#AF140B] text-[#AF140B] hover:bg-[#AF140B] hover:text-white">
                                <LogOut className="w-4 h-4 mr-2" />Đăng xuất
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Success */}
                {submitSuccess && (
                    <Card className="border-green-300 bg-green-50 shadow-md">
                        <CardContent className="p-6 flex items-start gap-4">
                            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-green-800 mb-2">Yêu cầu chuyển kho đã được tạo!</h3>
                                <div className="flex items-center gap-3 text-sm text-green-700 mb-1">
                                    <span className="font-medium">{sourceStore?.storeName}</span>
                                    <ArrowRight className="w-4 h-4" />
                                    <span className="font-medium">{destStore?.storeName}</span>
                                </div>
                                <p className="text-sm text-green-700">
                                    SKU <strong>#{skuId}</strong> · Số lượng: <strong>{quantity}</strong>
                                </p>
                                <Button onClick={handleReset} className="mt-4 bg-green-600 hover:bg-green-700">
                                    <RefreshCw className="w-4 h-4 mr-2" />Tạo yêu cầu mới
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!submitSuccess && (
                    <>
                        {/* Step 1 — SKU Search */}
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg text-[#2C2C2C] flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                                    Kiểm tra tồn kho theo SKU
                                </CardTitle>
                                <CardDescription>Nhập SKU ID để xem hàng tồn tại các chi nhánh</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3 items-end">
                                    <div className="max-w-xs flex-1">
                                        <Label htmlFor="sku" className="mb-1 block">SKU ID</Label>
                                        <Input id="sku" type="number" min={1} placeholder="VD: 1"
                                            value={skuInput}
                                            onChange={(e) => { setSkuInput(e.target.value); setFetchError(null); }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                                    </div>
                                    <Button onClick={handleSearch} disabled={loading || !skuInput} className="bg-blue-600 hover:bg-blue-700">
                                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                                        Kiểm tra
                                    </Button>
                                </div>
                                {fetchError && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm mt-3">
                                        <AlertCircle className="w-4 h-4" />{fetchError}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 2 — Choose source & dest */}
                        {stores.length > 0 && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Source — stores with stock */}
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base text-[#2C2C2C] flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2a</span>
                                            Kho nguồn <span className="text-xs text-gray-400 font-normal">(có hàng)</span>
                                        </CardTitle>
                                        <CardDescription>Chọn chi nhánh sẽ chuyển hàng đi</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {sourceStores.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                Tất cả chi nhánh đều hết hàng
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                                                {sourceStores.map((store) => (
                                                    <button key={store.storeId} type="button"
                                                        onClick={() => { setSourceId(store.storeId); if (destId === store.storeId) setDestId(null); }}
                                                        className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${sourceId === store.storeId ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm text-[#2C2C2C]">{store.storeName}</p>
                                                            <div className="flex flex-col gap-0.5 mt-0.5">
                                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                                    <MapPin className="w-3 h-3" />{store.address}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                                    <Clock className="w-3 h-3" />{store.openingTime}–{store.closingTime}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <AvailBadge status={store.availabilityStatus} />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Destination — out of stock stores */}
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base text-[#2C2C2C] flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">2b</span>
                                            Kho đích <span className="text-xs text-gray-400 font-normal">(cần hàng)</span>
                                        </CardTitle>
                                        <CardDescription>Chọn chi nhánh sẽ nhận hàng</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {destStores.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                Tất cả chi nhánh đều còn hàng
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                                                {destStores.map((store) => (
                                                    <button key={store.storeId} type="button"
                                                        onClick={() => { setDestId(store.storeId); if (sourceId === store.storeId) setSourceId(null); }}
                                                        className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${destId === store.storeId ? 'bg-red-50 border-l-4 border-red-500' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm text-[#2C2C2C]">{store.storeName}</p>
                                                            <div className="flex flex-col gap-0.5 mt-0.5">
                                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                                    <MapPin className="w-3 h-3" />{store.address}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                                    <Phone className="w-3 h-3" />{store.phone}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <AvailBadge status={store.availabilityStatus} />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Step 3 — Quantity & Submit */}
                        {stores.length > 0 && (
                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-lg text-[#2C2C2C] flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                                        Xác nhận yêu cầu chuyển kho
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Transfer visual */}
                                    <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                                        <div className="flex-1 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Kho nguồn</p>
                                            <p className="font-semibold text-sm text-blue-700">
                                                {sourceStore ? sourceStore.storeName : <span className="text-gray-400 italic">Chưa chọn</span>}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <div className="flex-1 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Kho đích</p>
                                            <p className="font-semibold text-sm text-red-700">
                                                {destStore ? destStore.storeName : <span className="text-gray-400 italic">Chưa chọn</span>}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="max-w-xs">
                                        <Label htmlFor="qty" className="mb-1 block">
                                            Số lượng chuyển <span className="text-[#AF140B]">*</span>
                                        </Label>
                                        <Input id="qty" type="number" min={1} placeholder="VD: 10"
                                            value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                                    </div>

                                    {submitError && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />{submitError}
                                        </div>
                                    )}

                                    <Button onClick={handleSubmit} disabled={submitting || !canSubmit}
                                        className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                                        {submitting
                                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang gửi...</>
                                            : <><Truck className="w-4 h-4 mr-2" />Gửi yêu cầu chuyển kho</>}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
