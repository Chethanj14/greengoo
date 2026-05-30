import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api/client'
import ProductCard from '../components/ProductCard'
import TrustStrip from '../components/TrustStrip'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [seasonal, setSeasonal] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setError(null)
    Promise.all([
      getProducts({ featured: 1 }).then((r) => r.data),
      getProducts({ seasonal: 1 }).then((r) => r.data),
    ])
      .then(([feat, sea]) => {
        setFeatured(Array.isArray(feat) ? feat : [])
        setSeasonal(Array.isArray(sea) && sea.length ? sea : (Array.isArray(feat) ? feat : []).slice(0, 4))
      })
      .catch(() => {
        setError('Could not load products. Is the backend running on port 5000?')
        setFeatured([])
        setSeasonal([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-leaf-700 to-leaf-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            GreenGrow – Plant Cultivation Store
          </h1>
          <p className="text-leaf-100 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Everything you need for plant cultivation, from seeds to harvest. Plants, pots, soil, tools & more.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/catalog" className="btn-primary text-base">
              Shop Now
            </Link>
            <Link to="/care-guide" className="btn-secondary text-base text-leaf-800 border-white/30 bg-white/10 hover:bg-white/20 text-white border-white">
              Care Guide
            </Link>
          </div>
        </div>
      </section>

      <TrustStrip />

      {/* Featured */}
      <section className="page-section container mx-auto px-4">
        <h2 className="section-title">Featured Products</h2>
        <p className="section-subtitle">
          Hand-picked for quality and popularity. Start here if you're new to gardening.
        </p>
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 card animate-pulse bg-leaf-100/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <Link to="/catalog" className="btn-secondary">
            View all products →
          </Link>
        </div>
      </section>

      {/* Seasonal */}
      <section className="bg-leaf-100/50 page-section">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Seasonal Picks</h2>
          <p className="section-subtitle">
            Best plants and seeds for the current season. Great for beginners.
          </p>
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {seasonal.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link to="/garden-planner" className="text-leaf-600 font-medium hover:text-leaf-700">
              Plan your garden →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-section container mx-auto px-4">
        <div className="card p-8 md:p-10 bg-earth-800 text-white border-0 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Plan Your Garden</h2>
              <p className="text-leaf-200 mb-6">
                Use our Garden Planner to see watering schedules, sunlight needs, and planting months for your plants.
              </p>
              <Link to="/garden-planner" className="btn-primary bg-leaf-500 hover:bg-leaf-400">
                Open Garden Planner
              </Link>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Plant Care Guide</h2>
              <p className="text-leaf-200 mb-6">
                Tips on watering, fertilizing, and beginner gardening. Learn how to keep your plants thriving.
              </p>
              <Link to="/care-guide" className="btn-primary bg-leaf-500 hover:bg-leaf-400">
                Read Guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
