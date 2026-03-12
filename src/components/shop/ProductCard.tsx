import { Link } from "react-router";
import { Star, Eye, Heart } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { toast } from "sonner";
import api from "../../services/api";

interface ProductCardProps {
  product: any;
  featured?: boolean;
}

export default function ProductCard({ product, featured = false }: ProductCardProps) {
  const { wishlistItems, setWishlistItems } = useApp();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const discountPercent =
    product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 0;

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
  
  // Find if item is in wishlist globally
  const wishlistItem = wishlistItems.find(item => (item.productId || item.id) === productId);
  const isLiked = !!wishlistItem;

  return (
    <Link
      to={`/product/${product.id}`}
      className={`group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-[#AF140B] ${featured ? "transform hover:scale-105" : "hover:-translate-y-1"
        }`}
    >
      {/* IMAGE */}
      <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-[#FFE5E3] to-white">
        <img
          src={product.image || "https://via.placeholder.com/300"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 right-3 bg-[#D91810] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            -{discountPercent}%
          </span>
        )}

        <button
          onClick={async (e) => {
            e.preventDefault();

            try {
              if (isLiked) {
                // Remove from wishlist
                const targetId = wishlistItem.wishlistItemId || wishlistItem.id;
                const response = await api.removeWishlist(targetId);
                const items = response.data?.items || response.items || response.data || [];
                if (Array.isArray(items)) setWishlistItems(items);
                
                toast.success("Đã xóa khỏi yêu thích", {
                  description: product.name,
                  duration: 2000,
                });
              } else {
                // Add to wishlist
                const response = await api.addWishlist(productId);
                const items = response.data?.items || response.items || response.data || [];
                if (Array.isArray(items)) setWishlistItems(items);

                toast.success("❤️ Đã thêm vào yêu thích", {
                  description: product.name,
                  duration: 2000,
                });
              }
            } catch (error: any) {
              const errorMsg = error.message || "";
              if (errorMsg.includes('400') || errorMsg.includes('already') || errorMsg.includes('đã có') || errorMsg.includes('already in')) {
                // If it was somehow a duplicate error, maybe our local state is out of sync. 
                toast.error("Sản phẩm đã có trong danh sách yêu thích");
              } else {
                toast.error("Có lỗi xảy ra, vui lòng thử lại!");
              }
            }
          }}
          className={`absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-[#FFE5E3] hover:scale-110 transition-all shadow-md group`}
        >
          <Heart 
            className={`size-5 transition-colors ${isLiked ? "fill-[#AF140B] text-[#AF140B]" : "text-gray-400 group-hover:text-[#AF140B]"}`} 
          />
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-4 bg-white">

        {/* CATEGORY */}
        <p className="text-xs text-[#AF140B] font-semibold mb-1 uppercase tracking-wide bg-[#FFE5E3] px-2 py-1 rounded-md inline-block">
          {product.category}
        </p>

        {/* NAME */}
        <h3 className="font-bold text-[#2C2C2C] mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-[#AF140B] transition-colors text-[15px]">
          {product.name}
        </h3>

        {/* RATING */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(fullStars)].map((_, i) => (
              <Star key={i} className="size-4 fill-[#D4AF37] text-[#D4AF37]" />
            ))}

            {hasHalfStar && (
              <Star
                className="size-4 fill-[#D4AF37] text-[#D4AF37]"
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
            )}
          </div>

          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        {/* PRICE */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-[#AF140B]">
            {formatPrice(product.price)}
          </span>

          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* VIEW DETAILS */}
        <div
          className="w-full bg-[#AF140B] text-white hover:bg-[#8D0F08] py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Eye className="size-5" />
          Xem chi tiết
        </div>
      </div>
    </Link>
  );
}