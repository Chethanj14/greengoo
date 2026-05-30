import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct, getRelatedProducts, getReviews, createReview } from '../api/client'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/ProductCard'
import Breadcrumb from '../components/Breadcrumb'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', author_name: '' })
  const [loading, setLoading] = useState(true)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      getProduct(id).then((r) => r.data),
      getRelatedProducts(id).then((r) => r.data),
      getReviews(id).then((r) => r.data),
    ])
      .then(([prod, rel, rev]) => {
        setProduct(prod)
        setRelated(rel || [])
        setReviews(rev || [])
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product || product.stock < 1) return
    addToCart({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: Math.min(quantity, product.stock),
    })
  }

  const handleSubmitReview = (e) => {
    e.preventDefault()
    createReview({
      product_id: product.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      author_name: reviewForm.author_name || 'Anonymous',
    })
      .then(() => {
        setReviewForm({ rating: 5, comment: '', author_name: '' })
        setReviewSubmitted(true)
        return getReviews(id)
      })
      .then((r) => setReviews(r.data))
      .catch(() => {})
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="h-96 card animate-pulse bg-leaf-100/50" />
      </div>
    )
  }
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={[{ to: '/', label: 'Home' }, { to: '/catalog', label: 'Shop' }, { label: 'Product' }]} />
        <div className="card p-12 text-center">
          <p className="text-gray-500 mb-4">Product not found.</p>
          <Link to="/catalog" className="btn-primary">Browse all products</Link>
        </div>
      </div>
    )
  }

  const imageUrl = product.image_url || 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop'
  const inWishlist = isInWishlist(product.id)
  const inStock = product.stock == null || product.stock > 0

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { to: '/', label: 'Home' },
          { to: '/catalog', label: 'Shop' },
          { to: `/catalog?category=${encodeURIComponent(product.category)}`, label: product.category },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="aspect-square rounded-2xl overflow-hidden bg-leaf-100 card">
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="text-leaf-600 font-medium uppercase tracking-wide text-sm">{product.category}</span>
          <h1 className="font-display text-3xl font-bold text-gray-800 mt-2">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <span className="text-2xl font-bold text-leaf-700">${Number(product.price).toFixed(2)}</span>
            <span className="text-amber-500">★ {product.avg_rating ?? '—'} ({product.review_count ?? 0} reviews)</span>
          </div>
          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>
          {product.stock != null && (
            <p className={`mt-3 font-medium ${inStock ? 'text-leaf-600' : 'text-red-600'}`}>
              {inStock ? `In stock: ${product.stock} available` : 'Out of stock'}
            </p>
          )}
          {(product.plant_type || product.sunlight_requirement || product.watering_schedule) && (
            <div className="mt-4 p-4 bg-leaf-50 rounded-xl space-y-1 text-sm text-gray-700">
              {product.plant_type && <p><strong>Plant type:</strong> {product.plant_type}</p>}
              {product.sunlight_requirement && <p><strong>Sunlight:</strong> {product.sunlight_requirement}</p>}
              {product.watering_schedule && <p><strong>Watering:</strong> {product.watering_schedule}</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-8">
            <div className="flex items-center border-2 border-leaf-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-3 text-leaf-600 hover:bg-leaf-50 font-medium transition"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-5 py-3 w-14 text-center font-semibold border-x border-leaf-200">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                className="px-4 py-3 text-leaf-600 hover:bg-leaf-50 font-medium transition"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => (inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id))}
              className="btn-secondary"
            >
              {inWishlist ? '♥ Saved' : '♡ Save for later'}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14 pt-10 border-t border-leaf-200">
          <h2 className="section-title">Frequently Bought Together</h2>
          <p className="section-subtitle">Customers often buy these with {product.name}.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} showCategory />
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 pt-10 border-t border-leaf-200">
        <h2 className="section-title">Customer reviews</h2>
        {reviews.length === 0 && !reviewSubmitted ? (
          <p className="text-gray-600 mb-6">No reviews yet. Be the first to share your experience!</p>
        ) : (
          <ul className="space-y-4 mb-8">
            {reviews.map((r) => (
              <li key={r.id} className="card p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-amber-500 font-medium">★ {r.rating}</span>
                  <span className="text-sm text-gray-500">{r.author_name} · {new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.comment && <p className="mt-2 text-gray-700">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
        <div className="card p-6 max-w-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Add a review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((f) => ({ ...f, rating: +e.target.value }))}
                className="input-field"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} stars</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your name (optional)</label>
              <input
                type="text"
                value={reviewForm.author_name}
                onChange={(e) => setReviewForm((f) => ({ ...f, author_name: e.target.value }))}
                className="input-field"
                placeholder="Anonymous"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                rows={3}
                className="input-field"
                placeholder="Share your experience with this product..."
              />
            </div>
            <button type="submit" className="btn-primary">Submit review</button>
          </form>
        </div>
      </section>
    </div>
  )
}
