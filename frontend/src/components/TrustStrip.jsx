/**
 * Trust strip for homepage: free delivery, secure payment, etc.
 */
export default function TrustStrip() {
  const items = [
    { icon: '🚚', title: 'Free delivery', sub: 'On orders over $50' },
    { icon: '🔒', title: 'Secure payment', sub: '100% protected' },
    { icon: '🌿', title: 'Quality assured', sub: 'Fresh & organic' },
    { icon: '💬', title: 'Expert support', sub: 'Care guide & tips' },
  ]
  return (
    <section className="bg-white border-y border-leaf-100 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-center md:text-left">
              <span className="text-2xl" aria-hidden>{item.icon}</span>
              <div>
                <p className="font-semibold text-gray-800">{item.title}</p>
                <p className="text-sm text-gray-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
