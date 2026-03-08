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

export interface AdminAccount {
    id: number;
    username: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    active: boolean;
}

export interface CreateAccountPayload {
    username: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    password: string;
    role: string; // "ADMIN" | "MANAGER" | "STAFF" (no ROLE_ prefix)
}

interface ApiResponse<T> {
    timestamp: string;
    statusCode: number;
    apiPath: string;
    message: string;
    data: T;
    success: boolean;
}

// ---- API ----

export const adminAccountApi = {
    /**
     * GET /api/v1/admin/accounts
     * Returns all user accounts (admin only)
     */
    getAccounts: async (): Promise<AdminAccount[]> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/accounts`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}`);
        }
        const json: ApiResponse<AdminAccount[]> = await response.json();
        return json.data;
    },

    /**
     * POST /api/v1/admin/accounts/create
     * Create a new user account
     */
    createAccount: async (payload: CreateAccountPayload): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/accounts/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}`);
        }
    },

    /**
     * DELETE /api/v1/admin/accounts/{id}
     * Delete a user account by ID
     */
    deleteAccount: async (id: number): Promise<void> => {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/accounts/delete/${id}`, {
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
};
