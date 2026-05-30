import { Link } from 'react-router-dom'

/**
 * Breadcrumb for easier navigation (e.g. Home > Shop > Product name).
 */
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-leaf-300">/</span>}
            {item.to ? (
              <Link to={item.to} className="hover:text-leaf-600 transition">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
