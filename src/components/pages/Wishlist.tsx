import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Wishlist() {

  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/api/v1/wishlist");
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
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="container mx-auto py-10">

      <h1 className="text-2xl font-bold mb-6">
        Wishlist
      </h1>

      <div className="grid grid-cols-4 gap-6">

        {wishlist.map((item: any) => (
          <div key={item.id} className="border p-4 rounded">

            <img
              src={item.imageUrl}
              className="w-full h-40 object-cover"
            />

            <h3 className="mt-2 font-semibold">
              {item.name}
            </h3>

          </div>
        ))}

      </div>

    </div>
  );
}