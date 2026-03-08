// SKU API Service
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
        const response = await fetch(`${API_BASE_URL}/api/v1/sku/${id}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json: SkuResponse = await response.json();
        return json.data;
    },

    /**
     * Cập nhật thông tin SKU (giá, size, màu sắc...)
     * PUT /api/v1/sku/{id}
     */
    updateSku: async (id: number, payload: UpdateSkuPayload): Promise<SkuItem> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/sku/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json: SkuResponse = await response.json();
        return json.data;
    },
};

export default skuApi;
