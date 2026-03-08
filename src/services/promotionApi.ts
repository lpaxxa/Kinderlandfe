const API_BASE_URL = '';

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        Accept: '*/*',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// ---- Types ----

export interface PromotionProduct {
    id: number;
    name: string;
    description: string;
    minPrice: number;
    imageUrl: string;
    categoryName: string;
    brandName: string;
    promotion: string;
}

export interface Promotion {
    promotionId: number;
    title: string;
    description: string;
    code: string;
    discountPercent: number;
    startDate: string;
    endDate: string;
    products: PromotionProduct[];
}

export interface CreatePromotionPayload {
    title: string;
    description?: string;
    code: string;
    discountPercent: number;
    startDate: string; // ISO e.g. "2026-03-08T00:00:00"
    endDate: string;
}

export interface UpdatePromotionPayload extends CreatePromotionPayload {
    promotionId: number;
}

interface PagedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

interface ApiResponse<T> {
    timestamp: string;
    statusCode: number;
    message: string;
    data: T;
    success: boolean;
}

// ---- API ----

export const promotionApi = {
    /**
     * GET /api/v1/promotions?keyword=&page=0&size=20
     */
    getPromotions: async (params?: {
        keyword?: string;
        page?: number;
        size?: number;
    }): Promise<PagedResponse<Promotion>> => {
        const q = new URLSearchParams();
        if (params?.keyword) q.set('keyword', params.keyword);
        q.set('page', String(params?.page ?? 0));
        q.set('size', String(params?.size ?? 20));

        const response = await fetch(`${API_BASE_URL}/api/v1/promotions?${q}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}`);
        }
        const json: ApiResponse<PagedResponse<Promotion>> = await response.json();
        return json.data;
    },

    /**
     * POST /api/v1/promotions
     */
    createPromotion: async (payload: CreatePromotionPayload): Promise<Promotion> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/promotions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}`);
        }
        const json: ApiResponse<Promotion> = await response.json();
        return json.data;
    },

    /**
     * PUT /api/v1/promotions/{id}
     */
    updatePromotion: async (id: number, payload: CreatePromotionPayload): Promise<Promotion> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/promotions/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}`);
        }
        const json: ApiResponse<Promotion> = await response.json();
        return json.data;
    },

    /**
     * DELETE /api/v1/promotions/{id}
     */
    deletePromotion: async (id: number): Promise<void> => {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/api/v1/promotions/${id}`, {
            method: 'DELETE',
            headers: {
                Accept: '*/*',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}`);
        }
    },

    /**
     * POST /api/v1/promotions/{id}/assign-products
     * Assign product IDs to a promotion
     */
    assignProducts: async (promotionId: number, productIds: number[]): Promise<PromotionProduct[]> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/promotions/${promotionId}/assign-products`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productIds }),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}`);
        }
        const json: ApiResponse<PromotionProduct[]> = await response.json();
        return json.data;
    },
};
