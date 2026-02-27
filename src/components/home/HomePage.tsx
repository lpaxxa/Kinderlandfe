import React from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Truck,
  Shield,
  Clock,
  Star,
  TrendingUp,
  BookOpen,
  Check,
  Gift,
  Heart,
  Sparkles as SparklesIcon,
} from "lucide-react";
import { products } from "../../data/products";
import { blogs } from "../../data/blogs";
import NewsletterModal from "../common/NewsletterModal";
import Logo from "../common/Logo";
import { HeroSection } from "../HeroSection";
import ProductCard from "../shop/ProductCard";
import { AboutSection } from "./AboutSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { BrandMarquee } from "./BrandMarquee";
import { TrustedUsers } from "./TrustedUsers";

export default function HomePage() {
  const [showNewsletterModal, setShowNewsletterModal] =
    React.useState(false);
  const categories = [
    {
      id: 1,
      name: "Mô hình & Robot",
      image:
        "https://images.unsplash.com/photo-1546776230-bb86256870ce?w=400",
      color: "from-[#AF140B] to-[#8D0F08]",
    },
    {
      id: 2,
      name: "Đồ chơi xếp hình",
      image:
        "https://images.unsplash.com/photo-1672267273720-053bee27b9a2?w=400",
      color: "from-[#D91810] to-[#AF140B]",
    },
    {
      id: 3,
      name: "Búp bê & Phụ kiện",
      image:
        "https://images.unsplash.com/photo-1612506001235-f0d0892aa11b?w=400",
      color: "from-[#AF140B] to-[#8D0F08]",
    },
    {
      id: 4,
      name: "Xe điều khiển",
      image:
        "https://images.unsplash.com/photo-1613404196612-e058bb5aa01a?w=400",
      color: "from-[#D91810] to-[#AF140B]",
    },
    {
      id: 5,
      name: "Thú nhồi bông",
      image:
        "https://images.unsplash.com/photo-1602734846297-9299fc2d4703?w=400",
      color: "from-[#AF140B] to-[#8D0F08]",
    },
    {
      id: 6,
      name: "Đồ chơi sáng tạo",
      image:
        "https://images.unsplash.com/photo-1727768351795-2390d19b2b41?w=400",
      color: "from-[#D91810] to-[#AF140B]",
    },
  ];

  const featuredProducts = products.slice(0, 6);
  const newArrivals = products.slice(6, 10);
  const featuredBlogs = blogs.slice(0, 3);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white">
      {/* About Section */}
      <AboutSection />

      {/* Brand Marquee */}
      <BrandMarquee />

      {/* Categories Section */}
      <section className="py-16 bg-[#FFFDF7]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#4A4A4A]">
              Danh Mục Sản Phẩm
            </h2>
            <Link
              to="/categories"
              className="text-[#AF140B] font-semibold hover:text-[#8D0F08] flex items-center gap-2"
            >
              Xem tất cả
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.name}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-square border-2 border-gray-200 hover:border-[#AF140B] transition-all shadow-md hover:shadow-xl">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-40 group-hover:opacity-50 transition-opacity`}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white font-bold text-center px-2 text-sm md:text-base">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#4A4A4A]">
              Sản Phẩm Nổi Bật
            </h2>
            <Link
              to="/products"
              className="text-[#AF140B] font-semibold hover:text-[#8D0F08] flex items-center gap-2"
            >
              Xem tất cả
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-[#FFFDF7]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-8 text-[#AF140B]" />
              <h2 className="text-3xl font-bold text-[#4A4A4A]">
                Hàng Mới Về
              </h2>
            </div>
            <Link
              to="/new-arrivals"
              className="text-[#AF140B] font-semibold hover:text-[#8D0F08] flex items-center gap-2"
            >
              Xem tất cả
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all group overflow-hidden border-2 border-gray-200 hover:border-[#AF140B]"
              >
                <div className="relative">
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute top-3 right-3 bg-[#AF140B] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    MỚI
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#AF140B] font-semibold mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-bold text-[#4A4A4A] mb-2 line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </h3>
                  <p className="text-[#AF140B] font-bold text-xl mb-2">
                    {formatPrice(product.price)}
                  </p>
                  <div className="text-sm text-gray-500">
                    Còn {product.stock} sản phẩm
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Banner CTA */}
      <section className="py-16 bg-gradient-to-r from-[#AF140B] to-[#8D0F08] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ưu Đãi Đặc Biệt Cuối Tuần
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Giảm giá lên đến 50% cho các sản phẩm được chọn lọc
          </p>
          <Link
            to="/discounts"
            className="inline-flex items-center gap-2 bg-white text-[#AF140B] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg"
          >
            Khám Phá Ngay
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="size-8 text-[#AF140B]" />
              <div>
                <h2 className="text-3xl font-bold text-[#4A4A4A]">
                  Blog Nuôi Dạy Con
                </h2>
                <p className="text-gray-600">
                  Kiến thức và kinh nghiệm hữu ích cho cha mẹ
                </p>
              </div>
            </div>
            <Link
              to="/blog"
              className="text-[#AF140B] font-semibold hover:text-[#8D0F08] flex items-center gap-2"
            >
              Xem tất cả
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredBlogs.map((blog) => (
              <Link
                key={blog.id}
                to={`/blog/${blog.id}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all group border-2 border-gray-200 hover:border-[#AF140B]"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#AF140B] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {blog.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#4A4A4A] mb-3 line-clamp-2 group-hover:text-[#AF140B] transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <span className="font-semibold">
                      {blog.author}
                    </span>
                    <span>{formatDate(blog.date)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Trusted Users */}
      <TrustedUsers />

      {/* Newsletter Modal */}
      <NewsletterModal
        show={showNewsletterModal}
        onClose={() => setShowNewsletterModal(false)}
      />
    </div>
  );
}