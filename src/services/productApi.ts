import api from './api';

// ---- Types ----

export interface Product {
    id: number;
    name: string;
    description: string;
    minPrice: number;
    imageUrl: string;
    categoryName: string;
    brandName: string;
    active?: boolean;
    promotion?: {
        discountPercent: number;
    };
}

export interface ProductPayload {
    categoryId: number;
    brandId: number;
    name: string;
    description: string;
    imageUrl: string;
}

export interface ProductSearchParams {
    keyword?: string;
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
}

// Helper to normalize API response into Product[]
const normalizeProducts = (res: any): Product[] => {
    if (res?.data?.content && Array.isArray(res.data.content)) return res.data.content;
    if (res?.content && Array.isArray(res.content)) return res.content;
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    return [];
};

export interface PageResult<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

const normalizePage = <T>(res: any): PageResult<T> => {
    const data = res?.data || res;
    if (data?.content !== undefined) {
        return {
            content: data.content,
            totalPages: data.totalPages || 0,
            totalElements: data.totalElements || 0,
            number: data.number || 0,
            size: data.size || 0,
        };
    }
    return {
        content: normalizeProducts(res) as unknown as T[],
        totalPages: 1,
        totalElements: normalizeProducts(res).length,
        number: 0,
        size: normalizeProducts(res).length,
    };
};

// ---- API ----

export const productApi = {
    /**
     * GET /api/v1/products
     * Returns all products (paginated)
     */
    getAll: async (page = 0, size = 10): Promise<PageResult<Product>> => {
        const res = await api.get(`/api/v1/products?page=${page}&size=${size}`);
        return normalizePage(res);
    },

    /**
     * GET /api/v1/products/browse
     * Browse products (public, paginated)
     */
    browse: async (params?: ProductSearchParams): Promise<PageResult<Product>> => {
        const queryParts: string[] = [];
        if (params?.keyword) queryParts.push(`keyword=${encodeURIComponent(params.keyword)}`);
        if (params?.categoryId) queryParts.push(`categoryId=${params.categoryId}`);
        if (params?.brandId) queryParts.push(`brandId=${params.brandId}`);
        if (params?.minPrice) queryParts.push(`minPrice=${params.minPrice}`);
        if (params?.maxPrice) queryParts.push(`maxPrice=${params.maxPrice}`);
        if (params?.page !== undefined) queryParts.push(`page=${params.page}`);
        if (params?.size !== undefined) queryParts.push(`size=${params.size}`);
        const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
        const res = await api.get(`/api/v1/products/browse${query}`);
        return normalizePage(res);
    },

    /**
     * GET /api/v1/products/search
     * Search products by keyword
     */
    search: async (keyword: string, page = 0, size = 10): Promise<PageResult<Product>> => {
        const res = await api.get(`/api/v1/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
        return normalizePage(res);
    },

    /**
     * GET /api/v1/products/view-detail/{id}
     * Get detailed information for a single product
     */
    getDetail: async (id: number): Promise<any> => {
        const res = await api.get(`/api/v1/products/view-detail/${id}`);
        return res?.data ?? res;
    },

    /**
     * POST /api/v1/products
     * Create a new product
     */
    create: async (payload: ProductPayload): Promise<Product> => {
        const res = await api.post('/api/v1/products', payload);
        return res?.data ?? res;
    },

    /**
     * PUT /api/v1/products/{id}
     * Update an existing product
     */
    update: async (id: number, payload: ProductPayload): Promise<Product> => {
        const res = await api.put(`/api/v1/products/${id}`, payload);
        return res?.data ?? res;
    },

    /**
     * DELETE /api/v1/products/{id}
     * Delete a product by ID
     */
    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/v1/products/${id}`);
    },
};
