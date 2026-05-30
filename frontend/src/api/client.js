/**
 * Axios instance for GreenGrow API.
 * Uses proxy in dev: /api -> http://localhost:5000/api
 */
import axios from 'axios'

const API_BASE = '/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Products
export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get(`/products/${id}`)
export const getRelatedProducts = (id) => api.get(`/products/${id}/related`)
export const getSearchSuggestions = (q) => api.get('/products/search-suggestions', { params: { q } })
export const createProduct = (data) => api.post('/products', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

// Orders
export const getOrders = (params) => api.get('/orders', { params })
export const createOrder = (data) => api.post('/orders', data)

// Reviews
export const getReviews = (productId) => api.get(`/reviews/${productId}`)
export const createReview = (data) => api.post('/reviews', data)

// Wishlist (session_id can be from localStorage)
export const getWishlist = (sessionId) => api.get('/wishlist', { params: sessionId ? { session_id: sessionId } : {} })
export const addToWishlist = (productId, sessionId) => api.post('/wishlist', { product_id: productId, session_id: sessionId || '' })
export const removeFromWishlist = (productId, sessionId) => api.delete(`/wishlist/${productId}`, { params: sessionId ? { session_id: sessionId } : {} })

// Care articles
export const getCareArticles = () => api.get('/care-articles')
export const getCareArticle = (slug) => api.get(`/care-articles/${slug}`)

// Categories & Admin
export const getCategories = () => api.get('/categories')
export const getAdminAnalytics = () => api.get('/admin/analytics')
export const exportSalesCsv = () => api.get('/admin/sales/export', { responseType: 'blob' })
