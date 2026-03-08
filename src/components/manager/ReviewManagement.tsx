import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import {
    MessageSquare, ArrowLeft, LogOut, Search,
    Star, AlertCircle, Loader2, User, Calendar,
    Edit, CheckCircle,
} from 'lucide-react';
import { reviewApi, ReviewItem } from '../../services/reviewApi';

// --- Star Rating Display ---
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}`}
                />
            ))}
            <span className="ml-1 text-sm font-medium text-gray-700">{rating}/5</span>
        </div>
    );
}

// --- Rating Badge ---
function RatingBadge({ rating }: { rating: number }) {
    if (rating >= 4) return <Badge className="bg-green-100 text-green-700 border-green-200">Tích cực</Badge>;
    if (rating === 3) return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Trung bình</Badge>;
    return <Badge className="bg-red-100 text-red-700 border-red-200">Cần xử lý</Badge>;
}

// --- Skeleton ---
function SkeletonCard() {
    return (
        <div className="border rounded-xl p-4 animate-pulse space-y-3">
            <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
    );
}

export default function ReviewManagement() {
    const navigate = useNavigate();
    const { adminUser, logoutAdmin } = useAdmin();

    // Search state
    const [productIdInput, setProductIdInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [searchedProductId, setSearchedProductId] = useState<number | null>(null);

    // Filter
    const [filterRating, setFilterRating] = useState<'all' | 'good' | 'neutral' | 'bad'>('all');
    const [searchComment, setSearchComment] = useState('');

    // Edit dialog
    const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleLogout = () => {
        logoutAdmin();
        navigate('/admin/login');
    };

    const handleSearch = async () => {
        const id = parseInt(productIdInput.trim(), 10);
        if (isNaN(id) || id <= 0) {
            setError('Vui lòng nhập Product ID hợp lệ (số nguyên dương).');
            return;
        }
        setLoading(true);
        setError(null);
        setReviews([]);
        try {
            const result = await reviewApi.getReviewsByProduct(id);
            setReviews(result);
            setSearchedProductId(id);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Không thể tải đánh giá.');
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (review: ReviewItem) => {
        setEditingReview(review);
        setEditRating(review.rating);
        setEditComment(review.comment);
        setSaveError(null);
        setSaveSuccess(false);
    };

    const handleSaveEdit = async () => {
        if (!editingReview) return;
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        try {
            const updated = await reviewApi.editReview(editingReview.id, editRating, editComment);
            setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setSaveSuccess(true);
            setTimeout(() => { setEditingReview(null); setSaveSuccess(false); }, 1200);
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : 'Lưu thất bại.');
        } finally {
            setSaving(false);
        }
    };

    // Filtered reviews
    const filteredReviews = reviews.filter((r) => {
        const matchRating =
            filterRating === 'all' ||
            (filterRating === 'good' && r.rating >= 4) ||
            (filterRating === 'neutral' && r.rating === 3) ||
            (filterRating === 'bad' && r.rating <= 2);
        const matchComment = r.comment.toLowerCase().includes(searchComment.toLowerCase());
        return matchRating && matchComment;
    });

    // Stats
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;
    const goodCount = reviews.filter((r) => r.rating >= 4).length;
    const badCount = reviews.filter((r) => r.rating <= 2).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

            {/* Header */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#2C2C2C]">Quản Lý Đánh Giá</h1>
                                <p className="text-sm text-gray-600">
                                    {adminUser?.name} · {adminUser?.storeName || 'Tất cả chi nhánh'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => navigate('/manager/dashboard')} className="border-gray-300">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                            <Button variant="outline" onClick={handleLogout}
                                className="border-[#AF140B] text-[#AF140B] hover:bg-[#AF140B] hover:text-white">
                                <LogOut className="w-4 h-4 mr-2" />
                                Đăng xuất
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Search Card */}
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg text-[#2C2C2C]">Tra cứu đánh giá theo sản phẩm</CardTitle>
                        <CardDescription>Nhập Product ID để xem tất cả đánh giá của sản phẩm đó</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-3">
                            <div className="flex-1 max-w-xs">
                                <Label htmlFor="productId" className="mb-1 block">Product ID</Label>
                                <Input
                                    id="productId"
                                    type="number"
                                    min={1}
                                    value={productIdInput}
                                    onChange={(e) => {
                                        setProductIdInput(e.target.value);
                                        setError(null);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="VD: 1"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                disabled={loading || !productIdInput}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {loading
                                    ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    : <Search className="w-4 h-4 mr-2" />}
                                Tìm kiếm
                            </Button>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm mt-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stats Row — hiện sau khi có data */}
                {reviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Tổng đánh giá', value: reviews.length, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
                            { label: 'Điểm TB', value: `⭐ ${avgRating}`, color: 'text-[#D4AF37]', bg: 'bg-amber-50', border: 'border-amber-200' },
                            { label: 'Tích cực (≥4★)', value: goodCount, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                            { label: 'Cần xử lý (≤2★)', value: badCount, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                        ].map((s, i) => (
                            <Card key={i} className={`border ${s.border} shadow-sm`}>
                                <CardContent className="p-4">
                                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Filter bar */}
                {reviews.length > 0 && (
                    <Card className="border-0 shadow-md">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-wrap gap-3 items-center">
                                <span className="text-sm font-medium text-gray-600">Lọc:</span>
                                {([
                                    { key: 'all', label: 'Tất cả' },
                                    { key: 'good', label: '⭐ Tích cực' },
                                    { key: 'neutral', label: '🟡 Trung bình' },
                                    { key: 'bad', label: '🔴 Cần xử lý' },
                                ] as const).map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilterRating(f.key)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filterRating === f.key
                                            ? 'bg-purple-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                                <div className="ml-auto flex-1 min-w-[200px] max-w-xs">
                                    <Input
                                        placeholder="Tìm trong bình luận..."
                                        value={searchComment}
                                        onChange={(e) => setSearchComment(e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Reviews List */}
                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-[#2C2C2C]">
                                {searchedProductId
                                    ? `Đánh giá sản phẩm #${searchedProductId}`
                                    : 'Danh sách đánh giá'}
                                {filteredReviews.length > 0 && (
                                    <Badge className="ml-2 bg-purple-600 text-white">{filteredReviews.length}</Badge>
                                )}
                            </CardTitle>
                        </div>
                        <CardDescription>
                            {searchedProductId
                                ? `${reviews[0]?.productName ?? ''} — Hiện ${filteredReviews.length} / ${reviews.length} đánh giá`
                                : 'Nhập Product ID để tải đánh giá'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        )}

                        {!loading && reviews.length === 0 && !error && (
                            <div className="py-16 text-center text-gray-400">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>Chưa có đánh giá nào. Nhập Product ID ở trên để tra cứu.</p>
                            </div>
                        )}

                        {!loading && reviews.length > 0 && filteredReviews.length === 0 && (
                            <div className="py-12 text-center text-gray-400">
                                Không có đánh giá nào khớp bộ lọc.
                            </div>
                        )}

                        {!loading && filteredReviews.length > 0 && (
                            <div className="space-y-3">
                                {filteredReviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className={`border rounded-xl p-4 transition-all hover:shadow-sm ${review.rating <= 2
                                            ? 'border-red-200 bg-red-50/40'
                                            : review.rating >= 4
                                                ? 'border-green-200 bg-green-50/40'
                                                : 'border-gray-200 bg-gray-50/40'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                {/* Header row */}
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                        <User className="w-3.5 h-3.5" />
                                                        <span className="font-medium text-gray-700">User #{review.accountId}</span>
                                                    </div>
                                                    <span className="text-gray-300">·</span>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit',
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Star rating */}
                                                <div className="mb-2">
                                                    <StarRating rating={review.rating} />
                                                </div>

                                                {/* Comment */}
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {review.comment || <span className="italic text-gray-400">Không có bình luận</span>}
                                                </p>
                                            </div>

                                            {/* Badge + Edit */}
                                            <div className="flex-shrink-0 flex flex-col items-end gap-2">
                                                <RatingBadge rating={review.rating} />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEdit(review)}
                                                    className="border-purple-300 text-purple-600 hover:bg-purple-50 text-xs"
                                                >
                                                    <Edit className="w-3 h-3 mr-1" />
                                                    Sửa
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingReview} onOpenChange={(open: boolean) => !open && setEditingReview(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa đánh giá #{editingReview?.id}</DialogTitle>
                        <DialogDescription className="truncate">{editingReview?.productName}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label className="mb-2 block">Điểm đánh giá <span className="text-[#AF140B]">*</span></Label>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <button key={i} type="button" onClick={() => setEditRating(i + 1)}
                                        className="focus:outline-none transition-transform hover:scale-110">
                                        <Star className={`w-8 h-8 ${i < editRating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300 hover:text-[#D4AF37]'}`} />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-gray-600 font-medium">{editRating}/5</span>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-comment" className="mb-1 block">Bình luận</Label>
                            <textarea
                                id="edit-comment"
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                rows={4}
                                placeholder="Nội dung bình luận..."
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                            />
                        </div>
                        {saveError && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />{saveError}
                            </div>
                        )}
                        {saveSuccess && (
                            <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />Cập nhật thành công!
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingReview(null)} disabled={saving}>Hủy</Button>
                        <Button onClick={handleSaveEdit} disabled={saving || saveSuccess} className="bg-purple-600 hover:bg-purple-700">
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {saveSuccess ? 'Đã lưu ✓' : 'Lưu thay đổi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
