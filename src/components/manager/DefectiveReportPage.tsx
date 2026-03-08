import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
    AlertTriangle, ArrowLeft, LogOut, RefreshCw,
    AlertCircle, CheckCircle, Loader2, Package,
    Trash2, Plus, FileText, Calendar,
} from 'lucide-react';
import { inventoryApi, InventoryItem } from '../../services/inventoryApi';
import { useStoreId } from '../../hooks/useStoreId';

type ReasonType = 'broken' | 'cancelled' | 'expired' | 'lost' | 'other';

interface DisposeEntry {
    id: string;
    item: InventoryItem;
    quantity: string;
    reason: ReasonType;
    note: string;
    submitting: boolean;
    submitted: boolean;
    error: string | null;
    submittedAt?: Date;
}

const REASONS: { value: ReasonType; label: string; icon: string }[] = [
    { value: 'broken', label: 'Hàng vỡ / hỏng', icon: '💥' },
    { value: 'cancelled', label: 'Đơn hủy trả về', icon: '🔄' },
    { value: 'expired', label: 'Hết hạn sử dụng', icon: '⏰' },
    { value: 'lost', label: 'Mất / thất lạc', icon: '❓' },
    { value: 'other', label: 'Lý do khác', icon: '📋' },
];

export default function DefectiveReportPage() {
    const navigate = useNavigate();
    const { adminUser, logoutAdmin } = useAdmin();

    // Inventory list
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loadingInv, setLoadingInv] = useState(false);
    const [invError, setInvError] = useState<string | null>(null);

    // StoreId
    const { storeId, setStoreId } = useStoreId();
    const [storeIdInput, setStoreIdInput] = useState(storeId ?? '');

    // Search
    const [search, setSearch] = useState('');

    // Report entries
    const [entries, setEntries] = useState<DisposeEntry[]>([]);

    const handleLogout = () => { logoutAdmin(); navigate('/admin/login'); };

    const fetchInventory = async (sid?: string) => {
        const effectiveId = sid ?? storeId ?? '';
        setLoadingInv(true);
        setInvError(null);
        try {
            const data = await inventoryApi.getAllInventory(effectiveId || undefined);
            setInventory(data);
        } catch (err: unknown) {
            setInvError(err instanceof Error ? err.message : 'Không thể tải dữ liệu.');
        } finally {
            setLoadingInv(false);
        }
    };

    const applyStoreId = () => {
        const trimmed = storeIdInput.trim();
        if (!trimmed) return;
        setStoreId(trimmed);
        fetchInventory(trimmed);
    };

    useEffect(() => { if (storeId) fetchInventory(); }, [storeId]);

    const filtered = inventory.filter((item) => {
        const q = search.toLowerCase();
        return item.storeName.toLowerCase().includes(q) ||
            item.skuCode.toLowerCase().includes(q) ||
            String(item.skuId).includes(q);
    });

    const addEntry = (item: InventoryItem) => {
        // Avoid duplicate pending entries for same item
        const exists = entries.some(e => e.item.id === item.id && !e.submitted);
        if (exists) return;
        const entry: DisposeEntry = {
            id: `${Date.now()}-${item.id}`,
            item,
            quantity: '1',
            reason: 'broken',
            note: '',
            submitting: false,
            submitted: false,
            error: null,
        };
        setEntries(prev => [entry, ...prev]);
    };

    const updateEntry = <K extends keyof DisposeEntry>(id: string, key: K, val: DisposeEntry[K]) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, [key]: val, error: null } : e));
    };

    const removeEntry = (id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id));
    };

    const submitEntry = async (entry: DisposeEntry) => {
        const qty = parseInt(entry.quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            setEntries(prev => prev.map(e => e.id === entry.id
                ? { ...e, error: 'Số lượng phải > 0.' } : e));
            return;
        }
        if (qty > entry.item.quantity) {
            setEntries(prev => prev.map(e => e.id === entry.id
                ? { ...e, error: `Không thể thanh lý nhiều hơn tồn kho (${entry.item.quantity}).` } : e));
            return;
        }
        setEntries(prev => prev.map(e => e.id === entry.id
            ? { ...e, submitting: true, error: null } : e));
        try {
            await inventoryApi.disposeInventory(entry.item.storeId, entry.item.skuId, qty);
            setEntries(prev => prev.map(e => e.id === entry.id
                ? { ...e, submitting: false, submitted: true, submittedAt: new Date() } : e));
        } catch (err: unknown) {
            setEntries(prev => prev.map(e => e.id === entry.id
                ? { ...e, submitting: false, error: err instanceof Error ? err.message : 'Thanh lý thất bại.' } : e));
        }
    };

    const submitAll = async () => {
        const pending = entries.filter(e => !e.submitted && !e.submitting);
        for (const e of pending) await submitEntry(e);
    };

    const pendingCount = entries.filter(e => !e.submitted).length;
    const doneCount = entries.filter(e => e.submitted).length;

    return (
        <div className="min-h-full bg-white">

            {/* Header */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#2C2C2C]">Báo Cáo Hàng Lỗi</h1>
                                <p className="text-sm text-gray-600">{adminUser?.name} · {adminUser?.storeName || 'Quản lý kho'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {pendingCount > 0 && (
                                <Button onClick={submitAll} className="bg-orange-600 hover:bg-orange-700">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Gửi tất cả ({pendingCount})
                                </Button>
                            )}
                            <Button variant="outline" onClick={fetchInventory} disabled={loadingInv} className="border-gray-300">
                                <RefreshCw className={`w-4 h-4 mr-2 ${loadingInv ? 'animate-spin' : ''}`} />
                                Tải lại
                            </Button>
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Mục chờ gửi', value: pendingCount, color: 'text-orange-600', border: 'border-orange-200' },
                        { label: 'Đã thanh lý', value: doneCount, color: 'text-green-700', border: 'border-green-200' },
                        { label: 'Tổng SKU kho', value: inventory.length, color: 'text-blue-700', border: 'border-blue-200' },
                    ].map((s, i) => (
                        <Card key={i} className={`bg-white border ${s.border} shadow-sm`}>
                            <CardContent className="p-4">
                                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">

                    {/* Left: inventory picker */}
                    <Card className="border border-gray-200 shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle className="text-base text-[#2C2C2C]">Chọn sản phẩm cần thanh lý</CardTitle>
                            <CardDescription>Tìm và nhấn <strong>+ Thêm</strong> để đưa vào báo cáo</CardDescription>
                            {!storeId && (
                                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 rounded-lg p-2 mt-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                    <Input type="number" min={1} placeholder="Nhập Store ID…"
                                        value={storeIdInput}
                                        onChange={(e) => setStoreIdInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && applyStoreId()}
                                        className="h-7 text-xs flex-1" />
                                    <Button size="sm" onClick={applyStoreId} disabled={!storeIdInput}
                                        className="h-7 text-xs bg-yellow-600 hover:bg-yellow-700 text-white">
                                        OK
                                    </Button>
                                </div>
                            )}
                            <div className="relative mt-1">
                                <Input placeholder="Tìm theo cửa hàng, SKU Code, SKU ID…"
                                    value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {invError && (
                                <div className="flex items-center gap-2 text-red-600 text-sm px-4 py-3">
                                    <AlertCircle className="w-4 h-4" />{invError}
                                </div>
                            )}
                            <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
                                {loadingInv && Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="px-4 py-3 flex gap-3 animate-pulse">
                                        <div className="flex-1">
                                            <div className="h-3 bg-gray-200 rounded w-3/5 mb-1.5" />
                                            <div className="h-3 bg-gray-100 rounded w-2/5" />
                                        </div>
                                        <div className="h-8 w-16 bg-gray-100 rounded" />
                                    </div>
                                ))}
                                {!loadingInv && filtered.length === 0 && (
                                    <div className="py-10 text-center text-gray-400 text-sm">
                                        <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        Không tìm thấy sản phẩm.
                                    </div>
                                )}
                                {!loadingInv && filtered.map((item) => {
                                    const alreadyAdded = entries.some(e => e.item.id === item.id && !e.submitted);
                                    return (
                                        <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-[#2C2C2C] truncate">{item.storeName}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="outline" className="font-mono text-xs">{item.skuCode}</Badge>
                                                    <span className={`text-xs font-semibold ${item.quantity === 0 ? 'text-red-600' : item.quantity <= 5 ? 'text-yellow-600' : 'text-green-700'}`}>
                                                        Tồn: {item.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline"
                                                onClick={() => addEntry(item)}
                                                disabled={alreadyAdded || item.quantity === 0}
                                                className="h-8 border-orange-300 text-orange-700 hover:bg-orange-50 shrink-0">
                                                <Plus className="w-3 h-3 mr-1" />
                                                {alreadyAdded ? 'Đã thêm' : 'Thêm'}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: report entries */}
                    <div className="space-y-4">
                        <h2 className="font-bold text-[#2C2C2C] flex items-center gap-2">
                            <FileText className="w-5 h-5 text-orange-600" />
                            Danh sách báo cáo
                            {entries.length > 0 && <Badge className="bg-orange-600 text-white">{entries.length}</Badge>}
                        </h2>

                        {entries.length === 0 && (
                            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-14 text-center text-gray-400">
                                <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Chưa có mục nào. Chọn sản phẩm bên trái để thêm.</p>
                            </div>
                        )}

                        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                            {entries.map((entry) => (
                                <Card key={entry.id}
                                    className={`border shadow-sm ${entry.submitted ? 'border-green-300 bg-green-50' : entry.error ? 'border-red-300' : 'border-orange-200'}`}>
                                    <CardContent className="p-4 space-y-3">
                                        {/* Item info */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-sm text-[#2C2C2C]">{entry.item.storeName}</p>
                                                <div className="flex gap-2 mt-0.5">
                                                    <Badge variant="outline" className="font-mono text-xs">{entry.item.skuCode}</Badge>
                                                    <span className="text-xs text-gray-500">Tồn kho: {entry.item.quantity}</span>
                                                </div>
                                            </div>
                                            {entry.submitted ? (
                                                <div className="flex items-center gap-1 text-green-700 text-xs">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Đã thanh lý
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="ghost"
                                                    onClick={() => removeEntry(entry.id)}
                                                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        {!entry.submitted && (
                                            <>
                                                {/* Quantity + Reason */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs mb-1 block">
                                                            Số lượng thanh lý <span className="text-[#AF140B]">*</span>
                                                        </Label>
                                                        <Input type="number" min={1} max={entry.item.quantity}
                                                            value={entry.quantity}
                                                            onChange={(e) => updateEntry(entry.id, 'quantity', e.target.value)}
                                                            className="h-8 text-sm"
                                                            disabled={entry.submitting} />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs mb-1 block">Lý do</Label>
                                                        <select
                                                            value={entry.reason}
                                                            onChange={(e) => updateEntry(entry.id, 'reason', e.target.value as ReasonType)}
                                                            disabled={entry.submitting}
                                                            className="w-full h-8 rounded-md border border-gray-300 text-sm px-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300">
                                                            {REASONS.map(r => (
                                                                <option key={r.value} value={r.value}>
                                                                    {r.icon} {r.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Note */}
                                                <div>
                                                    <Label className="text-xs mb-1 block">Ghi chú</Label>
                                                    <Input placeholder="Mô tả chi tiết tình trạng hàng…"
                                                        value={entry.note}
                                                        onChange={(e) => updateEntry(entry.id, 'note', e.target.value)}
                                                        className="h-8 text-sm"
                                                        disabled={entry.submitting} />
                                                </div>

                                                {/* Error */}
                                                {entry.error && (
                                                    <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 rounded-lg p-2">
                                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                        {entry.error}
                                                    </div>
                                                )}

                                                <Button size="sm" onClick={() => submitEntry(entry)}
                                                    disabled={entry.submitting}
                                                    className="w-full bg-orange-600 hover:bg-orange-700 h-8">
                                                    {entry.submitting
                                                        ? <><Loader2 className="w-3 h-3 mr-2 animate-spin" />Đang gửi...</>
                                                        : <><Trash2 className="w-3 h-3 mr-2" />Xác nhận thanh lý</>}
                                                </Button>
                                            </>
                                        )}

                                        {/* Submitted summary */}
                                        {entry.submitted && (
                                            <div className="text-xs text-green-700 flex items-center gap-3">
                                                <span>Số lượng: <strong>{entry.quantity}</strong></span>
                                                <span>·</span>
                                                <span>Lý do: <strong>{REASONS.find(r => r.value === entry.reason)?.label}</strong></span>
                                                {entry.submittedAt && (
                                                    <>
                                                        <span>·</span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {entry.submittedAt.toLocaleTimeString('vi-VN')}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
