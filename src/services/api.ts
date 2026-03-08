// API Service utility for making HTTP requests

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in .env file');
}

export const api = {
  /**
   * Login with email & password
   */
  loginWithEmail: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Login failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Login API error:", error);
      throw error;
    }
  },


  /**
   * Login with Google
   * @param credential - Google OAuth credential token
   */
  loginWithGoogle: async (credential: string) => {
    try {
      console.log('Sending to backend:', {
        url: `${API_BASE_URL}/auth/login/google`,
        tokenLength: credential?.length || 0
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: credential }),
      });

      console.log('Backend response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Backend error response:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend success response:', data);
      return data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  addWishlist: async (productId: number) => {
    try {
      console.log('Sending to wishlist productId:', productId);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Vui lòng đăng nhập để sử dụng tính năng này");
      }

      console.log('Request body:', JSON.stringify({ productId: productId }));

      const response = await fetch(`${API_BASE_URL}/api/v1/wishlist/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: productId,
        }),
      });

      if (!response.ok) {
        let errorData = `HTTP error! status: ${response.status}`;
        try {
          const resText = await response.text();
          if (resText) errorData = resText;
        } catch (e) {}
        throw new Error(errorData);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  removeWishlist: async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Vui lòng đăng nhập để sử dụng tính năng này");
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/wishlist/items/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Wishlist API delete error:", error);
      throw error;
    }
  },

  // --- CART APIs ---
  getCart: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Vui lòng đăng nhập");

      const response = await fetch(`${API_BASE_URL}/api/v1/cart`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log("Cart API Response (GET):", data);
      return data;
    } catch (error) {
      console.error("Cart API GET error:", error);
      throw error;
    }
  },

  addToCart: async (skuId: number, quantity: number, storeId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Vui lòng đăng nhập để sử dụng tính năng này");

      console.log('Adding to cart:', { skuId, quantity, storeId });

      const response = await fetch(`${API_BASE_URL}/api/v1/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skuId: skuId,
          quantity: quantity,
          storeId: storeId
        }),
      });

      if (!response.ok) {
        let errorData = `HTTP error! status: ${response.status}`;
        try {
          const resText = await response.text();
          if (resText) errorData = resText;
        } catch (e) {}
        throw new Error(errorData);
      }

      const data = await response.json();
      console.log("Cart API Response (POST add):", data);
      return data;
    } catch (error) {
      throw error;
    }
  },

  updateCartItem: async (cartItemId: number, quantity: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Vui lòng đăng nhập");

      console.log(`Updating cart item: ${cartItemId} with quantity: ${quantity}. Token present: ${!!token}`);
      // Use query parameter as per documentation screenshot
      const endpoint = `/api/v1/cart/${cartItemId}?quantity=${quantity}`;
      return await api.put(endpoint, {});
    } catch (error) {
      throw error;
    }
  },

  removeCartItem: async (cartItemId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Vui lòng đăng nhập");

      console.log(`Removing cart item: ${cartItemId}. Token present: ${!!token}`);
      const response = await fetch(`${API_BASE_URL}/api/v1/cart/${cartItemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log("Cart API Response (DELETE):", data);
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generic GET request
   * @param endpoint - API endpoint (without base URL)
   */
  get: async (endpoint: string) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },

  /**
   * Generic POST request
   * @param endpoint - API endpoint (without base URL)
   * @param data - Request body data
   */
  post: async (endpoint: string, data: any) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  put: async (endpoint: string, data: any) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API PUT error:", error);
      throw error;
    }
  },

  /**
   * Get inventory availability for a product or specific SKU
   */
  getInventoryAvailability: async (skuId?: number, productId?: number) => {
    try {
      let url = `${API_BASE_URL}/api/v1/inventory/availability`;
      const params = new URLSearchParams();
      if (skuId) params.append('skuId', skuId.toString());
      if (productId) params.append('productId', productId.toString());
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Inventory Availability API error:", error);
      throw error;
    }
  },

  /**
   * Get user's addresses
   */
  getMyAddresses: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Vui lòng đăng nhập");

      const response = await fetch(`${API_BASE_URL}/api/v1/address/my-addresses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Get addresses API error:", error);
      throw error;
    }
  },

  /**
   * Create a new order
   */
  createOrder: async (addressId: number, storeId: number, items: any[]) => {
    try {
      const endpoint = `/api/v1/orders/create?addressId=${addressId}&storeId=${storeId}`;
      console.log("Creating order through api.post:", endpoint, items);
      return await api.post(endpoint, items);
    } catch (error) {
      console.error("Create order API error:", error);
      throw error;
    }
  },

  /**
   * Get nearby stores based on coordinates
   */
  getNearbyStores: async (lat: number, lng: number, radius: number = 20) => {
    try {
      const endpoint = `/api/v1/stores/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
      return await api.get(endpoint);
    } catch (error) {
      console.error("Get nearby stores API error:", error);
      throw error;
    }
  },

  /**
   * Initiate checkout for an order
   */
  checkoutOrder: async (orderId: number, paymentMethod: string = "VNPAY") => {
    try {
      const endpoint = `/api/v1/orders/${orderId}/checkout`;
      console.log("Initiating checkout through api.post:", endpoint, { paymentMethod });
      return await api.post(endpoint, { paymentMethod });
    } catch (error) {
      console.error("Checkout order API error:", error);
      throw error;
    }
  },

  /**
   * Get current user's orders
   */
  getMyOrders: async () => {
    try {
      return await api.get('/api/v1/orders/my-orders');
    } catch (error) {
      console.error("Get my orders API error:", error);
      throw error;
    }
  },

  /**
   * Update order status (e.g., cancel, return)
   */
  updateOrderStatus: async (orderId: number | string, status: string) => {
    try {
      // Based on Swagger: /api/v1/orders/{orderId}/status?status={status}
      const endpoint = `/api/v1/orders/${orderId}/status?status=${status}`;
      return await api.put(endpoint, {});
    } catch (error) {
      console.error("Update order status API error:", error);
      throw error;
    }
  },

};

export default api;
