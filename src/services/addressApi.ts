import { authenticatedFetch } from './api';

export interface AddressRequest {
    street: string;
    provinceId: number;
    provinceName: string;
    districtId: number;
    districtName: string;
    wardId: number;
    wardName: string;
}

export interface AddressResponse {
    addressId: number;
    street: string;
    provinceName: string;
    districtName: string;
    wardName: string;
    provinceId: number;
    districtId: number;
    wardId: number;
    fullAddress: string;
}

const BASE = '/api/v1/address';

const handleJson = async (res: Response) => {
    if (!res.ok) {
        const text = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
};

export const addressApi = {
    /** GET /api/v1/address/my-addresses */
    getMyAddresses: async (): Promise<AddressResponse[]> => {
        const res = await authenticatedFetch(`${BASE}/my-addresses`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const body = await handleJson(res);
        // BaseResponse wraps the list inside .data
        return body?.data ?? body ?? [];
    },

    /** POST /api/v1/address/create */
    createAddress: async (payload: AddressRequest): Promise<AddressResponse> => {
        const res = await authenticatedFetch(`${BASE}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const body = await handleJson(res);
        return body?.data ?? body;
    },

    /** PUT /api/v1/address/update/{addressId} */
    updateAddress: async (addressId: number, payload: Partial<AddressRequest>): Promise<AddressResponse> => {
        const res = await authenticatedFetch(`${BASE}/update/${addressId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const body = await handleJson(res);
        return body?.data ?? body;
    },

    /** DELETE /api/v1/address/delete/{addressId} */
    deleteAddress: async (addressId: number): Promise<void> => {
        const res = await authenticatedFetch(`${BASE}/delete/${addressId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        await handleJson(res);
    },
};
