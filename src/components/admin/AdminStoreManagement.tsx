import React, { useState, useEffect, useCallback } from 'react';
import {
  Store, Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight,
  MapPin, Phone, Clock, User, X, Loader2, AlertCircle, CheckCircle,
  RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { storeApi, StoreItem, StorePayload } from '../../services/storeApi';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
type SortField = 'name' | 'code' | 'address' | 'active' | 'createdAt';
type SortDir = 'asc' | 'desc';

interface FormState {
  name: string;
  code: string;
  address: string;
  phone: string;
  managerName: string;
  latitude: string;
  longitude: string;
  openingTime: string;
  closingTime: string;
  active: boolean;
}

const initialForm: FormState = {
  name: '',
  code: '',
  address: '',
  phone: '',
  managerName: '',
  latitude: '',
  longitude: '',
  openingTime: '08:00',
  closingTime: '22:00',
  active: true,
};

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function toPayload(f: FormState): StorePayload {
  return {
    name: f.name.trim(),
    code: f.code.trim().toUpperCase(),
    address: f.address.trim(),
    phone: f.phone.trim(),
    managerName: f.managerName.trim(),
    latitude: parseFloat(f.latitude) || 0,
    longitude: parseFloat(f.longitude) || 0,
    openingTime: f.openingTime,
    closingTime: f.closingTime,
    active: f.active,
  };
}

function storeToForm(s: StoreItem): FormState {
  return {
    name: s.name,
    code: s.code,
    address: s.address,
    phone: s.phone,
    managerName: s.managerName,
    latitude: String(s.latitude),
    longitude: String(s.longitude),
    openingTime: s.openingTime,
    closingTime: s.closingTime,
    active: s.active,
  };
}

// ----------------------------------------------------------------
// Modal Component
// ----------------------------------------------------------------
interface StoreModalProps {
  isOpen: boolean;
  editingStore: StoreItem | null;
  onClose: () => void;
  onSuccess: (store: StoreItem) => void;
}

function StoreModal({ isOpen, editingStore, onClose, onSuccess }: StoreModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(editingStore ? storeToForm(editingStore) : initialForm);
      setError('');
    }
  }, [isOpen, editingStore]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validate = (): string => {
    if (!form.name.trim()) return 'Tên cửa hàng không được để trống';
    if (!form.code.trim()) return 'Mã cửa hàng không được để trống';
    if (!form.address.trim()) return 'Địa chỉ không được để trống';
    if (!form.phone.trim()) return 'Số điện thoại không được để trống';
    if (!form.managerName.trim()) return 'Tên quản lý không được để trống';
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) return 'Vĩ độ (latitude) không hợp lệ (-90 đến 90)';
    if (isNaN(lng) || lng < -180 || lng > 180) return 'Kinh độ (longitude) không hợp lệ (-180 đến 180)';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    try {
      const payload = toPayload(form);
      let result: StoreItem;
      if (editingStore) {
        result = await storeApi.updateStore(editingStore.id, payload);
      } else {
        result = await storeApi.createStore(payload);
      }
      onSuccess(result);
      onClose();
    } catch (err: any) {
      let msg = 'Đã xảy ra lỗi. Vui lòng thử lại.';
      try {
        const parsed = JSON.parse(err.message);
        msg = parsed.message || msg;
      } catch { msg = err.message || msg; }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-[#AF140B]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {editingStore ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Tên & Mã */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tên cửa hàng <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="VD: Kinderland Q1"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AF140B]/30 focus:border-[#AF140B] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mã cửa hàng <span className="text-red-500">*</span>
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="VD: KL-Q1"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AF140B]/30 focus:border-[#AF140B] transition-all uppercase"
              />
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <MapPin className="w-3.5 h-3.5 inline text-gray-400 mr-1" />
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="VD: 123 Nguyễn Huệ, Q1, TP.HCM"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AF140B]/30 focus:border-[#AF140B] transition-all"
            />
          </div>

          {/* SĐT & Quản lý */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Phone className="w-3.5 h-3.5 inline text-gray-400 mr-1" />
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="VD: 028 3822 1234"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AF140B]/30 focus:border-[#AF140B] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <User className="w-3.5 h-3.5 inline text-gray-400 mr-1" />
                Tên quản lý <span className="text-red-500">*</span>
              </label>
              <input
                name="managerName"
                value={form.managerName}
                onChange={handleChange}
                placeholder="VD: Nguyễn Văn A"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AF140B]/30 focus:border-[#AF140B] transition-all"
              />
            </div>
          </div>

          {/* Lat & Lng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Vĩ độ (Latitude)
              </label>
              <input
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={handleChange}
                placeholder="VD: 10.7769"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AF140B]/30 focus:border-[#AF140B] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Kinh độ (Longitude)
              </label>
              <input
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={handleChange}
                placeholder="VD: 106.7009"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AF140B]/30 focus:border-[#AF140B] transition-all"
              />
            </div>
          </div>

          {/* Giờ mở/đóng cửa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Clock className="w-3.5 h-3.5 inline text-gray-400 mr-1" />
                Giờ mở cửa
              </label>
              <input
                name="openingTime"
                type="time"
                value={form.openingTime}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AF140B]/30 focus:border-[#AF140B] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Clock className="w-3.5 h-3.5 inline text-gray-400 mr-1" />
                Giờ đóng cửa
              </label>
              <input
                name="closingTime"
                type="time"
                value={form.closingTime}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#AF140B]/30 focus:border-[#AF140B] transition-all"
              />
            </div>
          </div>

          {/* Trạng thái */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-700">Trạng thái hoạt động</p>
              <p className="text-xs text-gray-500 mt-0.5">Cửa hàng sẽ hiển thị với khách hàng</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#AF140B]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#AF140B]"></div>
            </label>
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#AF140B] hover:bg-[#8f1009] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
              ) : (
                <>{editingStore ? 'Cập nhật' : 'Thêm cửa hàng'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Delete Confirm Modal
// ----------------------------------------------------------------
interface DeleteModalProps {
  store: StoreItem | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

function DeleteModal({ store, onClose, onConfirm, loading }: DeleteModalProps) {
  if (!store) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Xóa cửa hàng</h3>
            <p className="text-sm text-gray-500 mt-0.5">Hành động này không thể hoàn tác</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-6">
          Bạn có chắc chắn muốn xóa cửa hàng <span className="font-bold text-gray-900">"{store.name}"</span>?
          Tất cả dữ liệu liên quan đến cửa hàng này sẽ bị xóa vĩnh viễn.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xóa...</> : 'Xóa cửa hàng'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Toast notification
// ----------------------------------------------------------------
interface ToastProps { message: string; type: 'success' | 'error'; }
function Toast({ message, type }: ToastProps) {
  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium animate-slide-up ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success'
        ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
        : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      {message}
    </div>
  );
}

// ----------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------
export default function AdminStoreManagement() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);
  const [deleteStore, setDeleteStore] = useState<StoreItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Toast
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Search & Sort
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await storeApi.getStores();
      setStores(data);
    } catch {
      setError('Không thể tải danh sách cửa hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  // Sorted + filtered list
  const displayed = [...stores]
    .filter(s => {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.managerName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let va: any = a[sortField as keyof StoreItem];
      let vb: any = b[sortField as keyof StoreItem];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3.5 h-3.5 text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-[#AF140B]" />
      : <ChevronDown className="w-3.5 h-3.5 text-[#AF140B]" />;
  };

  // Handlers
  const handleAddClick = () => { setEditingStore(null); setModalOpen(true); };
  const handleEditClick = (store: StoreItem) => { setEditingStore(store); setModalOpen(true); };

  const handleModalSuccess = (saved: StoreItem) => {
    setStores(prev => {
      const idx = prev.findIndex(s => s.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    showToast(editingStore ? 'Cập nhật cửa hàng thành công!' : 'Thêm cửa hàng thành công!', 'success');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteStore) return;
    setDeleteLoading(true);
    try {
      await storeApi.deleteStore(deleteStore.id);
      setStores(prev => prev.filter(s => s.id !== deleteStore.id));
      showToast('Đã xóa cửa hàng thành công!', 'success');
    } catch (err: any) {
      showToast('Xóa thất bại: ' + (err.message || 'Lỗi không xác định'), 'error');
    } finally {
      setDeleteLoading(false);
      setDeleteStore(null);
    }
  };

  const handleToggleStatus = async (store: StoreItem) => {
    setTogglingId(store.id);
    try {
      const updated = await storeApi.toggleStoreStatus(store.id);
      setStores(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast(`Cửa hàng "${updated.name}" đã ${updated.active ? 'kích hoạt' : 'vô hiệu hóa'}!`, 'success');
    } catch {
      showToast('Không thể thay đổi trạng thái cửa hàng!', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Stats
  const activeCount = stores.filter(s => s.active).length;
  const inactiveCount = stores.length - activeCount;

  return (
    <div className="min-h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-[#AF140B]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Cửa hàng</h1>
            <p className="text-sm text-gray-500">Thêm, sửa, xóa và quản lý trạng thái cửa hàng</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tổng cửa hàng</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stores.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Đang hoạt động</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tạm ngưng</p>
          <p className="text-3xl font-bold text-gray-400 mt-1">{inactiveCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên, mã, địa chỉ, SĐT..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#AF140B]/30 focus:border-[#AF140B] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStores}
              className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#AF140B] hover:bg-[#8f1009] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm cửa hàng
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-xl border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-[#AF140B]" />
          <span className="ml-3 text-gray-500">Đang tải dữ liệu...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-gray-700 font-semibold">{error}</p>
          <button onClick={fetchStores} className="mt-4 px-4 py-2 bg-[#AF140B] text-white rounded-xl text-sm font-semibold hover:bg-[#8f1009]">
            Thử lại
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-gray-100">
          <Store className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-semibold">
            {search ? 'Không tìm thấy cửa hàng phù hợp' : 'Chưa có cửa hàng nào'}
          </p>
          {!search && (
            <button onClick={handleAddClick} className="mt-4 px-4 py-2 bg-[#AF140B] text-white rounded-xl text-sm font-semibold hover:bg-[#8f1009]">
              Thêm cửa hàng đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th
                    onClick={() => handleSort('code')}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                  >
                    <span className="flex items-center gap-1">Mã <SortIcon field="code" /></span>
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                  >
                    <span className="flex items-center gap-1">Tên cửa hàng <SortIcon field="name" /></span>
                  </th>
                  <th
                    onClick={() => handleSort('address')}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none hidden lg:table-cell"
                  >
                    <span className="flex items-center gap-1">Địa chỉ <SortIcon field="address" /></span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                    Quản lý
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                    Giờ hoạt động
                  </th>
                  <th
                    onClick={() => handleSort('active')}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                  >
                    <span className="flex items-center gap-1">Trạng thái <SortIcon field="active" /></span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayed.map(store => (
                  <tr key={store.id} className="hover:bg-gray-50/60 transition-colors group">
                    {/* Mã */}
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2 py-0.5 bg-red-50 text-[#AF140B] text-xs font-bold rounded-lg">
                        {store.code}
                      </span>
                    </td>
                    {/* Tên */}
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-900">{store.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 lg:hidden">{store.address}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <Phone className="w-3 h-3 inline mr-1" />{store.phone}
                      </p>
                    </td>
                    {/* Địa chỉ */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-xs leading-relaxed max-w-[220px]">{store.address}</span>
                      </div>
                    </td>
                    {/* Quản lý */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600">{store.managerName}</span>
                      </div>
                    </td>
                    {/* Giờ */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600 text-xs">{store.openingTime} – {store.closingTime}</span>
                      </div>
                    </td>
                    {/* Trạng thái */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(store)}
                        disabled={togglingId === store.id}
                        title={store.active ? 'Click để vô hiệu hóa' : 'Click để kích hoạt'}
                        className="flex items-center gap-1.5 transition-opacity hover:opacity-70 disabled:opacity-50"
                      >
                        {togglingId === store.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        ) : store.active ? (
                          <ToggleRight className="w-6 h-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                        <span className={`text-xs font-semibold ${store.active ? 'text-green-600' : 'text-gray-400'}`}>
                          {store.active ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                      </button>
                    </td>
                    {/* Thao tác */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(store)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteStore(store)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">
              Hiển thị <span className="font-semibold text-gray-600">{displayed.length}</span> / <span className="font-semibold text-gray-600">{stores.length}</span> cửa hàng
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <StoreModal
        isOpen={modalOpen}
        editingStore={editingStore}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
      <DeleteModal
        store={deleteStore}
        onClose={() => setDeleteStore(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
