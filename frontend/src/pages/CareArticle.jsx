import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCareArticle } from '../api/client'
import Breadcrumb from '../components/Breadcrumb'

export default function CareArticle() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    getCareArticle(slug)
      .then((r) => setArticle(r.data))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto h-96 card animate-pulse bg-leaf-100/50" />
      </div>
    )
  }
  if (!article) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={[{ to: '/', label: 'Home' }, { to: '/care-guide', label: 'Care Guide' }, { label: 'Article' }]} />
        <div className="card p-12 text-center max-w-lg mx-auto">
          <p className="text-gray-500 mb-4">Article not found.</p>
          <Link to="/care-guide" className="btn-primary">← Back to Care Guide</Link>
        </div>
      </div>
    )
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-2xl">
      <Breadcrumb
        items={[
          { to: '/', label: 'Home' },
          { to: '/care-guide', label: 'Care Guide' },
          { label: article.title },
        ]}
      />
      {article.image_url && (
        <div className="aspect-video rounded-2xl bg-leaf-100 overflow-hidden mb-6 card">
          <img src={article.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <span className="text-xs text-leaf-600 font-medium uppercase tracking-wide">{article.category}</span>
      <h1 className="font-display text-3xl font-bold text-gray-800 mt-2">{article.title}</h1>
      <div className="mt-6 text-gray-700 whitespace-pre-wrap leading-relaxed">
        {article.content}
      </div>
      <Link to="/care-guide" className="inline-block mt-10 text-leaf-600 font-medium hover:text-leaf-700">
        ← Back to Care Guide
      </Link>
    </article>
  )
}
