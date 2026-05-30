import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Wishlist from './pages/Wishlist'
import CareGuide from './pages/CareGuide'
import CareArticle from './pages/CareArticle'
import GardenPlanner from './pages/GardenPlanner'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/care-guide" element={<CareGuide />} />
        <Route path="/care-guide/:slug" element={<CareArticle />} />
        <Route path="/garden-planner" element={<GardenPlanner />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  )
}
