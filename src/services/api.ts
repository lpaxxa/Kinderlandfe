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
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        throw new Error("Vui lòng đăng nhập để sử dụng tính năng này");
      }

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Wishlist API error:", error);
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

};

export default api;
