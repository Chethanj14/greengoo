import { Link } from 'react-router-dom'

function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="text-leaf-300 hover:text-white text-sm font-medium transition"
    >
      Back to top ↑
    </button>
  )
}

export default function Footer() {
  return (
    <footer className="bg-earth-800 text-leaf-100 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="font-display font-bold text-xl text-white flex items-center gap-2 hover:text-leaf-100 transition">
              🌱 GreenGrow
            </Link>
            <p className="mt-3 text-sm text-leaf-200 leading-relaxed">
              Your one-stop shop for plant cultivation — from seeds to harvest. We help you grow.
            </p>
            <BackToTop />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Shop</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/catalog" className="hover:text-white transition">All Products</Link></li>
              <li><Link to="/catalog?category=Plants" className="hover:text-white transition">Plants</Link></li>
              <li><Link to="/catalog?category=Seeds" className="hover:text-white transition">Seeds</Link></li>
              <li><Link to="/catalog?category=Gardening tools" className="hover:text-white transition">Tools</Link></li>
              <li><Link to="/catalog?category=Soil" className="hover:text-white transition">Soil & Compost</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Help & Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/care-guide" className="hover:text-white transition">Plant Care Guide</Link></li>
              <li><Link to="/garden-planner" className="hover:text-white transition">Garden Planner</Link></li>
              <li><Link to="/catalog" className="hover:text-white transition">Browse Catalog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Need help?</h3>
            <p className="text-sm text-leaf-200 mb-3">
              Check our Care Guide for growing tips, or use the Garden Planner to plan your space.
            </p>
            <Link to="/care-guide" className="text-leaf-400 hover:text-white text-sm font-medium transition">
              Get started →
            </Link>
          </div>
        </div>
        <div className="border-t border-earth-700 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-leaf-300">
          <span>© {new Date().getFullYear()} GreenGrow – Plant Cultivation Store. All rights reserved.</span>
          <Link to="/admin" className="hover:text-leaf-200 transition">Admin</Link>
        </div>
      </div>
    </footer>
  )
}
