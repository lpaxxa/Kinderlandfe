import { api } from './api';

// ── Types ─────────────────────────────────────────────────

export interface Review {
    id: number;
    accountId: number;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: string;
    productName: string;
    productId: number;
    managerReply: string | null;
    managerReplyAt: string | null;
}

export interface ReviewUpdatePayload {
    rating: number;
    comment: string;
}

export interface AddReviewPayload {
    rating: number;
    comment: string;
}

// ── API ────────────────────────────────────────────────────

export const reviewApi = {
    /**
     * GET /api/reviews/product/{productId}
     * Lấy danh sách đánh giá theo sản phẩm
     */
    getByProduct: async (productId: number): Promise<Review[]> => {
        const response = await api.get(`/api/reviews/product/${productId}`);
        // supports { data: [...] } or [...] directly
        return Array.isArray(response) ? response : (response?.data ?? []);
    },

    /**
     * POST /api/reviews/add/{productId}
     * Gửi đánh giá mới (yêu cầu đã mua hàng)
     */
    addReview: async (productId: number, payload: AddReviewPayload): Promise<Review> => {
        const params = new URLSearchParams({
            rating: payload.rating.toString(),
            comment: payload.comment,
        });
        const response = await api.post(`/api/reviews/add/${productId}?${params.toString()}`, null);
        return response?.data ?? response;
    },

    /**
     * PUT /api/reviews/edit/{reviewId}
     * Chỉnh sửa đánh giá đã gửi
     */
    edit: async (reviewId: number, payload: ReviewUpdatePayload): Promise<Review> => {
        const params = new URLSearchParams({
            rating: payload.rating.toString(),
            comment: payload.comment,
        });
        const response = await api.put(`/api/reviews/edit/${reviewId}?${params.toString()}`, null);
        return response?.data ?? response;
    },

    // ── Manager-only APIs (kept for ReviewManagement) ──────

    /**
     * GET /api/v1/reviews  (manager)
     */
    getAllReviews: async (): Promise<Review[]> => {
        const response = await api.get('/api/v1/reviews');
        return response?.data ?? [];
    },

    /**
     * POST /api/v1/reviews/{reviewId}/reply  (manager)
     */
    replyToReview: async (reviewId: number, reply: string): Promise<Review> => {
        const response = await api.post(
            `/api/v1/reviews/${reviewId}/reply?reply=${encodeURIComponent(reply)}`,
            null
        );
        return response?.data ?? response;
    },

    /**
     * DELETE /api/v1/reviews/{reviewId}  (manager)
     */
    deleteReview: async (reviewId: number): Promise<void> => {
        await api.delete(`/api/v1/reviews/${reviewId}`);
    },
};
