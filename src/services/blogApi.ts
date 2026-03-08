// Blog API Service
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

// --- Types (khớp chính xác với BE response) ---

export interface BlogItem {
    blogId: number;
    accountId: number;
    authorName: string;
    title: string;
    content: string;
    categoryId: number;
    categoryName: string;
    status: boolean;
    publishedAt: string;
    createdAt: string;
    updatedAt: string | null;
    imageUrl: string;
    timeRead: number;
}

export interface BlogListResponse {
    timestamp: string;
    statusCode: number;
    apiPath: string;
    message: string;
    data: {
        content?: BlogItem[];
        items?: BlogItem[];
        totalElements?: number;
        totalPages?: number;
        size?: number;
        number?: number;
    } | BlogItem[];
    success: boolean;
}

export interface BlogDetailResponse {
    timestamp: string;
    statusCode: number;
    apiPath: string;
    message: string;
    data: BlogItem;
    success: boolean;
}

// --- API ---

export const blogApi = {
    /**
     * Lấy danh sách blogs
     * GET /api/v1/blogs?page=0&size=20
     */
    getBlogs: async (page = 0, size = 20): Promise<BlogItem[]> => {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/blogs?page=${page}&size=${size}`,
            {
                method: "GET",
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json: BlogListResponse = await response.json();

        // Xử lý nhiều dạng response từ BE
        const raw = json.data;
        if (Array.isArray(raw)) return raw;
        if (raw && Array.isArray((raw as any).content)) return (raw as any).content;
        if (raw && Array.isArray((raw as any).items)) return (raw as any).items;
        return [];
    },

    /**
     * Lấy chi tiết một blog theo ID
     * GET /api/v1/blogs/{id}
     */
    getBlogById: async (id: number | string): Promise<BlogItem> => {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/blogs/${id}`,
            {
                method: "GET",
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json: BlogDetailResponse = await response.json();
        return json.data;
    },
};

export default blogApi;
