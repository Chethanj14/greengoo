import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../api/client'
import Breadcrumb from '../components/Breadcrumb'

export default function GardenPlanner() {
  const [products, setProducts] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then((r) => {
        const list = (r.data || []).filter(
          (p) => p.plant_type || p.watering_schedule || p.sunlight_requirement || p.planting_month
        )
        setProducts(list)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (p) => {
    setSelected((prev) =>
      prev.some((x) => x.id === p.id) ? prev.filter((x) => x.id !== p.id) : [...prev, p]
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ to: '/', label: 'Home' }, { label: 'Garden Planner' }]} />
      <h1 className="section-title">Garden Planner</h1>
      <p className="section-subtitle">
        Select plants to see their watering schedule, sunlight requirement, and best planting month. Plan your garden in one place.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="h-64 card animate-pulse bg-leaf-100/50" />
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition card text-left ${
                    selected.some((x) => x.id === p.id)
                      ? 'border-leaf-500 bg-leaf-50 ring-2 ring-leaf-200'
                      : 'border-leaf-100 hover:border-leaf-300'
                  }`}
                >
                  <span className="font-medium text-gray-800">{p.name}</span>
                  <span className="text-leaf-600 text-sm ml-2">({p.category})</span>
                </button>
              ))}
              {products.length === 0 && (
                <div className="card p-8 text-center">
                  <p className="text-gray-500 mb-4">No plants with planner data yet.</p>
                  <Link to="/catalog" className="btn-primary">Browse products</Link>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4">Your selection</h2>
            {selected.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Click plants from the list to add them here. You'll see watering, sunlight, and planting tips for each.
              </p>
            ) : (
              <ul className="space-y-4">
                {selected.map((p) => (
                  <li key={p.id} className="border-b border-leaf-100 pb-4 last:border-0">
                    <p className="font-medium text-gray-800">{p.name}</p>
                    <ul className="mt-2 text-sm text-gray-600 space-y-1">
                      {p.plant_type && <li><strong>Type:</strong> {p.plant_type}</li>}
                      {p.sunlight_requirement && <li><strong>Sunlight:</strong> {p.sunlight_requirement}</li>}
                      {p.watering_schedule && <li><strong>Watering:</strong> {p.watering_schedule}</li>}
                      {p.planting_month && <li><strong>Planting month:</strong> {p.planting_month}</li>}
                    </ul>
                    <button
                      type="button"
                      onClick={() => toggle(p)}
                      className="mt-2 text-red-600 text-sm font-medium hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
