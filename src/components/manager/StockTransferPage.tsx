import { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    Truck, Loader2, AlertCircle, ArrowRight,
    CheckCircle, RefreshCw, Search, Package,
    MapPin, Clock,
} from 'lucide-react';
import { inventoryApi, StoreAvailability, InventoryItem } from '../../services/inventoryApi';
import api from '../../services/api';

export default function StockTransferPage() {
    const { adminUser } = useAdmin();
    const storeId = adminUser?.storeId ?? localStorage.getItem('storeId') ?? '';

    // Step 1 — Pick SKU
    const [skuInput, setSkuInput] = useState('');
    const [searchedSkuId, setSearchedSkuId] = useState<number | null>(null);
    const [storeSkus, setStoreSkus] = useState<InventoryItem[]>([]);
    const [loadingSkus, setLoadingSkus] = useState(true);

    useEffect(() => {
        const fetchStoreSkus = async () => {
            if (!storeId) {
                setLoadingSkus(false);
                return;
            }
            try {
                const skus = await inventoryApi.getAllInventory(storeId);
                setStoreSkus(skus);
                if (skus.length > 0) {
                    setSkuInput(String(skus[0].skuId));
                }
            } catch (err) {
                console.error("Failed to fetch store SKUs", err);
            } finally {
                setLoadingSkus(false);
            }
        };
        fetchStoreSkus();
    }, [storeId]);

    // Step 2 — Stores with that SKU
    const [storeAvailability, setStoreAvailability] = useState<StoreAvailability[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // Step 3 — Form
    const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState('');

    // Submit
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Search for stores that have the SKU
    const handleSearch = async () => {
        const id = parseInt(skuInput.trim(), 10);
        if (isNaN(id) || id <= 0) {
            setSearchError('Vui lòng chọn sản phẩm hợp lệ.');
            return;
        }
        setSearching(true);
        setSearchError(null);
        setStoreAvailability([]);
        setSelectedSourceId(null);
        setQuantity('');
        setSubmitSuccess(false);
        setSubmitError(null);
        try {
            const res = await inventoryApi.getStoreAvailability(id);
            setSearchedSkuId(id);
            // Filter: only stores with stock AND not the manager's own store
            const available = (res.data || []).filter(
                (s) => !s.availabilityStatus.toLowerCase().includes('hết') && String(s.storeId) !== String(storeId)
            );
            setStoreAvailability(available);
            if (available.length === 0) {
                setSearchError('Không có chi nhánh nào còn hàng cho SKU này.');
            }
        } catch (err: unknown) {
            setSearchError(err instanceof Error ? err.message : 'Không thể tải dữ liệu.');
        } finally {
            setSearching(false);
        }
    };

    const selectedStore = storeAvailability.find(s => s.storeId === selectedSourceId);
    const qtyNum = parseInt(quantity, 10);
    const isExceeding = selectedStore?.quantity !== undefined && qtyNum > selectedStore.quantity;
    const canSubmit = selectedSourceId !== null && searchedSkuId !== null && !isNaN(qtyNum) && qtyNum > 0 && !isExceeding;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            // toStoreId = the source store we're requesting FROM
            await api.post('/api/v1/transfer/draft', {
                toStoreId: selectedSourceId,
                skuId: searchedSkuId,
                quantity: qtyNum,
            });
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
        setSearchedSkuId(null);
        setStoreAvailability([]);
        setSelectedSourceId(null);
        setQuantity('');
        setSubmitError(null);
        setSearchError(null);
    };

    return (
        <div className="min-h-full bg-white">
            {/* Header */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#2C2C2C]">Yêu Cầu Chuyển Kho</h1>
                            <p className="text-sm text-gray-600">
                                {adminUser?.storeName || 'Cửa hàng'} · Yêu cầu chi nhánh khác chuyển hàng về
                            </p>
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
                                    <span className="font-medium">{selectedStore?.storeName}</span>
                                    <ArrowRight className="w-4 h-4" />
                                    <span className="font-medium">{adminUser?.storeName}</span>
                                </div>
                                <p className="text-sm text-green-700">
                                    SKU <strong>#{searchedSkuId}</strong> · Số lượng: <strong>{quantity}</strong>
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
                        {/* Step 1 — Search SKU */}
                        <Card className="border border-gray-200 shadow-sm bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg text-[#2C2C2C] flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                                    Chọn sản phẩm cần nhập
                                </CardTitle>
                                <CardDescription>Chọn sản phẩm để tìm chi nhánh có hàng</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3 items-end">
                                    <div className="max-w-xs flex-1">
                                        <Label htmlFor="sku" className="mb-1 block">Sản phẩm</Label>
                                        <Select
                                            value={skuInput}
                                            onValueChange={(val) => { setSkuInput(val); setSearchError(null); }}
                                            disabled={loadingSkus || storeSkus.length === 0}
                                        >
                                            <SelectTrigger id="sku" className="w-full">
                                                <SelectValue placeholder={loadingSkus ? "Đang tải..." : "Chọn sản phẩm"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {storeSkus.map(sku => (
                                                    <SelectItem key={sku.skuId} value={String(sku.skuId)}>
                                                        [{sku.skuCode}] {sku.productName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleSearch} disabled={searching || !skuInput} className="bg-blue-600 hover:bg-blue-700">
                                        {searching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                                        Tìm kiếm
                                    </Button>
                                </div>
                                {searchError && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm mt-3">
                                        <AlertCircle className="w-4 h-4" />{searchError}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 2 — Select source store */}
                        {storeAvailability.length > 0 && (
                            <Card className="border border-gray-200 shadow-sm bg-white">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-[#2C2C2C] flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                                        Chọn chi nhánh gửi hàng
                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs ml-2">
                                            {storeAvailability.length} chi nhánh có hàng
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>Chọn chi nhánh bạn muốn yêu cầu chuyển hàng về</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                                        {storeAvailability.map((store) => (
                                            <button key={store.storeId} type="button"
                                                onClick={() => setSelectedSourceId(store.storeId)}
                                                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${selectedSourceId === store.storeId
                                                    ? 'bg-blue-50 border-l-4 border-blue-600'
                                                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-[#2C2C2C]">{store.storeName}</p>
                                                    <div className="flex flex-col gap-0.5 mt-0.5">
                                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                                            <MapPin className="w-3 h-3" />{store.address}
                                                        </span>
                                                        {store.openingTime && (
                                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                                <Clock className="w-3 h-3" />{store.openingTime}–{store.closingTime}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <AvailBadge status={store.availabilityStatus} />
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3 — Quantity & Submit */}
                        {storeAvailability.length > 0 && (
                            <Card className="border border-gray-200 shadow-sm bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg text-[#2C2C2C] flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                                        Xác nhận yêu cầu
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Transfer preview */}
                                    <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <div className="flex-1 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Chi nhánh gửi</p>
                                            <p className="font-semibold text-sm text-blue-700">
                                                {selectedStore ? selectedStore.storeName : <span className="text-gray-400 italic">Chưa chọn</span>}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                        <div className="flex-1 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Cửa hàng của bạn</p>
                                            <p className="font-semibold text-sm text-green-700">
                                                {adminUser?.storeName || `Store #${storeId}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="max-w-xs">
                                        <Label htmlFor="qty" className="mb-1 block">
                                            Số lượng cần <span className="text-[#AF140B]">*</span>
                                            {selectedStore?.quantity !== undefined && (
                                                <span className="text-gray-500 font-normal text-xs ml-2">
                                                    (Tối đa: {selectedStore.quantity})
                                                </span>
                                            )}
                                        </Label>
                                        <Input id="qty" type="number" min={1} max={selectedStore?.quantity} placeholder="VD: 5"
                                            value={quantity} onChange={(e) => {
                                                let val = e.target.value;
                                                if (selectedStore?.quantity !== undefined && parseInt(val, 10) > selectedStore.quantity) {
                                                    val = String(selectedStore.quantity);
                                                }
                                                setQuantity(val);
                                            }} />
                                        {isExceeding && (
                                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                Vượt quá số lượng chi nhánh có
                                            </p>
                                        )}
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

// --- Availability Badge ---
function AvailBadge({ status }: { status: string }) {
    const s = status.toLowerCase();
    if (s.includes('ít') || s.includes('thấp') || s.includes('sắp'))
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">{status}</Badge>;
    return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">{status}</Badge>;
}
