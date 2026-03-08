// Inventory API Service
// Vite proxy sẽ forward /api/* → http://localhost:8080/api/*
// Không cần ghi full URL để tránh CORS
const API_BASE_URL = "";

// --- Types ---

export interface StoreAvailability {
    storeId: number;
    storeName: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
    openingTime: string;
    closingTime: string;
    availabilityStatus: string;
}

export interface InventoryAvailabilityResponse {
    timestamp: string;
    statusCode: number;
    apiPath: string;
    message: string;
    data: StoreAvailability[];
    success: boolean;
}

// Inventory item from GET /api/v1/inventory
export interface InventoryItem {
    id: number;
    skuId: number;
    skuCode: string;
    quantity: number;
    storeId: number;
    storeName: string;
}

export interface InventoryListResponse {
    timestamp: string;
    statusCode: number;
    apiPath: string;
    message: string;
    data: InventoryItem[];
    success: boolean;
}

// --- Helper: get token from localStorage ---
const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("accessToken");
    return {
        "Content-Type": "application/json",
        Accept: "*/*",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// --- Inventory API ---

export const inventoryApi = {
    /**
     * Lấy danh sách cửa hàng có/còn hàng theo SKU
     * GET /api/v1/inventory/availability?skuId={skuId}
     */
    getStoreAvailability: async (
        skuId: number
    ): Promise<InventoryAvailabilityResponse> => {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/inventory/availability?skuId=${skuId}`,
            {
                method: "GET",
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                errorText || `HTTP error! status: ${response.status}`
            );
        }

        return response.json();
    },

    /**
     * Lấy toàn bộ danh sách tồn kho
     * GET /api/v1/inventory?storeId={storeId}
     */
    getAllInventory: async (storeId?: number | string): Promise<InventoryItem[]> => {
        // Use passed storeId, fall back to localStorage
        const sid = storeId ?? localStorage.getItem("storeId");
        const query = sid ? `?storeId=${sid}` : '';
        const url = `${API_BASE_URL}/api/v1/inventory${query}`;
        const headers = getAuthHeaders();
        console.log('[inventoryApi] getAllInventory URL:', url);
        console.log('[inventoryApi] Auth header present:', !!(headers as Record<string, string>).Authorization);
        const response = await fetch(url, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json: InventoryListResponse = await response.json();
        return json.data;
    },

    /**
     * Điều chỉnh số lượng tồn kho
     * POST /api/v1/inventory/adjust?storeId={storeId}&skuId={skuId}&quantity={quantity}
     */
    adjustInventory: async (storeId: number, skuId: number, quantity: number): Promise<void> => {
        const params = new URLSearchParams({
            storeId: String(storeId),
            skuId: String(skuId),
            quantity: String(quantity),
        });
        const response = await fetch(`${API_BASE_URL}/api/v1/inventory/adjust?${params.toString()}`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
    },

    /**
     * Thanh lý / báo cáo hàng lỗi
     * POST /api/v1/inventory/dispose?storeId={storeId}&skuId={skuId}&quantity={quantity}
     */
    disposeInventory: async (storeId: number, skuId: number, quantity: number): Promise<void> => {
        const params = new URLSearchParams({
            storeId: String(storeId),
            skuId: String(skuId),
            quantity: String(quantity),
        });
        const response = await fetch(`${API_BASE_URL}/api/v1/inventory/dispose?${params.toString()}`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
    },

    /**
     * Yêu cầu chuyển kho giữa hai chi nhánh
     * POST /api/v1/inventory/transfer?fromStoreId={}&toStoreId={}&skuId={}&quantity={}
     */
    transferInventory: async (
        fromStoreId: number,
        toStoreId: number,
        skuId: number,
        quantity: number
    ): Promise<void> => {
        const params = new URLSearchParams({
            fromStoreId: String(fromStoreId),
            toStoreId: String(toStoreId),
            skuId: String(skuId),
            quantity: String(quantity),
        });
        const response = await fetch(`${API_BASE_URL}/api/v1/inventory/transfer?${params.toString()}`, {
            method: "POST",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
    },
};

export default inventoryApi;
