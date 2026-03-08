import { api } from './api';

// ---- Types ----

export interface Review {
    id: number;
    accountId: number;
    rating: number;
    comment: string;
    createdAt: string;
    productName: string;
}

export interface ReviewUpdatePayload {
    rating: number;
    comment: string;
}

// ---- API ----

export const reviewApi = {
    /**
     * GET /api/reviews/product/{productId}
     * Returns reviews for a specific product
     */
    getByProduct: async (productId: number): Promise<Review[]> => {
        const response = await api.get(`/api/reviews/product/${productId}`);
        // BaseResponse<List<ReviewResponseDTO>>
        return response.data;
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
