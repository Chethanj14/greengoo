import { useParams, Link } from 'react-router-dom'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="card p-10 md:p-14 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-leaf-100 flex items-center justify-center text-4xl text-leaf-600 mx-auto mb-6" aria-hidden>
          ✓
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-800 mb-2">Order confirmed</h1>
        <p className="text-gray-600 mb-4">Thank you for your order. We'll prepare your items for delivery.</p>
        <p className="font-mono font-semibold text-leaf-700 text-lg mb-8">Order # {orderId}</p>
        <p className="text-sm text-gray-500 mb-6">Save this number for your records. You can use it to track your order.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/catalog" className="btn-primary">
            Continue shopping
          </Link>
          <Link to="/care-guide" className="btn-secondary">
            Read Care Guide
          </Link>
        </div>
      </div>
    </div>
  )
}
