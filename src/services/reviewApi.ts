import { api } from './api';

// ---- Types ----

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

export interface ReviewSingleResponse {
    timestamp: string;
    statusCode: number;
    apiPath: string;
    message: string;
    data: ReviewItem;
    success: boolean;
}

// --- API ---

export const reviewApi = {
    /**
     * Lấy tất cả đánh giá (Manager)
     * GET /api/v1/reviews
     */
    getAllReviews: async (): Promise<ReviewItem[]> => {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/reviews`,
            {
                method: "GET",
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json: ReviewListResponse = await response.json();
        return json.data;
    },

    /**
     * Lấy danh sách đánh giá theo productId
     * GET /api/reviews/product/{productId}
     * Returns reviews for a specific product
     */
    getByProduct: async (productId: number): Promise<Review[]> => {
        const response = await api.get(`/api/reviews/product/${productId}`);
        // BaseResponse<List<ReviewResponseDTO>>
        return response.data;
    },

    /**
     * Trả lời đánh giá (Manager)
     * POST /api/v1/reviews/{reviewId}/reply?reply={reply}
     */
    replyToReview: async (reviewId: number, reply: string): Promise<ReviewItem> => {
        const params = new URLSearchParams({ reply });
        const response = await fetch(
            `${API_BASE_URL}/api/v1/reviews/${reviewId}/reply?${params.toString()}`,
            {
                method: "POST",
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json: ReviewSingleResponse = await response.json();
        return json.data;
    },

    /**
     * Xóa đánh giá (Manager)
     * DELETE /api/v1/reviews/{reviewId}
     */
    deleteReview: async (reviewId: number): Promise<void> => {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/reviews/${reviewId}`,
            {
                method: "DELETE",
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
    },

    /**
     * PUT /api/reviews/edit/{reviewId}
     * Edit a review's rating and comment
     */
    edit: async (reviewId: number, payload: ReviewUpdatePayload): Promise<Review> => {
        // Backend uses @RequestParam for rating and comment
        const params = new URLSearchParams({
            rating: payload.rating.toString(),
            comment: payload.comment
        });
        const response = await api.put(`/api/reviews/edit/${reviewId}?${params.toString()}`, null);
        return response.data;
    }
};
