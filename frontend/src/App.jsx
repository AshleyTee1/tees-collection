import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import ProductModal from './components/ProductModal'
import CartPanel from './components/CartPanel'
import { useCartStore } from './store/cartStore'
import { useUiStore } from './store/uiStore'
import { useWindowWidth } from './hooks/useWindowWidth'
import { usePageTracking } from './hooks/usePageTracking'

function Tracker() {
  usePageTracking()
  return null
}

function FloatingCart() {
  const items = useCartStore(s => s.items)
  const openCart = useUiStore(s => s.openCart)
  const isMobile = useWindowWidth() < 768
  const { pathname } = useLocation()
  const hide = pathname === '/checkout' || pathname === '/confirmation' || pathname === '/login'
  if (!isMobile || hide || items.length === 0) return null
  return (
    <button onClick={openCart} style={{
      position: 'fixed', bottom: 24, right: 20, zIndex: 300,
      background: '#B07080', color: 'white', border: 'none', borderRadius: 50,
      padding: '14px 22px', fontSize: '1rem', fontWeight: 700,
      fontFamily: "'Lato', sans-serif", cursor: 'pointer',
      boxShadow: '0 6px 24px rgba(176,112,128,0.45)',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      🛍️ Cart
      <span style={{
        background: 'white', color: '#B07080', borderRadius: '50%',
        width: 22, height: 22, fontSize: '0.75rem', fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>{items.length}</span>
    </button>
  )
}
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import CustomOrderPage from './pages/CustomOrderPage'
import LoginPage from './pages/LoginPage'
import CheckoutPage from './pages/CheckoutPage'
import ConfirmationPage from './pages/ConfirmationPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCustomOrders from './pages/admin/AdminCustomOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminSettings from './pages/admin/AdminSettings'
import AdminAnalytics from './pages/admin/AdminAnalytics'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes — no Navbar/Cart */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOrders />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="custom-orders" element={<AdminCustomOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Public routes */}
        <Route path="*" element={
          <>
            <Tracker />
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ProductsPage />} />
              <Route path="/custom-order" element={<CustomOrderPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
            </Routes>
            <ProductModal />
            <CartPanel />
            <FloatingCart />
            <Toast />
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}
