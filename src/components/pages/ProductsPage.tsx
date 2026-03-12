import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import ProductCard from "../shop/ProductCard";
import { SlidersHorizontal } from "lucide-react";
import Pagination from "../common/Pagination";
import { productApi, Product as APIProduct } from "../../services/productApi";
import { categoryApi, Category } from "../../services/categoryApi";
import { brandApi, Brand } from "../../services/brandApi";

export default function ProductsPage() {
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("default"); // Keep for client-side sorting or implement BE later
  const [priceRange, setPriceRange] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 20;

  const searchTerm = searchParams.get("search") || "";

  // Load Categories & Brands ONCE
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cats, brnds] = await Promise.all([
          categoryApi.getAll(),
          brandApi.getAll()
        ]);
        setCategories(cats || []);
        setBrands(brnds || []);
      } catch (err) {
        console.error("Error loading categories or brands", err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Products based on parameters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let minPrice: number | undefined;
        let maxPrice: number | undefined;

        if (priceRange === "under300") {
          maxPrice = 300000;
        } else if (priceRange === "300-600") {
          minPrice = 300000;
          maxPrice = 600000;
        } else if (priceRange === "600-1000") {
          minPrice = 600000;
          maxPrice = 1000000;
        } else if (priceRange === "over1000") {
          minPrice = 1000000;
        }

        const pageParam = currentPage - 1; // Backend is 0-indexed
        
        // If there's a search term, call the search API
        if (searchTerm) {
          const res = await productApi.search(searchTerm, pageParam, itemsPerPage);
          setProducts(res.content);
          setTotalPages(res.totalPages);
          setTotalElements(res.totalElements);
          return;
        }

        // Otherwise call the browse API with filters
        const categoryId = selectedCategory !== "all" ? categories.find(c => c.name === selectedCategory)?.id : undefined;
        const brandId = selectedBrand !== "all" ? brands.find(b => b.name === selectedBrand)?.id : undefined;

        const res = await productApi.browse({
          categoryId,
          brandId,
          minPrice,
          maxPrice,
          page: pageParam,
          size: itemsPerPage,
        });

        setProducts(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);

      } catch (error) {
        console.error("Lỗi lấy products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchTerm,
    priceRange,
    selectedBrand,
    selectedCategory,
    currentPage,
    categories,
    brands
  ]);

  // Client-side sorting (since backend sorting is not fully implemented yet)
  const currentProducts = [...products].sort((a, b) => {
    const priceA = a.minPrice || 0;
    const priceB = b.minPrice || 0;
    if (sortBy === "price-asc") return priceA - priceB;
    if (sortBy === "price-desc") return priceB - priceA;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    sortBy,
    priceRange,
    selectedBrand,
    selectedCategory,
  ]);

  // Removed the huge fetchProducts effect that did client-side mapping


  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 text-[#AF140B] flex items-center gap-4">
            {searchTerm
              ? `Kết quả tìm kiếm: \"${searchTerm}\"`
              : "Tất Cả Sản Phẩm"}
          </h1>
          <p className="text-gray-700 text-lg font-semibold">
            Tìm thấy{" "}
            <span className="font-bold text-[#78A2D2]">
              {totalElements}
            </span>{" "}
            sản phẩm
            {totalPages > 0 &&
              ` - Trang ${currentPage}/${totalPages}`}
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="size-5 text-[#78A2D2]" />
            <h3 className="font-bold text-gray-800">
              Bộ lọc & Sắp xếp
            </h3>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Sắp xếp theo:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#78A2D2] focus:border-[#78A2D2] font-semibold text-gray-800"
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">
                  Giá: Thấp đến Cao
                </option>
                <option value="price-desc">
                  Giá: Cao đến Thấp
                </option>
                <option value="name">Tên: A-Z</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Khoảng giá:
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#78A2D2] focus:border-[#78A2D2] font-semibold text-gray-800"
              >
                <option value="all">Tất cả</option>
                <option value="under300">Dưới 300.000đ</option>
                <option value="300-600">
                  300.000đ - 600.000đ
                </option>
                <option value="600-1000">
                  600.000đ - 1.000.000đ
                </option>
                <option value="over1000">
                  Trên 1.000.000đ
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Thương hiệu:
              </label>
              <select
                value={selectedBrand}
                onChange={(e) =>
                  setSelectedBrand(e.target.value)
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#78A2D2] focus:border-[#78A2D2] font-semibold text-gray-800"
              >
                <option value="all">Tất cả thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Danh mục:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#78A2D2] focus:border-[#78A2D2] font-semibold text-gray-800"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              Không tìm thấy sản phẩm nào
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {currentProducts.map((product) => {
                const discount = product.promotion?.discountPercent || 0;
                const originalPrice = product.minPrice;
                const price =
                  discount > 0
                    ? originalPrice - (originalPrice * discount) / 100
                    : originalPrice;
                    
                const productProps = {
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: price,
                  originalPrice: discount > 0 ? originalPrice : null,
                  category: product.categoryName,
                  brand: product.brandName,
                  image: product.imageUrl,
                  rating: 4.5,
                  reviewCount: 10,
                  isBestSeller: false,
                  isNew: false,
                };
                return (
                <ProductCard
                  key={product.id}
                  product={productProps}
                />
              )})}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}