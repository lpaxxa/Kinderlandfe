import { authenticatedFetch } from './api';

export interface OrderItemDTO {
    orderItemId: number;
    skuId: number;
    size: string;
    color: string;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface CustomerDTO {
    id: number;
    fullName: string;
    email: string;
}

export interface OrderResponseDTO {
    orderId: number;
    orderStatus: string;
    totalAmount: number;
    customer: CustomerDTO;
    items: OrderItemDTO[];
    shippingAddress: string;
}

export interface CheckoutRequest {
    paymentMethod: 'COD' | 'VNPAY';
    pointsToUse?: number;
}

const BASE = '/api/v1/orders';

const handleJson = async (res: Response) => {
    if (!res.ok) {
        const text = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
};

export const orderApi = {
    /**
     * POST /api/v1/orders/create?addressId={addressId}
     * Creates an order from the current user's cart using the given address.
     */
    createOrderFromCart: async (addressId: number): Promise<OrderResponseDTO> => {
        const res = await authenticatedFetch(`${BASE}/create?addressId=${addressId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const body = await handleJson(res);
        return body?.data ?? body;
    },

    /**
     * POST /api/v1/orders/{orderId}/checkout
     * Completes checkout. For COD returns null paymentUrl, for VNPAY returns a redirect URL.
     */
    checkout: async (orderId: number, payload: CheckoutRequest): Promise<string | null> => {
        const res = await authenticatedFetch(`${BASE}/${orderId}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const body = await handleJson(res);
        // body.data is the payment URL (string) for VNPAY, or null for COD
        return body?.data ?? null;
    },

    /** GET /api/v1/orders/my-orders */
    getMyOrders: async (): Promise<OrderResponseDTO[]> => {
        const res = await authenticatedFetch(`${BASE}/my-orders`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const body = await handleJson(res);
        return body?.data ?? [];
    },

    /** GET /api/v1/orders/{id} */
    getOrderById: async (id: number): Promise<OrderResponseDTO> => {
        const res = await authenticatedFetch(`${BASE}/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const body = await handleJson(res);
        return body?.data ?? body;
    },

    /** PUT /api/v1/orders/{orderId}/cancel */
    cancelOrder: async (orderId: number): Promise<void> => {
        const res = await authenticatedFetch(`${BASE}/${orderId}/cancel`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        });
        await handleJson(res);
    },
};
