import { BrowserRouter as Router, Routes, Route, Navigate, createSearchParams, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import ThankYou from './pages/ThankYou'
import './App.css'
import { CartProvider } from './context/CartContext'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import Signup from './pages/Signup'
import Login from './pages/Login'
import OrderHistory from './pages/OrderHistory'
import ProductDetail from './pages/ProductDetail'
import UserDashboard from './pages/UserDashboard'


function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Shop />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/women" element={<Navigate to={{ pathname: '/products', search: `?${createSearchParams({ category: "women's clothing" })}` }} replace />} />
          <Route path="/womens" element={<Navigate to={{ pathname: '/products', search: `?${createSearchParams({ category: "women's clothing" })}` }} replace />} />
          <Route path="/mens" element={<Navigate to={{ pathname: '/products', search: `?${createSearchParams({ category: "men's clothing" })}` }} replace />} />
          <Route path="/men" element={<Navigate to={{ pathname: '/products', search: `?${createSearchParams({ category: "men's clothing" })}` }} replace />} />
          <Route path="/collections/women" element={<Navigate to={{ pathname: '/products', search: `?${createSearchParams({ category: "women's clothing" })}` }} replace />} />
          <Route path="/collections/men" element={<Navigate to={{ pathname: '/products', search: `?${createSearchParams({ category: "men's clothing" })}` }} replace />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/panel" element={<AdminDashboard />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/account" element={<UserDashboard />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App
