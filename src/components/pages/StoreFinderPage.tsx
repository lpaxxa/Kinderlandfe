import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Phone,
  Clock,
  Search,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import api from "../../services/api";

export default function StoreFinderPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [nearbyStores, setNearbyStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNearby, setLoadingNearby] = useState(false);
  
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStoreId, setExpandedStoreId] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);

  const fetchData = async (coords?: {lat: number, lng: number}) => {
    setLoading(true);
    try {
      const storesRes = await api.get('/api/v1/stores');
      const storeList = storesRes.data || storesRes || [];
      setStores(storeList);
      
      if (!selectedStore && storeList.length > 0) {
        setSelectedStore(storeList[0]);
      }

      if (coords) {
        setLoadingNearby(true);
        try {
          const nearbyRes = await api.getNearbyStores(coords.lat, coords.lng);
          setNearbyStores(nearbyRes.data || nearbyRes || []);
          if (nearbyRes.data?.[0] || nearbyRes?.[0]) {
            setSelectedStore(nearbyRes.data?.[0] || nearbyRes?.[0]);
          }
        } catch (err) {
          console.error("Error fetching nearby stores:", err);
        } finally {
          setLoadingNearby(false);
        }
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserCoords(coords);
          fetchData(coords);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Không thể lấy vị trí của bạn.");
        }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
    }
  };

  const renderStoreCard = (store: any, isNearby: boolean = false) => {
    const storeId = store.id || store.storeId;
    const isExpanded = expandedStoreId === storeId;
    const isSelected = selectedStore?.id === storeId || selectedStore?.storeId === storeId;

    return (
      <div
        key={storeId}
        className={`border-2 rounded-xl overflow-hidden transition-all ${
          isNearby ? 'border-green-200 bg-green-50/30' : 
          isSelected ? "border-[#AF140B] bg-[#FFE5E3]" : "border-gray-200 hover:border-[#AF140B]/50"
        }`}
      >
        <button
          onClick={() => {
            setSelectedStore(store);
            setExpandedStoreId(isExpanded ? null : storeId);
          }}
          className="w-full p-4 text-left flex items-center justify-between gap-2"
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 line-clamp-1">
              {store.name?.replace("Kinderland ", "") || store.storeName?.replace("Kinderland Store ", "")}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1">
              {store.address}
            </p>
          </div>
          <ChevronDown
            className={`size-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t-2 border-gray-100 space-y-2 bg-white">
            <div className="flex items-start gap-2">
              <MapPin className="size-4 text-[#AF140B] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                {store.address}, {store.city || ''}
              </p>
            </div>
            {(store.phone) && (
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-[#AF140B] flex-shrink-0" />
                <p className="text-sm text-gray-700">{store.phone}</p>
              </div>
            )}
            {(store.openHours || (store.openingTime && store.closingTime)) && (
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-[#AF140B] flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  {store.openHours || `${store.openingTime} - ${store.closingTime}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.district && store.district.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  if (loading && stores.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#AF140B] mx-auto mb-4"></div>
          <p className="text-xl font-bold text-gray-800">Đang tìm kiếm cửa hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#AF140B] via-[#D91810] to-[#AF140B] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full mb-4 backdrop-blur-sm">
            <MapPin className="size-6" />
            <span className="font-bold text-lg">
              HỆ THỐNG CỬA HÀNG
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Tìm Cửa Hàng Kinderland
          </h1>
          <p className="text-xl text-white/90">
            {stores.length} cửa hàng trên toàn quốc
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Store List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm cửa hàng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#AF140B] focus:border-[#AF140B]"
                  />
                </div>
              </div>

              {/* Find Nearest Toggle */}
              <button
                onClick={requestLocation}
                disabled={loadingNearby}
                className="w-full mb-6 py-3 px-4 bg-[#AF140B] hover:bg-[#8E1009] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:bg-gray-400"
              >
                <MapPin className="size-5" />
                {loadingNearby ? "Đang xác định vị trí..." : "Tìm cửa hàng gần đây"}
              </button>

              <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-700 font-semibold">
                  <strong>{filteredStores.length}</strong> cửa hàng phù hợp
                </p>
                {nearbyStores.length > 0 && (
                  <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                    <CheckCircle className="size-3.5" />
                    Đã tìm thấy {nearbyStores.length} cửa hàng lân cận
                  </div>
                )}
              </div>

              {/* Store List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {/* Priority Nearby Stores */}
                {nearbyStores.length > 0 && (
                  <div className="pb-4 mb-4 border-b-2 border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Gần bạn nhất</p>
                    <div className="space-y-3">
                      {nearbyStores.map(store => renderStoreCard(store, true))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Tất cả cửa hàng</p>
                {filteredStores.map((store) => renderStoreCard(store))}
              </div>

              {filteredStores.length === 0 && nearbyStores.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Không tìm thấy cửa hàng
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Content - Map & Store Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[450px]">
              {selectedStore ? (
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${selectedStore.latitude || selectedStore.lat || 10.762622},${selectedStore.longitude || selectedStore.lng || 106.660172}&hl=vi&z=16&output=embed`}
                  title={selectedStore.storeName || selectedStore.name}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  Chọn một cửa hàng để xem bản đồ
                </div>
              )}
            </div>

            {/* Store Details Card */}
            {selectedStore && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {selectedStore.storeName || selectedStore.name}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-6 text-[#AF140B] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-1">
                        Địa chỉ
                      </p>
                      <p className="text-gray-600">
                        {selectedStore.address}
                      </p>
                      {selectedStore.city && (
                        <p className="text-gray-600">
                          {selectedStore.city}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="size-6 text-[#AF140B] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-1">
                        Số điện thoại
                      </p>
                      <a
                        href={`tel:${selectedStore.phone}`}
                        className="text-[#AF140B] hover:underline"
                      >
                        {selectedStore.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="size-6 text-[#AF140B] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-1">
                        Giờ mở cửa
                      </p>
                      <p className="text-gray-600">
                        {selectedStore.openHours || `${selectedStore.openingTime} - ${selectedStore.closingTime}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side - Branding */}
                <div className="bg-gradient-to-br from-[#FFE5E3] to-white rounded-xl p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏪</div>
                    <h3 className="font-bold text-gray-800 mb-2">
                      Chào mừng đến Kinderland
                    </h3>
                    <p className="text-sm text-gray-600">
                      Hệ thống đồ chơi trẻ em hàng đầu
                    </p>
                  </div>
                </div>
              </div>

              {/* Dịch vụ */}
              <div className="mt-8 pt-6 border-t-2 border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">
                  Dịch vụ tại cửa hàng
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-[#FFE5E3] rounded-xl border border-[#AF140B]/20">
                    <div className="text-3xl mb-2">🎁</div>
                    <p className="text-sm font-semibold text-gray-700">Gói quà miễn phí</p>
                  </div>
                  <div className="text-center p-4 bg-[#FFE5E3] rounded-xl border border-[#AF140B]/20">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-sm font-semibold text-gray-700">Đổi trả 30 ngày</p>
                  </div>
                  <div className="text-center p-4 bg-[#FFE5E3] rounded-xl border border-[#AF140B]/20">
                    <div className="text-3xl mb-2">🎮</div>
                    <p className="text-sm font-semibold text-gray-700">Khu vui chơi</p>
                  </div>
                  <div className="text-center p-4 bg-[#FFE5E3] rounded-xl border border-[#AF140B]/20">
                    <div className="text-3xl mb-2">🅿️</div>
                    <p className="text-sm font-semibold text-gray-700">Bãi đỗ xe</p>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}