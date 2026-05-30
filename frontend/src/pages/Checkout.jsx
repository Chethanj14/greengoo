import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createOrder } from '../api/client'
import Breadcrumb from '../components/Breadcrumb'

export default function Checkout() {
  const { cart, clearCart, itemCount } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    customer_name: '',
    address: '',
    payment_method: 'card',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const subtotal = cart.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.quantity || 1), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.customer_name.trim() || !form.address.trim()) {
      setError('Please enter your name and delivery address.')
      return
    }
    if (cart.length === 0) {
      setError('Your cart is empty.')
      return
    }
    setLoading(true)
    try {
      const { data } = await createOrder({
        customer_name: form.customer_name.trim(),
        address: form.address.trim(),
        payment_method: form.payment_method,
        items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity || 1 })),
      })
      clearCart()
      navigate(`/order-confirmation/${data.order_id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Order failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (itemCount === 0 && !loading) {
    navigate('/cart')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ to: '/', label: 'Home' }, { to: '/cart', label: 'Cart' }, { label: 'Checkout' }]} />
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Checkout</h1>
      <p className="text-gray-600 mb-6">Enter your details to complete your order. We'll deliver to your address.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl" role="alert">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
            <input
              type="text"
              value={form.customer_name}
              onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
              required
              placeholder="Your name"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery address *</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              required
              rows={3}
              placeholder="Street, city, postal code"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
            <select
              value={form.payment_method}
              onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
              className="input-field"
            >
              <option value="card">Card</option>
              <option value="cod">Cash on delivery</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">
            Your payment information is secure. We do not store card details.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-base disabled:opacity-50"
          >
            {loading ? 'Placing order...' : 'Place order'}
          </button>
        </div>
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4">Order summary</h2>
            <ul className="space-y-2 mb-4">
              {cart.map((item) => (
                <li key={item.product_id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} × {item.quantity}</span>
                  <span className="font-medium">${(Number(item.price) * (item.quantity || 1)).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p className="flex justify-between font-bold text-lg border-t border-leaf-200 pt-4">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </p>
            <Link to="/cart" className="mt-4 block text-center text-leaf-600 hover:text-leaf-700 text-sm font-medium">
              ← Back to cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
