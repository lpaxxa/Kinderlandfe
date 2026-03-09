import { api } from './api';

// ---- Types ----

export interface Product {
    id: number;
    name: string;
    description: string;
    minPrice: number;
    imageUrl: string;
    categoryName: string;
    brandName: string;
}

export interface ProductPayload {
    categoryId: number;
    brandId: number;
    name: string;
    description: string;
    imageUrl: string;
}

// ---- API ----

export const productApi = {
    /**
     * GET /api/v1/products
     * Returns all products
     */
    getAll: async (): Promise<Product[]> => {
        const response = await api.get('/api/v1/products');
        return response.data;
    },

    /**
     * POST /api/v1/products
     * Create a new product
     */
    create: async (payload: ProductPayload): Promise<Product> => {
        const response = await api.post('/api/v1/products', payload);
        return response.data;
    },

    /**
     * PUT /api/v1/products/{id}
     * Update an existing product
     */
    update: async (id: number, payload: ProductPayload): Promise<Product> => {
        const response = await api.put(`/api/v1/products/${id}`, payload);
        return response.data;
    },

    /**
     * DELETE /api/v1/products/{id}
     * Delete a product by ID
     */
    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/v1/products/${id}`);
    },

    /**
     * GET /api/v1/products/view-detail/{id}
     * Get detailed information for a single product
     */
    getDetail: async (id: number): Promise<any> => {
        const response = await api.get(`/api/v1/products/view-detail/${id}`);
        return response.data;
    }
};
