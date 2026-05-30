import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/ProductCard'
import Breadcrumb from '../components/Breadcrumb'

export default function Wishlist() {
  const { wishlist, loading, removeFromWishlist } = useWishlist()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="h-64 card animate-pulse bg-leaf-100/50" />
      </div>
    )
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={[{ to: '/', label: 'Home' }, { label: 'Wishlist' }]} />
        <div className="card p-12 text-center max-w-lg mx-auto">
          <p className="text-6xl mb-4" aria-hidden>♥</p>
          <h1 className="font-display text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-6">
            Save items you like by clicking the heart on any product. They'll appear here for later.
          </p>
          <Link to="/catalog" className="btn-primary">
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ to: '/', label: 'Home' }, { label: 'Wishlist' }]} />
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Wishlist</h1>
      <p className="text-gray-600 mb-6">Items you've saved for later. Add them to cart when you're ready.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            <button
              type="button"
              onClick={() => removeFromWishlist(product.id)}
              className="absolute top-2 right-2 z-10 w-9 h-9 bg-white/95 rounded-full shadow-md flex items-center justify-center text-red-600 hover:bg-white transition"
              title="Remove from wishlist"
              aria-label="Remove from wishlist"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
