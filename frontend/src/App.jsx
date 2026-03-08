import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import { useAuth } from './context/useAuth';
import { CartProvider, useCart } from './context/cartContext';
import { NotificationProvider, useNotification } from './context/notificationContext';
import { CompareProvider, useCompare } from './context/compareContext';
import { WishlistProvider } from './context/wishlistContext';
import Header from './components/Header';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';
import CompareFloatingButton from './components/CompareFloatingButton';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import UserManagement from './pages/UserManagement';
import Cart from './components/Cart';
import Wishlist from './pages/WishList';
import ProductListing from './pages/ProductListing';
import ComparePage from './pages/ComparePage';
import Chatbot from './components/Chatbot';
import SimpleChatbot from './components/SimpleChatbot';

// Role selection component
const RoleSelector = ({ onRoleSelect }) => {
  return (
    <div className="role-selector" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ width: '100%', maxWidth: '800px', padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: 'white' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>Welcome to LuxeSleep</h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.95 }}>Premium handcrafted mattresses for your best night's sleep.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button
              style={{ padding: '12px 32px', backgroundColor: '#ffd814', color: '#111', fontWeight: 700, fontSize: '16px', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 1px 0 #fcd200' }}
              onClick={() => onRoleSelect('user')}
            >
              Continue as User
            </button>
            <button
              style={{ padding: '12px 32px', backgroundColor: '#ffeb99', color: '#0066c0', fontWeight: 700, fontSize: '16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              onClick={() => onRoleSelect('admin')}
            >
              Continue as Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated ProtectedRoute Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, userRole, loading, token } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Fixed Admin Layout Component
const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/products">Products</Link></li>
            <li><Link to="/admin/orders">Orders</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
          </ul>
        </nav>
        <div className="sidebar-footer" style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

// Component to connect cart context with notification context
const NotificationConnector = () => {
  const { registerNotificationCallback } = useCart();
  const { registerNotificationCallback: registerCompareNotifications } = useCompare();
  const notificationMethods = useNotification();

  useEffect(() => {
    registerNotificationCallback(notificationMethods);
    registerCompareNotifications(notificationMethods);
  }, [registerNotificationCallback, registerCompareNotifications, notificationMethods]);

  return null;
};

function App() {
  const [selectedRole, setSelectedRole] = useState('user');

  useEffect(() => {
    // Check if role was previously selected, otherwise default to user
    const savedRole = localStorage.getItem('userRole') || 'user';
    setSelectedRole(savedRole);
    localStorage.setItem('userRole', savedRole);
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <CompareProvider>
            <WishlistProvider>
              <Router>
                <div className="App">
                  <AppContent selectedRole={selectedRole} />
                </div>
              </Router>
            </WishlistProvider>
          </CompareProvider>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

function AppContent({ selectedRole }) {
  const { user, userRole } = useAuth();

  return (
    <>
      {/* Connect notification system with cart */}
      <NotificationConnector />

      {userRole !== 'admin' && <Header />}

      {/* Compare floating button - available on all user pages */}
      {userRole !== 'admin' && <CompareFloatingButton />}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Routes */}
        {userRole === 'user' && (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
          </>
        )}

        {/* Admin Routes */}
        {userRole === 'admin' && (
          <>
            <Route
              path="/"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ProductManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <OrderManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <UserManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </>
        )}

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {userRole !== 'admin' && <Footer />}

      {/* Chatbot - Available for all users */}
      {user && <SimpleChatbot />}

      {/* Notification Toast Component */}
      <NotificationToast />
    </>
  );
}

export default App;

