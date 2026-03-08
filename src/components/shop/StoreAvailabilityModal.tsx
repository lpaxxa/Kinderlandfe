import { useState, useMemo, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

interface StoreAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  selectedSku?: any;
}

export default function StoreAvailabilityModal({ isOpen, onClose, product, selectedSku }: StoreAvailabilityModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyShowInStock, setOnlyShowInStock] = useState(false);

  const [availabilityData, setAvailabilityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await api.getInventoryAvailability(selectedSku?.id, product.id);
          const data = res.data || res || [];
          setAvailabilityData(data);

          // No store selected by default to show Vietnam map
          setSelectedStore(null);
        } catch (error) {
          console.error("Error fetching inventory availability:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, product.id, selectedSku]);

  const getStockStatus = (status: string) => {
    if (status === 'Có sẵn') return { status: 'available', text: 'Có sẵn', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    if (status === 'Sắp hết hàng') return { status: 'low', text: 'Sắp hết', icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { status: 'out', text: 'Hết hàng', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  const filteredStores = useMemo(() => {
    return availabilityData.filter((item) => {
      const matchesSearch =
        item.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address.toLowerCase().includes(searchQuery.toLowerCase());

      const statusInfo = getStockStatus(item.availabilityStatus);
      const matchesStockFilter = !onlyShowInStock || statusInfo.status === 'available';

      return matchesSearch && matchesStockFilter;
    });
  }, [availabilityData, searchQuery, onlyShowInStock]);

  const storesInStockCount = availabilityData.filter(item => item.availabilityStatus === 'Có sẵn').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Tìm tại cửa hàng</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF140B] mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Đang tải dữ liệu cửa hàng...</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6 p-6">
              {/* Left Side - Filters & List */}
              <div className="space-y-6">
                {/* Product Info */}
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                  <img
                    src={product.image || product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    className="size-24 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 line-clamp-2">{product.name}</h3>
                    <div className="mt-1">
                      {(() => {
                        const discountPercent = product.discount || 0;
                        const currentOriginalPrice = selectedSku ? selectedSku.price : (product.originalPrice || product.price);
                        const currentFinalPrice = discountPercent > 0
                          ? currentOriginalPrice - (currentOriginalPrice * discountPercent) / 100
                          : currentOriginalPrice;

                        return (
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-extrabold text-[#AF140B] whitespace-nowrap">
                              {formatPrice(currentFinalPrice)}
                            </p>
                            {discountPercent > 0 && (
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                                -{discountPercent}%
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    {selectedSku && (
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        Loại: <span className="text-gray-700">{selectedSku.skuCode}</span>
                        {selectedSku.size && ` | Size: ${selectedSku.size}`}
                        {selectedSku.color && ` | Color: ${selectedSku.color}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider font-bold">{product.brand}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 font-medium">
                  <strong>{storesInStockCount}</strong> trên tổng <strong>{availabilityData.length}</strong> cửa hàng có sản phẩm này
                </div>

                {/* Store List */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {filteredStores.map((item) => {
                    const stockStatus = getStockStatus(item.availabilityStatus);
                    const Icon = stockStatus.icon;
                    const isSelected = selectedStore?.storeId === item.storeId;

                    return (
                      <div
                        key={item.storeId}
                        className={`border-2 rounded-xl overflow-hidden transition-all ${isSelected ? 'border-[#AF140B] bg-red-50/30 shadow-md' : 'border-gray-200 hover:border-red-200'
                          }`}
                      >
                        <button
                          onClick={() => setSelectedStore(item)}
                          className="w-full p-4 text-left flex items-start justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 mb-1">
                              {item.storeName.replace('Kinderland Store ', '')}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-1">{item.address}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${stockStatus.bgColor}`}>
                              <Icon className={`size-4 ${stockStatus.color}`} />
                              <span className={`text-xs font-bold ${stockStatus.color}`}>
                                {item.availabilityStatus}
                              </span>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}

                  {filteredStores.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <p className="text-gray-500 font-medium">Không tìm thấy cửa hàng phù hợp</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Map */}
              <div className="lg:sticky lg:top-0">
                <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg h-full min-h-[500px]">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={selectedStore
                      ? `https://maps.google.com/maps?q=${selectedStore.latitude},${selectedStore.longitude}&hl=vi&z=17&output=embed`
                      : `https://maps.google.com/maps?q=Vietnam&hl=vi&z=6&output=embed`
                    }
                    title={selectedStore?.storeName || "Vietnam Map"}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
