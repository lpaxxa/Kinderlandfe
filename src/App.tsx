import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppProvider, useApp } from './context/AppContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './components/home/HomePage';
import LoginPage from './components/auth/LoginPage';
import ProductsPage from './components/pages/ProductsPage';
import CategoriesPage from './components/pages/CategoriesPage';
import BrandsPage from './components/pages/BrandsPage';
import DiscountsPage from './components/pages/DiscountsPage';
import NewArrivalsPage from './components/pages/NewArrivalsPage';
import StoreFinderPage from './components/pages/StoreFinderPage';
import BlogListPage from './components/pages/BlogListPage';
import BlogDetailPage from './components/pages/BlogDetailPage';
import ProductDetail from './components/shop/ProductDetail';
import Cart from './components/cart/Cart';
import Checkout from './components/checkout/Checkout';
import Payment from './components/checkout/Payment';
import OrderSuccess from './components/checkout/OrderSuccess';

// Admin & Staff
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import ProductManagement from './components/admin/ProductManagement';
import OrderManagement from './components/admin/OrderManagement';
import PromotionManagement from './components/admin/PromotionManagement';
import UserManagement from './components/admin/UserManagement';
import ReturnManagement from './components/admin/ReturnManagement';
import StaffDashboard from './components/staff/StaffDashboard';
import QRScanner from './components/staff/QRScanner';
import InventoryCheck from './components/staff/InventoryCheck';
import StoreTransfer from './components/staff/StoreTransfer';
import DefectiveReport from './components/staff/DefectiveReport';

// Manager
import ManagerDashboard from './components/manager/ManagerDashboard';
import FinancialOverview from './components/manager/FinancialOverview';
import SkuPriceManagement from './components/manager/SkuPriceManagement';
import ReviewManagement from './components/manager/ReviewManagement';
import ImportOrderPage from './components/manager/ImportOrderPage';
import InventoryManagementPage from './components/manager/InventoryManagementPage';
import StockTransferPage from './components/manager/StockTransferPage';
import PhysicalCountPage from './components/manager/PhysicalCountPage';
import DefectiveReportPage from './components/manager/DefectiveReportPage';

// Customer Account
import CustomerDashboard from './components/customer/CustomerDashboard';
import OrderHistory from './components/customer/OrderHistory';
import CustomerProfile from './components/customer/CustomerProfile';
import LoyaltyPoints from './components/customer/LoyaltyPoints';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: ('admin' | 'staff' | 'manager')[] }) {
  const { adminUser } = useAdmin();

  if (!adminUser) {
    return <Navigate to="/admin/login" />;
  }

  if (!allowedRoles.includes(adminUser.role)) {
    if (adminUser.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else if (adminUser.role === 'manager') {
      return <Navigate to="/manager/dashboard" />;
    } else {
      return <Navigate to="/staff/dashboard" />;
    }
  }

  return <>{children}</>;
}

function AppContent() {
  const { user } = useApp();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Customer Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin/Staff/Manager Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminProtectedRoute allowedRoles={['admin']}>
                <ProductManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminProtectedRoute allowedRoles={['admin']}>
                <OrderManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/promotions"
            element={
              <AdminProtectedRoute allowedRoles={['admin']}>
                <PromotionManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/returns"
            element={
              <AdminProtectedRoute allowedRoles={['admin']}>
                <ReturnManagement />
              </AdminProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <ManagerDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/products"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <ProductManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/categories"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <ProductManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/inventory"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <InventoryManagementPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/storage"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <InventoryManagementPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/orders"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <OrderManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/create-order"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <OrderManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/returns"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <ReturnManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/stock-transfer"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <StockTransferPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/import-orders"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <ImportOrderPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/import-management"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <StoreTransfer />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/defective-report"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <DefectiveReportPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/physical-count"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <PhysicalCountPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/promotions"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <PromotionManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/blog"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <ProductManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/policies"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <ProductManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/reviews"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <ReviewManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/reports"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/financial"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <FinancialOverview />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/sku-price"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <SkuPriceManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/manager/change-password"
            element={
              <AdminProtectedRoute allowedRoles={['manager']}>
                <CustomerProfile />
              </AdminProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <AdminProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/staff/qr-scanner"
            element={
              <AdminProtectedRoute allowedRoles={['staff']}>
                <QRScanner />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/staff/inventory"
            element={
              <AdminProtectedRoute allowedRoles={['staff']}>
                <InventoryCheck />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/staff/transfer"
            element={
              <AdminProtectedRoute allowedRoles={['staff']}>
                <StoreTransfer />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/staff/defective"
            element={
              <AdminProtectedRoute allowedRoles={['staff']}>
                <DefectiveReport />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/staff/returns"
            element={
              <AdminProtectedRoute allowedRoles={['staff']}>
                <ReturnManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/staff/stock-check"
            element={
              <AdminProtectedRoute allowedRoles={['staff']}>
                <InventoryCheck />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/staff/availability"
            element={
              <AdminProtectedRoute allowedRoles={['staff']}>
                <InventoryCheck />
              </AdminProtectedRoute>
            }
          />

          {/* Customer Site Routes */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/categories/:categoryName" element={<CategoriesPage />} />
                  <Route path="/brands" element={<BrandsPage />} />
                  <Route path="/brands/:brandName" element={<BrandsPage />} />
                  <Route path="/discounts" element={<DiscountsPage />} />
                  <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                  <Route path="/stores" element={<StoreFinderPage />} />
                  <Route path="/blog" element={<BlogListPage />} />
                  <Route path="/blog/:id" element={<BlogDetailPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment"
                    element={
                      <ProtectedRoute>
                        <Payment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-success"
                    element={
                      <ProtectedRoute>
                        <OrderSuccess />
                      </ProtectedRoute>
                    }
                  />
                  {/* Customer Account Routes */}
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <CustomerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders"
                    element={
                      <ProtectedRoute>
                        <OrderHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/profile"
                    element={
                      <ProtectedRoute>
                        <CustomerProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/loyalty"
                    element={
                      <ProtectedRoute>
                        <LoyaltyPoints />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </AppProvider>
  );
}