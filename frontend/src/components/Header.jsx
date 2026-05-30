import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Header() {
  const [search, setSearch] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { itemCount } = useCart()

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/catalog?search=${encodeURIComponent(search.trim())}`)
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/catalog', label: 'Shop' },
    { to: '/care-guide', label: 'Care Guide' },
    { to: '/garden-planner', label: 'Garden Planner' },
    { to: '/admin', label: 'Admin' },
  ]

  return (
    <header className="bg-leaf-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link
            to="/"
            className="font-display font-bold text-lg md:text-xl text-white hover:text-leaf-100 flex items-center gap-2 transition"
          >
            <span className="text-xl md:text-2xl" aria-hidden>🌱</span>
            <span>GreenGrow</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plants, seeds, tools..."
              aria-label="Search products"
              className="w-full px-4 py-2.5 rounded-l-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-leaf-400 border-0"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-leaf-600 rounded-r-xl hover:bg-leaf-500 font-medium transition"
            >
              Search
            </button>
          </form>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-2 rounded-lg text-leaf-100 hover:text-white hover:bg-leaf-700/50 transition text-sm font-medium"
              >
                {label}
              </Link>
            ))}
            <Link
              to="/wishlist"
              className="px-3 py-2 rounded-lg text-leaf-100 hover:text-white hover:bg-leaf-700/50 transition flex items-center gap-1.5 text-sm font-medium"
              title="Wishlist"
            >
              <span aria-hidden>♥</span>
              <span className="hidden md:inline">Wishlist</span>
            </Link>
            <Link
              to="/cart"
              className="relative px-3 py-2 rounded-lg text-leaf-100 hover:text-white hover:bg-leaf-700/50 transition flex items-center gap-1.5 text-sm font-medium"
              title="Shopping cart"
            >
              <span aria-hidden>🛒</span>
              <span className="hidden md:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 md:top-1 md:right-1 bg-leaf-500 text-white text-xs min-w-[1.25rem] h-5 px-1 rounded-full flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>

          <button
            type="button"
            className="md:hidden p-3 rounded-lg hover:bg-leaf-700/50 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              aria-hidden
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              className="md:hidden py-4 border-t border-leaf-700 relative z-50 bg-leaf-800"
              role="navigation"
              aria-label="Mobile menu"
            >
              <form onSubmit={handleSearch} className="mb-4 px-2">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="input-field w-full"
                />
                <button type="submit" className="btn-primary w-full mt-2">
                  Search
                </button>
              </form>
              <div className="flex flex-col">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="py-3 px-4 text-leaf-100 hover:text-white hover:bg-leaf-700/50 transition font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  to="/wishlist"
                  className="py-3 px-4 text-leaf-100 hover:text-white hover:bg-leaf-700/50 transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <Link
                  to="/cart"
                  className="py-3 px-4 text-leaf-100 hover:text-white hover:bg-leaf-700/50 transition font-medium flex items-center justify-between"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cart
                  {itemCount > 0 && (
                    <span className="bg-leaf-500 text-white text-sm px-2 py-0.5 rounded-full">
                      {itemCount} items
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
