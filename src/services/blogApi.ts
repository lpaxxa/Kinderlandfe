// Blog API Service
// Vite proxy forward /api/* → http://localhost:8080/api/*

import { authenticatedFetch } from './api';

const API_BASE_URL = "";

// --- Types ---

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

export interface AdminBlogPageResponse {
    content: BlogItem[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

export interface CreateBlogPayload {
    title: string;
    content: string;
    categoryName: string;  // hoặc categoryId: number nếu BE yêu cầu
    imageUrl?: string;
    timeRead?: number;
    status?: boolean;      // true = published, false = draft
}

// --- API ---

export const blogApi = {
    /**
     * [PUBLIC] Lấy danh sách blogs cho user
     * GET /api/v1/blogs?page=0&size=20
     */
    getBlogs: async (page = 0, size = 20): Promise<BlogItem[]> => {
        const response = await authenticatedFetch(
            `${API_BASE_URL}/api/v1/blogs?page=${page}&size=${size}`,
            { method: "GET", headers: { "Content-Type": "application/json", Accept: "*/*" } }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json: BlogListResponse = await response.json();

        const raw = json.data;
        if (Array.isArray(raw)) return raw;
        if (raw && Array.isArray((raw as any).content)) return (raw as any).content;
        if (raw && Array.isArray((raw as any).items)) return (raw as any).items;
        return [];
    },

    /**
     * [ADMIN] Lấy danh sách blogs cho admin (có token)
     * GET /api/v1/blogs/admin?page=0&size=20&keyword=...
     */
    getAdminBlogs: async (params?: {
        page?: number;
        size?: number;
        keyword?: string;
    }): Promise<AdminBlogPageResponse> => {
        const q = new URLSearchParams();
        q.set('page', String(params?.page ?? 0));
        q.set('size', String(params?.size ?? 20));
        if (params?.keyword) q.set('keyword', params.keyword);

        const response = await authenticatedFetch(
            `${API_BASE_URL}/api/v1/blogs/admin?${q}`,
            { method: "GET", headers: { "Content-Type": "application/json", Accept: "*/*" } }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        // Normalize: data có thể là paged object hoặc nằm trong json.data
        const raw = json.data ?? json;
        return {
            content: raw.content ?? raw.items ?? [],
            totalElements: raw.totalElements ?? 0,
            totalPages: raw.totalPages ?? 1,
            size: raw.size ?? 20,
            number: raw.number ?? 0,
            first: raw.first ?? true,
            last: raw.last ?? true,
        };
    },

    /**
     * Lấy chi tiết một blog theo ID
     * GET /api/v1/blogs/{id}
     */
    getBlogById: async (id: number | string): Promise<BlogItem> => {
        const response = await authenticatedFetch(
            `${API_BASE_URL}/api/v1/blogs/${id}`,
            { method: "GET", headers: { "Content-Type": "application/json", Accept: "*/*" } }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json: BlogDetailResponse = await response.json();
        return json.data;
    },

    /**
     * [ADMIN] Tạo bài viết mới
     * POST /api/v1/blogs
     */
    createBlog: async (payload: CreateBlogPayload): Promise<BlogItem> => {
        const response = await authenticatedFetch(
            `${API_BASE_URL}/api/v1/blogs`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "*/*" },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        return json.data as BlogItem;
    },

    /**
     * [ADMIN] Cập nhật bài viết
     * PUT /api/v1/blogs/{id}
     */
    updateBlog: async (id: number, payload: CreateBlogPayload): Promise<BlogItem> => {
        const response = await authenticatedFetch(
            `${API_BASE_URL}/api/v1/blogs/${id}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json", Accept: "*/*" },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        return json.data as BlogItem;
    },

    /**
     * [ADMIN] Xoá bài viết
     * DELETE /api/v1/blogs/{id}
     */
    deleteBlog: async (id: number): Promise<void> => {
        const response = await authenticatedFetch(
            `${API_BASE_URL}/api/v1/blogs/${id}`,
            {
                method: "DELETE",
                headers: { Accept: "*/*" },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
    },
};

export default blogApi;
