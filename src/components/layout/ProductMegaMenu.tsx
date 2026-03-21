import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { categoryApi, type Category } from '../../services/categoryApi';
import api from '../../services/api';

interface ProductPreview {
  id: number;
  name: string;
  imageUrl: string;
  minPrice: number;
}

export default function ProductMegaMenu({ onClose }: { onClose: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredParent, setHoveredParent] = useState<number | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<ProductPreview[]>([]);
  const [loading, setLoading] = useState(true);

  // Build parent-child structure
  const parentCategories = categories.filter((c) => !c.parentId);
  const getChildren = (parentId: number) =>
    categories.filter((c) => c.parentId === parentId);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryApi.getAll();
        setCategories(data || []);
        // Auto-hover first parent
        const parents = (data || []).filter((c: Category) => !c.parentId);
        if (parents.length > 0) {
          setHoveredParent(parents[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch featured products when hovering a category with no children
  useEffect(() => {
    if (hoveredParent === null) return;
    const children = getChildren(hoveredParent);
    if (children.length > 0) {
      setFeaturedProducts([]);
      return;
    }

    // No children — fetch products for this category
    const parent = categories.find((c) => c.id === hoveredParent);
    if (!parent) return;

    const fetchProducts = async () => {
      try {
        const response = await api.get(
          `/api/v1/products/browse?categoryName=${encodeURIComponent(parent.name)}&page=0&size=2`
        );
        const data = response.data || response;
        const products = Array.isArray(data)
          ? data
          : data.content || data.data?.content || data.data || [];
        setFeaturedProducts(
          products.slice(0, 2).map((p: any) => ({
            id: p.id,
            name: p.name,
            imageUrl: p.imageUrl,
            minPrice: p.minPrice || p.price || 0,
          }))
        );
      } catch {
        setFeaturedProducts([]);
      }
    };
    fetchProducts();
  }, [hoveredParent, categories]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const children = hoveredParent !== null ? getChildren(hoveredParent) : [];
  const hoveredParentData = categories.find((c) => c.id === hoveredParent);

  if (loading) {
    return (
      <div className="bg-white shadow-2xl border border-gray-200 p-8 text-center text-gray-500">
          Đang tải danh mục...
        </div>
    );
  }

  return (
    <div className="border-t border-gray-100">
      <div className="bg-white shadow-2xl border-x border-b border-gray-100 flex min-h-[320px] overflow-hidden container mx-auto">
        {/* Left: Parent categories */}
        <div className="w-[260px] border-r border-gray-100 py-2 flex-shrink-0 overflow-y-auto max-h-[400px]">
          {parentCategories.map((parent) => (
            <button
              key={parent.id}
              onMouseEnter={() => setHoveredParent(parent.id)}
              onClick={() => onClose()}
              className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-all text-sm font-semibold ${
                hoveredParent === parent.id
                  ? 'bg-[#FFE5E3] text-[#AF140B] border-r-3 border-[#AF140B]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Link
                to={`/products?category=${encodeURIComponent(parent.name)}`}
                className="flex-1"
                onClick={onClose}
              >
                {parent.name}
              </Link>
            </button>
          ))}
        </div>

        {/* Middle: Child categories */}
        <div className="flex-1 p-6">
          {hoveredParentData && (
            <>
              <Link
                to={`/products?category=${encodeURIComponent(hoveredParentData.name)}`}
                onClick={onClose}
                className="text-[#AF140B] font-bold text-base mb-4 block hover:underline"
              >
                {hoveredParentData.name}
              </Link>

              {children.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/products?category=${encodeURIComponent(child.name)}`}
                      onClick={onClose}
                      className="text-sm text-gray-600 hover:text-[#AF140B] py-1.5 transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Right: Featured products (when no children) */}
        {children.length === 0 && featuredProducts.length > 0 && (
          <div className="w-[320px] border-l border-gray-100 p-5 flex-shrink-0">
            <div className="bg-gradient-to-br from-[#AF140B] to-[#D91810] rounded-xl p-3 mb-3">
              <p className="text-white text-xs font-bold text-center">⭐ Sản phẩm nổi bật</p>
            </div>
            <div className="flex gap-3">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="flex-1 group cursor-pointer"
                >
                  <div className="bg-gray-50 rounded-lg p-2 mb-2 aspect-square flex items-center justify-center overflow-hidden">
                    <img
                      src={product.imageUrl || '/placeholder.png'}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 line-clamp-2 group-hover:text-[#AF140B] transition-colors leading-tight">
                    {product.name}
                  </p>
                  <p className="text-xs font-bold text-[#AF140B] mt-1">
                    {formatPrice(product.minPrice)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
