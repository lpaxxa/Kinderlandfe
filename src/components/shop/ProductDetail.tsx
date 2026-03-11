import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { ShoppingCart, Heart, MapPin, ChevronRight, ArrowLeft, Plus, Minus, Loader2 } from 'lucide-react';
import StoreAvailabilityModal from './StoreAvailabilityModal';
import { toast } from 'sonner';
import api from "../../services/api";
import { inventoryApi, StoreAvailability } from '../../services/inventoryApi';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlistItems, setWishlistItems } = useApp();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showStoreModal, setShowStoreModal] = useState(false);

  const [skus, setSkus] = useState<any[]>([]);
  const [selectedSku, setSelectedSku] = useState<any>(null);

  // Real store availability from the API
  const [storeAvailability, setStoreAvailability] = useState<StoreAvailability[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/v1/products/view-detail/${id}`);

        console.log("API PRODUCT:", response.data);

        const data = response.data;

        const discountPercent = data.promotion?.discountPercent || 0;

        const originalPrice = data.minPrice;

        const finalPrice =
          discountPercent > 0
            ? originalPrice - (originalPrice * discountPercent) / 100
            : originalPrice;

        const mappedProduct = {
          id: data.id,
          name: data.name,
          description: data.description,
          image: data.imageUrl,
          category: data.categoryName,
          brand: data.brandName,

          price: finalPrice,
          originalPrice: discountPercent > 0 ? originalPrice : null,
          discount: discountPercent,

          stock: 100,
        };

        setProduct(mappedProduct);
      } catch (error) {
        console.error("Lỗi lấy product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    const fetchSkus = async () => {
      try {
        const res = await api.get("/api/v1/sku");

        const productSkus = res.data.filter(
          (sku: any) => sku.productId === product.id
        );

        setSkus(productSkus);

        if (productSkus.length > 0) {
          setSelectedSku(productSkus[0]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSkus();
  }, [product]);

  // Fetch real store availability whenever selectedSku changes
  useEffect(() => {
    if (!selectedSku) {
      setStoreAvailability([]);
      return;
    }

    const fetchAvailability = async () => {
      setAvailabilityLoading(true);
      try {
        const res = await inventoryApi.getStoreAvailability(selectedSku.id);
        console.log("Store availability for SKU", selectedSku.id, ":", res.data);
        setStoreAvailability(res.data || []);
      } catch (error) {
        console.error("Lỗi lấy store availability:", error);
        setStoreAvailability([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedSku]);

  // Stores that have stock — check both quantity and availabilityStatus
  // (availabilityStatus is always set by backend; quantity may be null if backend hasn't been updated)
  const storesWithStock = storeAvailability.filter(
    (store) => {
      // If quantity is explicitly set, use it
      if (store.quantity != null && store.quantity > 0) return true;
      // Fallback: trust availabilityStatus when quantity is missing
      if (store.availabilityStatus === 'Có sẵn' || store.availabilityStatus === 'Còn ít' || store.availabilityStatus === 'Còn hàng') return true;
      return false;
    }
  );

  // Compute stock from real availability data
  const totalSkuStock = storeAvailability.reduce(
    (sum, store) => sum + (store.quantity || 0),
    0
  );
  // If quantity data is available use it; otherwise fallback to storesWithStock count
  const currentStock = selectedSku
    ? (totalSkuStock > 0 ? totalSkuStock : storesWithStock.length)
    : (product ? product.stock : 0);

  // Prevent ordering more than available stock or less than 1 (if stock > 0)
  useEffect(() => {
    if (currentStock > 0) {
      if (quantity === 0) setQuantity(1);
      else if (quantity > currentStock) setQuantity(currentStock);
    } else {
      setQuantity(0);
    }
  }, [currentStock, quantity]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAddToCart = async () => {
    try {
      if (!selectedSku) {
        throw new Error("Vui lòng chọn loại sản phẩm!");
      }

      if (storesWithStock.length === 0) {
        throw new Error("Sản phẩm hiện tại đã hết hàng ở tất cả các chi nhánh.");
      }

      // Pick the store with the most stock as default
      const sortedStores = [...storesWithStock].sort(
        (a, b) => (b.quantity || 0) - (a.quantity || 0)
      );
      const bestStore = sortedStores[0];

      await addToCart(selectedSku.id, quantity, bestStore.storeId);

      toast.success('✅ Thêm vào giỏ hàng thành công!', {
        description: `${quantity} x ${product.name} (Từ ${bestStore.storeName})`,
        duration: 2000,
      });
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
    }
  };


  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < currentStock) setQuantity(quantity + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#AF140B] hover:text-[#8D0F08] mb-6 font-semibold"
      >
        <ArrowLeft className="size-5" />
        Quay lại
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-[#FFE5E3] to-white rounded-3xl overflow-hidden shadow-xl border border-[#AF140B]/20 p-8">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="mb-4">
            <span className="text-sm bg-[#FFE5E3] text-[#AF140B] px-4 py-2 rounded-full font-semibold">
              {product.category}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {product.name}
          </h1>

          <div className="mb-4">
            <span className="text-sm text-gray-600">
              Thương hiệu: <span className="font-bold text-[#AF140B]">{product.brand}</span>
            </span>
          </div>

          <p className="text-gray-600 mb-6 text-lg leading-relaxed">{product.description}</p>

          {(() => {
            const discountPercent = product.discount || 0;
            const currentOriginalPrice = selectedSku ? selectedSku.price : (product.originalPrice || product.price);
            const currentFinalPrice = discountPercent > 0
              ? currentOriginalPrice - (currentOriginalPrice * discountPercent) / 100
              : currentOriginalPrice;

            return discountPercent > 0 ? (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl font-bold text-[#AF140B]">
                    {formatPrice(currentFinalPrice)}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                    Giảm {discountPercent}%
                  </span>
                </div>
                <div className="text-lg text-gray-400 line-through">
                  Giá gốc: {formatPrice(currentOriginalPrice)}
                </div>

                {selectedSku && (
                  <div className="text-sm text-gray-500 mt-2 font-medium">
                    Loại: <span className="text-gray-800">{selectedSku.skuCode}</span>
                    {selectedSku.size && ` | Size: ${selectedSku.size}`}
                    {selectedSku.color && ` | Color: ${selectedSku.color}`}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6">
                <div className="text-4xl font-bold text-[#AF140B] mb-2">
                  {formatPrice(currentFinalPrice)}
                </div>

                {selectedSku && (
                  <div className="text-sm text-gray-500 mt-2 font-medium">
                    Loại: <span className="text-gray-800">{selectedSku.skuCode}</span>
                    {selectedSku.size && ` | Size: ${selectedSku.size}`}
                    {selectedSku.color && ` | Color: ${selectedSku.color}`}
                  </div>
                )}
              </div>
            );
          })()}

          <div className="mt-4">
            <p className="font-semibold mb-2">Chọn loại:</p>

            <div className="flex flex-wrap gap-2">
              {skus.map((sku: any) => (
                <button
                  key={sku.id}
                  onClick={() => setSelectedSku(sku)}
                  className={`px-4 py-2 border rounded-lg text-sm transition
        ${selectedSku?.id === sku.id
                      ? "bg-[#AF140B] text-white border-[#AF140B]"
                      : "bg-white hover:bg-gray-100"
                    }`}
                >
                  {sku.skuCode}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 mt-4">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Số lượng:
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={decreaseQuantity}
                className="p-3 border-2 border-gray-300 rounded-xl hover:bg-[#AF140B] hover:text-white hover:border-[#AF140B] transition-all"
              >
                <Minus className="size-5" />
              </button>
              <span className="text-2xl font-bold w-16 text-center">
                {quantity}
              </span>
              <button
                onClick={increaseQuantity}
                className="p-3 border-2 border-gray-300 rounded-xl hover:bg-[#AF140B] hover:text-white hover:border-[#AF140B] transition-all disabled:opacity-50"
                disabled={quantity >= currentStock || currentStock === 0}
              >
                <Plus className="size-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              {availabilityLoading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" /> Đang kiểm tra tồn kho...
                </span>
              ) : (
                `Còn lại: ${currentStock} sản phẩm`
              )}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0 || availabilityLoading}
            className="w-full bg-[#AF140B] text-white py-4 rounded-2xl hover:bg-[#8D0F08] transition-all shadow-lg flex items-center justify-center gap-3 font-bold text-lg disabled:opacity-50"
          >
            <ShoppingCart className="size-6" />
            {availabilityLoading ? "Đang kiểm tra..." : currentStock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
          </button>

          {/* Add to Wishlist Button */}
          {(() => {
            const productId = product.id && typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
            const wishlistItem = wishlistItems?.find(item => (item.productId || item.id) === productId);
            const isLiked = !!wishlistItem;

            return (
              <button
                onClick={async () => {
                  try {
                    if (isLiked) {
                      const targetId = wishlistItem.wishlistItemId || wishlistItem.id;
                      const response = await api.removeWishlist(targetId);
                      const items = response.data?.items || response.items || response.data || [];
                      if (Array.isArray(items) && setWishlistItems) setWishlistItems(items);
                      toast.success("Đã xóa khỏi yêu thích", {
                        description: product.name,
                        duration: 2000,
                      });
                    } else {
                      const response = await api.addWishlist(productId);
                      const items = response.data?.items || response.items || response.data || [];
                      if (Array.isArray(items) && setWishlistItems) setWishlistItems(items);
                      toast.success('❤️ Đã thêm vào yêu thích', {
                        description: product.name,
                        duration: 2000,
                      });
                    }
                  } catch (error: any) {
                    const errorMsg = error.message || "";
                    if (errorMsg.includes('400') || errorMsg.includes('already') || errorMsg.includes('đã có')) {
                      toast.error('Sản phẩm đã có trong danh sách yêu thích');
                    } else {
                      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
                    }
                  }
                }}
                className="w-full mt-4 bg-white border-2 border-[#AF140B] text-[#AF140B] py-4 rounded-2xl hover:bg-[#FFE5E3] transition-all flex items-center justify-center gap-3 font-bold text-lg group"
              >
                <Heart className={`size-6 transition-colors ${isLiked ? "fill-[#AF140B] text-[#AF140B]" : "text-[#AF140B] group-hover:fill-[#AF140B]"}`} />
                {isLiked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              </button>
            );
          })()}

          {/* Find in Store Button */}
          <button
            onClick={() => setShowStoreModal(true)}
            className="w-full mt-4 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3 font-bold text-lg"
          >
            <MapPin className="size-6" />
            Tìm tại cửa hàng
          </button>

          <div className="mt-6 p-5 bg-[#FFE5E3] rounded-2xl border-2 border-[#AF140B]/30">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">🎯 Chính sách:</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-[#AF140B]">✓</span>
                <span>Miễn phí vận chuyển đơn từ 500.000đ</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#AF140B]">✓</span>
                <span>Đổi trả trong 7 ngày</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#AF140B]">✓</span>
                <span>Bảo hành chính hãng</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#AF140B]">✓</span>
                <span>Hỗ trợ 24/7</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Store Availability */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 mb-6 mt-8">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="size-5 text-[#AF140B]" />
          <h3 className="font-bold text-gray-800">Tình Trạng Tại Cửa Hàng</h3>
        </div>

        {availabilityLoading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-gray-500">
            <Loader2 className="size-5 animate-spin" />
            <span>Đang tải tình trạng cửa hàng...</span>
          </div>
        ) : storesWithStock.length > 0 ? (
          <div className="space-y-3">
            {storesWithStock.slice(0, 3).map((store) => (
              <div key={store.storeId} className="p-3 bg-[#FFE5E3] rounded-xl border border-[#AF140B]/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 line-clamp-1">
                      {store.storeName}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-1">{store.address}</p>
                  </div>
                  <span className="text-[#AF140B] font-bold text-sm whitespace-nowrap">
                    Còn {store.quantity} sp
                  </span>
                </div>
              </div>
            ))}

            {storesWithStock.length > 3 && (
              <button
                onClick={() => setShowStoreModal(true)}
                className="flex items-center justify-center gap-2 text-[#AF140B] hover:text-[#8D0F08] font-semibold text-sm py-2 w-full"
              >
                Xem tất cả {storesWithStock.length} cửa hàng
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              {selectedSku
                ? "Sản phẩm hiện tại đã hết hàng ở tất cả các chi nhánh."
                : "Vui lòng chọn loại sản phẩm để kiểm tra tình trạng tại cửa hàng."}
            </p>
            <button
              onClick={() => setShowStoreModal(true)}
              className="flex items-center gap-2 text-[#AF140B] hover:text-[#8D0F08] font-semibold text-sm"
            >
              <MapPin className="size-4" />
              Xem tình trạng tại cửa hàng →
            </button>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 text-lg">🎯 Đặc Điểm:</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-[#AF140B]">✓</span>
              <span>Chất lượng cao</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#AF140B]">✓</span>
              <span>Thiết kế đẹp mắt</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#AF140B]">✓</span>
              <span>Chống nước</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#AF140B]">✓</span>
              <span>Kháng khuẩn</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Store Availability Modal */}
      <StoreAvailabilityModal
        isOpen={showStoreModal}
        onClose={() => setShowStoreModal(false)}
        product={product}
        selectedSku={selectedSku}
      />
    </div>
  );
}