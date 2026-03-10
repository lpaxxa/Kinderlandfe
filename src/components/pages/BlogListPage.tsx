import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Calendar, Clock, User, BookOpen, Loader2 } from "lucide-react";
import { blogApi, BlogItem } from "../../services/blogApi";

export default function BlogListPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [blogList, setBlogList] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    blogApi.getBlogs(0, 50)
      .then((data) => setBlogList(data))
      .catch((err) => setError(err.message || "Không thể tải bài viết"))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    "all",
    ...Array.from(new Set(blogList.map((b) => b.categoryName))),
  ];

  const filteredBlogs =
    selectedCategory === "all"
      ? blogList
      : blogList.filter((b) => b.categoryName === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-3 text-gray-500">
        <Loader2 className="size-6 animate-spin" />
        <span>Đang tải bài viết...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 font-semibold text-lg mb-2">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#AF140B] text-white rounded-xl font-semibold"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#AF140B] via-[#D91810] to-[#AF140B] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full mb-4 backdrop-blur-sm">
            <BookOpen className="size-6" />

            <span className="font-bold text-lg">
              BLOG KINDERLAND
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Kiến Thức Nuôi Dạy Con
          </h1>
          <p className="text-xl text-white/90">
            Chia sẻ kinh nghiệm và kiến thức hữu ích về đồ chơi
            và phát triển trẻ em
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-4">
            Danh mục:
          </h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full font-semibold transition-all ${selectedCategory === category
                  ? "bg-[#AF140B] text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-[#FFE5E3] border border-gray-200"
                  }`}
              >
                {category === "all" ? "Tất cả" : category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Blog */}
        {filteredBlogs.length > 0 && (
          <Link
            to={`/blog/${filteredBlogs[0].blogId}`}
            className="block mb-12 group"
          >
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-[#AF140B]">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="aspect-video md:aspect-auto overflow-hidden">
                  <img
                    src={filteredBlogs[0].imageUrl}
                    alt={filteredBlogs[0].title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="inline-block bg-gradient-to-r from-[#AF140B] to-[#D91810] text-white px-4 py-2 rounded-full text-sm font-bold mb-4 w-fit">
                    BÀI VIẾT NỔĨ BẬT
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4 group-hover:text-[#AF140B] transition-colors">
                    {filteredBlogs[0].title}
                  </h2>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {filteredBlogs[0].content}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      <span>{filteredBlogs[0].authorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>
                        {formatDate(filteredBlogs[0].publishedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4" />
                      <span>{filteredBlogs[0].timeRead} phút đọc</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.slice(1).map((blog) => (
            <Link
              key={blog.blogId}
              to={`/blog/${blog.blogId}`}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all group border-2 border-gray-200 hover:border-[#AF140B]"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="inline-block bg-[#FFE5E3] text-[#AF140B] px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  {blog.categoryName}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-[#AF140B] transition-colors">
                  {blog.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog.content}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <User className="size-4" />
                    <span>{blog.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>{blog.timeRead} phút đọc</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              Không tìm thấy bài viết nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
}