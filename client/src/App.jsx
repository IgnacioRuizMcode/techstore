import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CallbackPage from './pages/CallbackPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import ProfileHome from './pages/profile/ProfileHome';
import ProfileSettings from './pages/profile/ProfileSettings';
import ProfileOrders from './pages/profile/ProfileOrders';
import OrderDetailPage from './pages/profile/OrderDetailPage';
import ProfileWishlist from './pages/profile/ProfileWishlist';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHome from './pages/admin/AdminHome';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminStats from './pages/admin/AdminStats';
import AdminUsers from './pages/admin/AdminUsers';
import NotFoundPage from './pages/NotFoundPage';
import PaymentConfirm from './pages/PaymentConfirm';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <WishlistProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
                    <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
                    <Route path="/orders" element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
                    <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>}>
                      <Route index element={<ProfileHome />} />
                      <Route path="settings" element={<ProfileSettings />} />
                      <Route path="orders" element={<ProfileOrders />} />
                      <Route path="orders/:orderId" element={<OrderDetailPage />} />
                      <Route path="wishlist" element={<ProfileWishlist />} />
                    </Route>
                  </Route>

                  <Route path="/auth/callback" element={<CallbackPage />} />
                  <Route path="/payment/confirm" element={<PaymentConfirm />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

                  <Route path="/admin" element={<PrivateRoute adminOnly={true}><AdminDashboard /></PrivateRoute>}>
                    <Route index element={<AdminHome />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/:id/edit" element={<ProductForm />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="stats" element={<AdminStats />} />
                    <Route path="users" element={<AdminUsers />} />
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </BrowserRouter>
            </WishlistProvider>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;