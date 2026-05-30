import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Breadcrumb from '../components/Breadcrumb'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, itemCount } = useCart()

  const subtotal = cart.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.quantity || 1), 0)

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={[{ to: '/', label: 'Home' }, { label: 'Cart' }]} />
        <div className="card p-12 text-center max-w-lg mx-auto">
          <p className="text-6xl mb-4" aria-hidden>🛒</p>
          <h1 className="font-display text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Add items from the shop to see them here. You can also save items to your wishlist for later.
          </p>
          <Link to="/catalog" className="btn-primary">
            Continue shopping
          </Link>
          <Link to="/wishlist" className="block mt-4 text-leaf-600 font-medium hover:text-leaf-700">
            View wishlist →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ to: '/', label: 'Home' }, { label: 'Cart' }]} />
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.product_id}
              className="card p-4 flex flex-wrap gap-4 items-center"
            >
              <Link to={`/product/${item.product_id}`} className="w-20 h-20 rounded-xl bg-leaf-100 overflow-hidden flex-shrink-0 block">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-leaf-400 text-2xl">🌱</div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product_id}`} className="font-medium text-gray-800 hover:text-leaf-600 transition">
                  {item.name || `Product #${item.product_id}`}
                </Link>
                <p className="text-leaf-600 font-semibold mt-0.5">${Number(item.price || 0).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product_id, Math.max(1, (item.quantity || 1) - 1))}
                  className="w-9 h-9 rounded-lg border border-leaf-200 hover:bg-leaf-50 font-medium transition"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center font-medium">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product_id, (item.quantity || 1) + 1)}
                  className="w-9 h-9 rounded-lg border border-leaf-200 hover:bg-leaf-50 font-medium transition"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <p className="w-24 text-right font-semibold text-gray-800">
                ${(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}
              </p>
              <button
                type="button"
                onClick={() => removeFromCart(item.product_id)}
                className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                title="Remove from cart"
                aria-label="Remove from cart"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4">Order summary</h2>
            <p className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
              <span>${subtotal.toFixed(2)}</span>
            </p>
            <p className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-leaf-100">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </p>
            <Link to="/checkout" className="btn-primary mt-6 w-full block text-center">
              Proceed to checkout
            </Link>
            <Link to="/catalog" className="mt-4 block text-center text-leaf-600 hover:text-leaf-700 text-sm font-medium">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
