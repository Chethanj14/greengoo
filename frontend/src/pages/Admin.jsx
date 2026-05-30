import { useEffect, useState } from 'react'
import {
  getProducts,
  getOrders,
  getAdminAnalytics,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '../api/client'

const CATEGORIES = [
  'Plants', 'Seeds', 'Pots', 'Hooks / Supports', 'Soil', 'Organic dung / compost',
  'Fertilizers', 'Gardening tools', 'Watering equipment',
]

export default function Admin() {
  const [tab, setTab] = useState('analytics')
  const [analytics, setAnalytics] = useState(null)
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '', image_url: '', stock: '',
    plant_type: '', sunlight_requirement: '', planting_month: '', watering_schedule: '',
    is_featured: 0, is_seasonal: 0,
  })

  const loadAnalytics = () => {
    getAdminAnalytics().then((r) => setAnalytics(r.data)).catch(() => setAnalytics(null))
  }
  const loadOrders = () => {
    getOrders().then((r) => setOrders(r.data || [])).catch(() => setOrders([]))
  }
  const loadProducts = () => {
    getProducts().then((r) => setProducts(r.data || [])).catch(() => setProducts([]))
  }
  const loadCategories = () => {
    getCategories().then((r) => setCategories(r.data || [])).catch(() => setCategories([]))
  }

  useEffect(() => {
    setLoading(true)
    if (tab === 'analytics') loadAnalytics()
    else if (tab === 'orders') loadOrders()
    else if (tab === 'products') {
      loadProducts()
      loadCategories()
    }
    setLoading(false)
  }, [tab])

  const resetForm = () => {
    setEditing(null)
    setForm({
      name: '', description: '', price: '', category: '', image_url: '', stock: '',
      plant_type: '', sunlight_requirement: '', planting_month: '', watering_schedule: '',
      is_featured: 0, is_seasonal: 0,
    })
  }

  const handleEdit = (p) => {
    setEditing(p.id)
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      category: p.category,
      image_url: p.image_url || '',
      stock: p.stock ?? '',
      plant_type: p.plant_type || '',
      sunlight_requirement: p.sunlight_requirement || '',
      planting_month: p.planting_month || '',
      watering_schedule: p.watering_schedule || '',
      is_featured: p.is_featured ? 1 : 0,
      is_seasonal: p.is_seasonal ? 1 : 0,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock, 10) || 0,
      is_featured: form.is_featured ? 1 : 0,
      is_seasonal: form.is_seasonal ? 1 : 0,
    }
    try {
      if (editing) {
        await updateProduct(editing, payload)
        loadProducts()
      } else {
        await createProduct(payload)
        loadProducts()
      }
      resetForm()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      loadProducts()
      if (editing === id) resetForm()
    } catch (err) {
      console.error(err)
    }
  }

  const exportCsv = () => {
    window.open('/api/admin/sales/export', '_blank')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="flex gap-2 mb-6 border-b border-leaf-200">
        {['analytics', 'orders', 'products'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-medium rounded-t-lg capitalize ${
              tab === t ? 'bg-leaf-600 text-white' : 'bg-leaf-100 text-gray-700 hover:bg-leaf-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'analytics' && (
        <div className="space-y-6">
          {loading ? (
            <div className="h-48 bg-leaf-100 rounded-xl animate-pulse" />
          ) : analytics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-leaf-200 p-6">
                  <h3 className="text-gray-600 font-medium">Total orders</h3>
                  <p className="text-3xl font-bold text-leaf-700">{analytics.total_orders ?? 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-leaf-200 p-6">
                  <h3 className="text-gray-600 font-medium">Total revenue</h3>
                  <p className="text-3xl font-bold text-leaf-700">${Number(analytics.total_revenue || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-leaf-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Top selling products</h3>
                <ul className="space-y-2">
                  {(analytics.top_products || []).map((p, i) => (
                    <li key={p.id} className="flex justify-between">
                      <span>{i + 1}. {p.name}</span>
                      <span className="text-leaf-600">{p.sold} sold</span>
                    </li>
                  ))}
                  {(!analytics.top_products || analytics.top_products.length === 0) && (
                    <li className="text-gray-500">No sales data yet.</li>
                  )}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-leaf-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Monthly revenue</h3>
                <ul className="space-y-2">
                  {(analytics.monthly || []).map((m) => (
                    <li key={m.month} className="flex justify-between">
                      <span>{m.month}</span>
                      <span className="text-leaf-600">${Number(m.revenue || 0).toFixed(2)} ({m.orders} orders)</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <a
                  href="/api/admin/sales/export"
                  download="greengrow-sales.csv"
                  className="inline-block px-4 py-2 bg-leaf-600 text-white rounded-lg hover:bg-leaf-500"
                >
                  Export sales CSV
                </a>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Failed to load analytics.</p>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="overflow-x-auto">
          {loading ? (
            <div className="h-48 bg-leaf-100 rounded-xl animate-pulse" />
          ) : (
            <table className="w-full border border-leaf-200 rounded-xl overflow-hidden">
              <thead className="bg-leaf-100">
                <tr>
                  <th className="text-left p-3">Order ID</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.order_id} className="border-t border-leaf-200">
                    <td className="p-3 font-mono">{o.order_id}</td>
                    <td className="p-3">{o.customer_name}</td>
                    <td className="p-3">${Number(o.total_price).toFixed(2)}</td>
                    <td className="p-3 text-sm text-gray-600">{o.order_date}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {loading ? (
              <div className="h-64 bg-leaf-100 rounded-xl animate-pulse" />
            ) : (
              <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                {products.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between items-center bg-white border border-leaf-200 rounded-lg p-3"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-leaf-600">${Number(p.price).toFixed(2)} · Stock: {p.stock}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="text-leaf-600 hover:text-leaf-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white rounded-xl border border-leaf-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit product' : 'Add product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-leaf-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-leaf-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-leaf-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full px-3 py-2 border border-leaf-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-leaf-200 rounded-lg"
                >
                  <option value="">Select</option>
                  {(categories.length ? categories : CATEGORIES).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Image URL</label>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-leaf-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Plant type</label>
                  <input
                    value={form.plant_type}
                    onChange={(e) => setForm((f) => ({ ...f, plant_type: e.target.value }))}
                    placeholder="indoor / outdoor"
                    className="w-full px-3 py-2 border border-leaf-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Sunlight</label>
                  <input
                    value={form.sunlight_requirement}
                    onChange={(e) => setForm((f) => ({ ...f, sunlight_requirement: e.target.value }))}
                    placeholder="low / medium / full"
                    className="w-full px-3 py-2 border border-leaf-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Planting month</label>
                  <input
                    value={form.planting_month}
                    onChange={(e) => setForm((f) => ({ ...f, planting_month: e.target.value }))}
                    className="w-full px-3 py-2 border border-leaf-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Watering schedule</label>
                  <input
                    value={form.watering_schedule}
                    onChange={(e) => setForm((f) => ({ ...f, watering_schedule: e.target.value }))}
                    className="w-full px-3 py-2 border border-leaf-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.is_featured}
                    onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked ? 1 : 0 }))}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.is_seasonal}
                    onChange={(e) => setForm((f) => ({ ...f, is_seasonal: e.target.checked ? 1 : 0 }))}
                  />
                  Seasonal
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-leaf-600 text-white rounded-lg hover:bg-leaf-500">
                  {editing ? 'Update' : 'Create'}
                </button>
                {editing && (
                  <button type="button" onClick={resetForm} className="px-4 py-2 border border-leaf-200 rounded-lg">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
