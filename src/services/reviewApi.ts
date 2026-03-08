// Review API Service
// Vite proxy forward /api/* → http://localhost:8080/api/*

const API_BASE_URL = "";

// --- Helper: get token ---
const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("accessToken");
    return {
        "Content-Type": "application/json",
        Accept: "*/*",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// --- Types ---

export interface ReviewItem {
    id: number;
    accountId: number;
    rating: number;
    comment: string;
    createdAt: string;
    productName: string;
}

export interface ReviewListResponse {
    timestamp: string;
    statusCode: number;
    apiPath: string;
    message: string;
    data: ReviewItem[];
    success: boolean;
}

// --- API ---

export const reviewApi = {
    /**
     * Lấy danh sách đánh giá theo productId
     * GET /api/reviews/product/{productId}
     */
    getReviewsByProduct: async (productId: number): Promise<ReviewItem[]> => {
        const response = await fetch(
            `${API_BASE_URL}/api/reviews/product/${productId}`,
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
     * Chỉnh sửa một đánh giá (manager/admin)
     * PUT /api/reviews/edit/{reviewId}?rating={rating}&comment={comment}
     */
    editReview: async (reviewId: number, rating: number, comment: string): Promise<ReviewItem> => {
        const params = new URLSearchParams({
            rating: String(rating),
            comment,
        });
        const response = await fetch(
            `${API_BASE_URL}/api/reviews/edit/${reviewId}?${params.toString()}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json: { data: ReviewItem } = await response.json();
        return json.data;
    },
};

export default reviewApi;
