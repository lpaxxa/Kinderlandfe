// SKU API Service
import { api } from './api';

// --- Types ---

export interface SkuItem {
    id: number;
    skuCode: string;
    size: string;
    color: string;
    price: number;
    productId: number;
    productName: string;
}

export interface SkuResponse {
    timestamp: string;
    statusCode: number;
    apiPath: string;
    message: string;
    data: SkuItem;
    success: boolean;
}

export interface UpdateSkuPayload {
    skuCode?: string;
    size?: string;
    color?: string;
    price: number;
}

// --- API ---

export const skuApi = {
    /**
     * Lấy thông tin chi tiết một SKU
     * GET /api/v1/sku/{id}
     */
    getSkuById: async (id: number): Promise<SkuItem> => {
        const response: SkuResponse = await api.get(`/api/v1/sku/${id}`);
        return response.data;
    },

    /**
     * Cập nhật thông tin SKU (giá, size, màu sắc...)
     * PUT /api/v1/sku/{id}
     */
    updateSku: async (id: number, payload: UpdateSkuPayload): Promise<SkuItem> => {
        const response: SkuResponse = await api.put(`/api/v1/sku/${id}`, payload);
        return response.data;
    },
};

export default skuApi;
