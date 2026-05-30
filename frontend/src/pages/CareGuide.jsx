import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCareArticles } from '../api/client'
import Breadcrumb from '../components/Breadcrumb'

export default function CareGuide() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCareArticles()
      .then((r) => setArticles(r.data || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ to: '/', label: 'Home' }, { label: 'Care Guide' }]} />
      <h1 className="section-title">Plant Care Guide</h1>
      <p className="section-subtitle">
        Tips on growing plants, watering schedules, fertilizing, and beginner gardening. Learn how to keep your plants healthy.
      </p>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 card animate-pulse bg-leaf-100/50" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="card p-12 text-center max-w-lg mx-auto">
          <p className="text-6xl mb-4" aria-hidden>🌿</p>
          <h2 className="font-display text-xl font-semibold text-gray-800 mb-2">No articles yet</h2>
          <p className="text-gray-600">Care guides will appear here. Check back soon or browse our products.</p>
          <Link to="/catalog" className="btn-primary mt-6 inline-block">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((a) => (
            <Link
              key={a.id}
              to={`/care-guide/${a.slug}`}
              className="card p-6 block hover:shadow-md transition group"
            >
              {a.image_url && (
                <div className="aspect-video rounded-xl bg-leaf-100 mb-4 overflow-hidden">
                  <img src={a.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
              )}
              <span className="text-xs text-leaf-600 font-medium uppercase tracking-wide">{a.category}</span>
              <h2 className="font-display text-xl font-semibold text-gray-800 mt-1 group-hover:text-leaf-700 transition">
                {a.title}
              </h2>
              <p className="text-gray-600 mt-2 line-clamp-2">{a.content}</p>
              <span className="inline-block mt-3 text-leaf-600 font-medium group-hover:text-leaf-700">Read more →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
