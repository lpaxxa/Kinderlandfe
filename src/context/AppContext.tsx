import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DEMO_CUSTOMERS } from '../data/users';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  name: string;
  phone?: string;
  role?: string;
  address?: string;
  membershipTier?: 'bronze' | 'silver' | 'gold';
  points?: number;
}

interface Voucher {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
}

interface AppContextType {
  setUser: (user: User | null) => void;
  user: User | null;
  login: (email: string, password: string) => void;
  register: (email: string, name: string) => void;
  logout: () => void;
  cart: any[];
  addToCart: (skuId: number, quantity: number, storeId: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  voucher: Voucher | null;
  applyVoucher: (code: string) => boolean;
  removeVoucher: () => void;
  wishlistCount: number;
  wishlistItems: any[];
  setWishlistItems: (items: any[]) => void;
  addWishlistItemGlobal: (item: any) => void;
  removeWishlistItemGlobal: (productId: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const MOCK_VOUCHERS: Voucher[] = [
  { code: 'GIAM10', discount: 10, type: 'percentage' },
  { code: 'GIAM50K', discount: 50000, type: 'fixed' },
  { code: 'FREESHIP', discount: 30000, type: 'fixed' },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(() => {
    // Restore user from localStorage on app init
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [cart, setCart] = useState<any[]>([]);
  const [voucher, setVoucher] = useState<Voucher | null>(null);

  // Wrapper to persist user to localStorage
  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  // Helper: parse all possible response shapes from cart API
  const normalizeCartItems = (res: any): any[] | null => {
    // Shape 1: { data: { items: [...] } }
    if (res?.data?.items && Array.isArray(res.data.items)) return res.data.items;
    // Shape 2: { data: [...] }
    if (res?.data && Array.isArray(res.data)) return res.data;
    // Shape 3: { items: [...] }
    if (res?.items && Array.isArray(res.items)) return res.items;
    // Shape 4: raw array
    if (Array.isArray(res)) return res;
    return null;
  };

  // Fetch cart and sync state
  const refreshCart = async () => {
    try {
      const res = await api.getCart();
      console.log("GET /api/v1/cart response:", res);
      const items = normalizeCartItems(res);
      if (items !== null) setCart(items);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  // Fetch Cart globally
  React.useEffect(() => {
    if (user && localStorage.getItem("accessToken")) {
      refreshCart();
    }
  }, [user]);

  const login = (email: string, password: string) => {
    // Check against demo customers
    const foundCustomer = DEMO_CUSTOMERS.find(
      (c) => c.email === email && c.password === password
    );

    if (foundCustomer) {
      setUser({
        id: foundCustomer.id,
        email: foundCustomer.email,
        username: foundCustomer.email.split('@')[0],
        firstName: foundCustomer.name.split(' ')[0],
        lastName: foundCustomer.name.split(' ').slice(1).join(' '),
        name: foundCustomer.name,
        phone: foundCustomer.phone,
        address: foundCustomer.address,
        membershipTier: foundCustomer.membershipTier,
        points: foundCustomer.points,
      });
    } else {
      // Fallback to mock login for any email
      const name = email.split('@')[0];
      setUser({
        id: '1',
        email,
        username: name,
        firstName: name,
        lastName: '',
        name: name,
        membershipTier: 'bronze',
        points: 0,
      });
    }
  };

  const register = (email: string, name: string) => {
    // Mock register
    setUser({
      id: '1',
      email,
      username: email.split('@')[0],
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' '),
      name,
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setCart([]);
    setVoucher(null);
    setWishlistItems([]);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const wishlistCount = wishlistItems.length;

  React.useEffect(() => {
    const fetchInitialWishlistCount = async () => {
      const token = localStorage.getItem("accessToken");
      if (token && user) {
        try {
          const res = await api.get("/api/v1/wishlist");
          let items = res.data || res.items || res;
          if (Array.isArray(items)) {
            setWishlistItems(items);
          } else if (items && Array.isArray(items.items)) {
            setWishlistItems(items.items);
          }
        } catch (error) {
          console.error("Failed to fetch initial wishlist count:", error);
        }
      }
    };
    fetchInitialWishlistCount();
  }, [user]);

  const addWishlistItemGlobal = (item: any) => {
    setWishlistItems(prev => {
      // Avoid duplicates
      const exists = prev.some(i => (i.productId || i.id) === (item.productId || item.id));
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeWishlistItemGlobal = (productId: number) => {
    setWishlistItems(prev => prev.filter(item => (item.productId || item.id) !== productId));
  };

  // POST /api/v1/cart/add
  const addToCart = async (skuId: number, quantity: number, storeId: number) => {
    if (!user) {
      throw new Error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
    }
    console.log("POST /api/v1/cart/add", { skuId, quantity, storeId });
    const res = await api.addToCart(skuId, quantity, storeId);
    console.log("POST /api/v1/cart/add response:", res);
    const items = normalizeCartItems(res);
    if (items !== null) {
      setCart(items);
    } else {
      // fallback: re-fetch from server
      await refreshCart();
    }
  };

  // DELETE /api/v1/cart/{id}
  const removeFromCart = async (cartItemId: number) => {
    console.log("DELETE /api/v1/cart/" + cartItemId);
    const res = await api.removeCartItem(cartItemId);
    console.log("DELETE /api/v1/cart response:", res);
    const items = normalizeCartItems(res);
    if (items !== null) {
      setCart(items);
    } else {
      await refreshCart();
    }
  };

  // PUT /api/v1/cart/{id}
  const updateCartItem = async (cartItemId: number, quantity: number) => {
    console.log("PUT /api/v1/cart/" + cartItemId, { quantity });
    const res = await api.updateCartItem(cartItemId, quantity);
    console.log("PUT /api/v1/cart response:", res);
    const items = normalizeCartItems(res);
    if (items !== null) {
      setCart(items);
    } else {
      await refreshCart();
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyVoucher = (code: string): boolean => {
    const foundVoucher = MOCK_VOUCHERS.find(
      (v) => v.code.toLowerCase() === code.toLowerCase()
    );
    if (foundVoucher) {
      setVoucher(foundVoucher);
      return true;
    }
    return false;
  };

  const removeVoucher = () => {
    setVoucher(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        voucher,
        applyVoucher,
        removeVoucher,
        wishlistCount,
        wishlistItems,
        setWishlistItems,
        addWishlistItemGlobal,
        removeWishlistItemGlobal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};