import { useEffect, useState } from "react";
import api from "../../services/api";
import { Heart, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Wishlist() {

  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/api/v1/wishlist");
<<<<<<< HEAD
      console.log("fetchWishlist response:", res);
      
      let items = res;
      if (res && res.data) {
        items = res.data;
      } else if (res && res.items) {
        items = res.items;
      }

      if (Array.isArray(items)) {
        setWishlist(items);
      } else if (items && Array.isArray(items.items)) {
        setWishlist(items.items);
      } else {
        console.warn("Expected array but got:", items);
        setWishlist([]);
      }
=======
      // BaseResponse<WishlistResponseDTO> → data is { wishlistId, items: [...] }
      const items = res.data?.items || [];
      setWishlistItems(items);
>>>>>>> feat/wishlist-api
    } catch (error) {
      console.error(error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (wishlistItemId: number) => {
    try {
      await api.delete(`/api/v1/wishlist/items/${wishlistItemId}`);
      toast.success("Đã xóa khỏi wishlist");
      fetchWishlist();
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa sản phẩm");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">

      <div className="flex items-center gap-3 mb-8">
        <Heart className="size-7 text-[#AF140B] fill-[#AF140B]" />
        <h1 className="text-3xl font-bold text-gray-800">
          Wishlist của tôi
        </h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {wishlistItems.length} sản phẩm
        </span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="size-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">Chưa có sản phẩm yêu thích</p>
          <Link
            to="/products"
            className="inline-block bg-[#AF140B] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8D0F08] transition-colors"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item: any) => (
            <div key={item.wishlistItemId} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group">

              <Link to={`/product/${item.productId}`}>
                <div className="relative aspect-square bg-gradient-to-br from-[#FFE5E3] to-white overflow-hidden">
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>

              <div className="p-4">
                <Link to={`/product/${item.productId}`}>
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 hover:text-[#AF140B] transition-colors">
                    {item.productName}
                  </h3>
                </Link>

                {item.priceAtAddTime && (
                  <p className="text-lg font-bold text-[#AF140B] mb-3">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.priceAtAddTime)}
                  </p>
                )}

                <button
                  onClick={() => handleRemoveItem(item.wishlistItemId)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors border border-red-200"
                >
                  <Trash2 className="size-4" />
                  Xóa khỏi wishlist
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}