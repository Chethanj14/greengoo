import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts, getCategories, getSearchSuggestions } from '../api/client'
import ProductCard from '../components/ProductCard'
import Breadcrumb from '../components/Breadcrumb'

const PLANT_TYPES = ['indoor', 'outdoor']
const SUNLIGHT = ['low', 'medium', 'full']

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const category = searchParams.get('category') || ''
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const plantType = searchParams.get('plant_type') || ''
  const sunlight = searchParams.get('sunlight') || ''

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (searchParams.get('search')) params.search = searchParams.get('search')
    if (category) params.category = category
    if (minPrice) params.min_price = minPrice
    if (maxPrice) params.max_price = maxPrice
    if (plantType) params.plant_type = plantType
    if (sunlight) params.sunlight = sunlight
    getProducts(params)
      .then((r) => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [searchParams, category, minPrice, maxPrice, plantType, sunlight])

  useEffect(() => {
    const q = searchInput.trim()
    if (!q) {
      setSuggestions([])
      return
    }
    const t = setTimeout(() => {
      getSearchSuggestions(q).then((r) => setSuggestions(r.data || [])).catch(() => setSuggestions([]))
    }, 200)
    return () => clearTimeout(t)
  }, [searchInput])

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (searchInput.trim()) next.set('search', searchInput.trim())
    else next.delete('search')
    setSearchParams(next)
  }

  const hasActiveFilters = category || minPrice || maxPrice || plantType || sunlight || searchParams.get('search')

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ to: '/', label: 'Home' }, { to: '/catalog', label: 'Shop' }]} />

      <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">Product Catalog</h1>
      <p className="text-gray-600 mb-6">
        Find plants, seeds, pots, soil, tools, and everything for your garden.
      </p>

      <form onSubmit={handleSearch} className="mb-6 relative flex flex-wrap gap-2 items-center">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className="input-field flex-1 min-w-[200px] max-w-md"
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 top-full left-0 right-0 md:right-auto md:max-w-md w-full mt-1 bg-white border border-leaf-200 rounded-xl shadow-soft py-2 max-h-60 overflow-y-auto">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2.5 hover:bg-leaf-50 flex justify-between items-center transition"
                  onClick={() => {
                    setSearchInput(s.name)
                    setSearchParams({ search: s.name })
                    setSuggestions([])
                  }}
                >
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-leaf-600 text-sm">{s.category}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="card p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="text-sm text-leaf-600 hover:text-leaf-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="input-field"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minPrice}
                onChange={(e) => updateFilter('min_price', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={maxPrice}
                onChange={(e) => updateFilter('max_price', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plant type</label>
              <select
                value={plantType}
                onChange={(e) => updateFilter('plant_type', e.target.value)}
                className="input-field"
              >
                <option value="">Any</option>
                {PLANT_TYPES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sunlight</label>
              <select
                value={sunlight}
                onChange={(e) => updateFilter('sunlight', e.target.value)}
                className="input-field"
              >
                <option value="">Any</option>
                {SUNLIGHT.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 card animate-pulse bg-leaf-100/50" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-6xl mb-4" aria-hidden>🌱</p>
              <h2 className="font-display text-xl font-semibold text-gray-800 mb-2">No products match your filters</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try changing or clearing your filters, or browse all products.
              </p>
              <button type="button" onClick={() => setSearchParams({})} className="btn-primary">
                Clear filters & view all
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
