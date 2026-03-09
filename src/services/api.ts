// API Service utility for making HTTP requests with automatic JWT refresh
// Vite proxy forward /api/* → http://localhost:8080 (xem vite.config.ts)
const API_BASE_URL = "";

// Track refresh token requests to avoid multiple concurrent refreshes
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// Process queued requests after token refresh
const processQueue = (error?: any, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Refresh JWT access token using refresh token
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.data?.accessToken) {
      throw new Error('Invalid refresh token response');
    }

    const { accessToken, refreshToken: newRefreshToken } = data.data;
    
    // Update tokens in localStorage
    localStorage.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return accessToken;
  } catch (error) {
    // Clear tokens on refresh failure
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login page
    window.location.href = '/login';
    throw error;
  }
};

// Enhanced fetch with automatic token refresh
const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // List of endpoints that should NOT have auth headers
  const publicEndpoints = [
    '/api/v1/auth/login',
    '/api/v1/auth/login/google', 
    '/api/v1/auth/register',
    '/api/v1/auth/refresh'
  ];
  
  // Check if this is a public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));
  
  // Only add auth headers for protected endpoints
  if (!isPublicEndpoint) {
    const accessToken = localStorage.getItem('accessToken');
    
    // Add Authorization header if token exists
    if (accessToken) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
      };
    }
  }

  let response = await fetch(url, options);

  // Handle token expiration (only for protected endpoints)
  if (response.status === 401 && !isPublicEndpoint) {
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
          };
          return fetch(url, options);
        });
      }

      // Start refresh process
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        
        // Retry original request with new token
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        };
        response = await fetch(url, options);
      } catch (refreshError) {
        processQueue(refreshError);
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }
  }

  return response;
};

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

  /**
   * Register new user
   * @param userData - User registration data
   */
  register: async (userData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Registration failed");
      }

      return await response.json();
    } catch (error) {
      console.error('Registration API error:', error);
      throw error;
    }
  },

  /**
   * Refresh access token manually (if needed)
   */
  refreshToken: async () => {
    return await refreshAccessToken();
  },

  /**
   * Generic GET request with automatic token refresh
   * @param endpoint - API endpoint (without base URL)
   */
  get: async (endpoint: string) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
   * Generic POST request with automatic token refresh
   * @param endpoint - API endpoint (without base URL)
   * @param data - Request body data
   */
  post: async (endpoint: string, data: any) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  /**
   * Generic PUT request with automatic token refresh
   * @param endpoint - API endpoint (without base URL) 
   * @param data - Request body data
   */
  put: async (endpoint: string, data: any) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  },

  /**
   * Generic DELETE request with automatic token refresh
   * @param endpoint - API endpoint (without base URL)
   */
  delete: async (endpoint: string) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  },

  /**
   * Generic PATCH request with automatic token refresh
   * @param endpoint - API endpoint (without base URL)
   * @param data - Request body data
   */
  patch: async (endpoint: string, data: any) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API PATCH error:', error);
      throw error;
    }
  },
};

/**
 * Utility functions for token management
 */
export const authUtils = {
  /**
   * Check if access token is expired
   */
  isTokenExpired: (): boolean => {
    const token = localStorage.getItem('accessToken');
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  },

  /**
   * Check if user is logged in (has valid tokens)
   */
  isLoggedIn: (): boolean => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return !!(accessToken && refreshToken);
  },

  /**
   * Get current user role from token
   */
  getUserRole: (): string | null => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || payload.authorities?.[0] || null;
    } catch (error) {
      console.error('Error parsing token for role:', error);
      return null;
    }
  },

  /**
   * Get current user email from token
   */
  getUserEmail: (): string | null => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.email || null;
    } catch (error) {
      console.error('Error parsing token for email:', error);
      return null;
    }
  },

  /**
   * Clear all tokens and logout
   */
  logout: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Clear any other user-related data if needed
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login';
  },

  /**
   * Get token info for debugging
   */
  getTokenInfo: (): any => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        payload,
        isExpired: authUtils.isTokenExpired(),
        expiresAt: new Date(payload.exp * 1000),
        timeUntilExpiry: payload.exp * 1000 - Date.now(),
      };
    } catch (error) {
      console.error('Error parsing token info:', error);
      return null;
    }
  }
};

export default api;
