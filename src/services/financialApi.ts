// Financial API Service
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

export interface FinancialOverviewData {
    totalRevenue: number;
    todayRevenue: number;
    thisMonthRevenue: number;
}

export interface FinancialOverviewResponse {
    timestamp: string;
    statusCode: number;
    apiPath: string;
    message: string;
    data: FinancialOverviewData;
    success: boolean;
}

// --- API ---

export const financialApi = {
    /**
     * Lấy tổng quan tài chính (doanh thu tổng, hôm nay, tháng này)
     * GET /api/v1/financial/overview
     */
    getFinancialOverview: async (): Promise<FinancialOverviewData> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/financial/overview`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json: FinancialOverviewResponse = await response.json();
        return json.data;
    },
};

export default financialApi;
