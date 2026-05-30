import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

/**
 * Reusable product card for catalog and related products.
 * User-friendly: clear labels, hover states, stock badge, add to cart & wishlist.
 */
export default function ProductCard({ product, showCategory = true }) {
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const inWishlist = isInWishlist(product.id)
  const imageUrl = product.image_url || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'
  const inStock = product.stock != null ? product.stock > 0 : true

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
    })
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWishlist) removeFromWishlist(product.id)
    else addToWishlist(product.id)
  }

  return (
    <div className="card overflow-hidden group">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-[4/3] bg-leaf-100 overflow-hidden relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
          {!inStock && (
            <span className="absolute top-2 left-2 bg-gray-700 text-white text-xs font-medium px-2 py-1 rounded-lg">
              Out of stock
            </span>
          )}
          {inStock && product.stock != null && product.stock <= 10 && product.stock > 0 && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-lg">
              Only {product.stock} left
            </span>
          )}
        </div>
        <div className="p-4">
          {showCategory && (
            <span className="text-xs text-leaf-600 font-medium uppercase tracking-wide">
              {product.category}
            </span>
          )}
          <h3 className="font-display font-semibold text-gray-800 mt-1 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <span className="text-leaf-700 font-bold text-lg">${Number(product.price).toFixed(2)}</span>
            <div className="flex items-center gap-2">
              {product.avg_rating != null && (
                <span className="text-amber-500 text-sm" title="Rating">★ {product.avg_rating}</span>
              )}
              {product.stock != null && inStock && (
                <span className="text-xs text-leaf-600">In stock</span>
              )}
            </div>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4 flex gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex-1 py-2.5 bg-leaf-600 text-white rounded-xl hover:bg-leaf-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
        >
          Add to cart
        </button>
        <button
          type="button"
          onClick={handleWishlist}
          className="p-2.5 rounded-xl border border-leaf-200 hover:bg-leaf-50 transition"
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {inWishlist ? '♥' : '♡'}
        </button>
      </div>
    </div>
  )
}
