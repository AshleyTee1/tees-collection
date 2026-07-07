import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useUiStore } from '../store/uiStore'
import Footer from '../components/Footer'
import { apiUrl } from '../lib/api'
import { useWindowWidth } from '../hooks/useWindowWidth'
import { imgUrl } from '../lib/cloudinary'

const CATEGORIES = ['All', 'Cosmetics', 'Shoes', 'Handbags', 'Jewellery', 'Accessories', 'Watches', 'Glasses', 'Wigs & Hair']

const AVAIL_BADGE = {
  in_stock:    { label: 'In Stock',     style: { background: '#D4EDDA', color: '#2D6A4F' } },
  out_of_stock:{ label: 'Out of Stock', style: { background: '#F8D7DA', color: '#721C24' } },
  by_order:    { label: 'By Order',     style: { background: '#FFF3CD', color: '#856404' } },
  coming_soon: { label: 'Coming Soon',  style: { background: '#EDD5DC', color: '#B07080' } },
  enquire:     { label: 'Enquire',      style: { background: '#E8D5F5', color: '#6B3FA0' } },
}

function effectiveAvail(p) {
  if (p.availability === 'in_stock' && p.stock_qty !== null && p.stock_qty !== undefined && p.stock_qty <= 0) return 'out_of_stock'
  return p.availability
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(() => {
    const cat = searchParams.get('category')
    return cat ? CATEGORIES.find(c => c.toLowerCase() === cat.toLowerCase()) || 'All' : 'All'
  })
  const [availFilter, setAvailFilter] = useState({ in_stock: true, by_order: true, enquire: true })
  const [shippingFilter, setShippingFilter] = useState({ air: true, sea: true })
  const [originFilter, setOriginFilter] = useState({ thailand: true, china: true })
  const [priceRange, setPriceRange] = useState([0, 500])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [showFilters, setShowFilters] = useState(false)
  const width = useWindowWidth()
  const isMobile = width < 768

  const addItem = useCartStore(s => s.addItem)
  const { openModal, showToast } = useUiStore()

  useEffect(() => {
    fetch(apiUrl('/api/v1/products'))
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => {
    if (activeCategory !== 'All' && p.category !== activeCategory.toLowerCase().replace(' ', '_')) return false
    if (p.availability !== 'coming_soon' && availFilter[p.availability] === false) return false
    if (!originFilter[p.origin?.toLowerCase()]) return false
    if (p.price_usd < priceRange[0] || p.price_usd > priceRange[1]) return false
    if (!shippingFilter.air && p.shipping === 'air') return false
    if (!shippingFilter.sea && p.shipping === 'sea') return false
    return true
  })

  const handleAddToCart = (p) => {
    if (p.availability === 'coming_soon') {
      showToast("🔔 We'll notify you when this arrives!")
      return
    }
    if (p.availability === 'enquire') return
    addItem(p)
    showToast(`🛍️ ${p.name} added to cart!`)
  }

  return (
    <>
      <div style={{ background: 'linear-gradient(120deg, #FDF0F5 0%, #FDF6F0 100%)', padding: isMobile ? '32px 16px 20px' : '52px 48px 36px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.4rem', fontWeight: 700 }}>
          Shop <em style={{ color: '#B07080', fontStyle: 'italic' }}>Tee's Collection</em>
        </h1>
        <p style={{ color: '#6B5B5F', marginTop: 8, fontSize: '0.95rem' }}>Ready-to-collect stock at our Harare office, plus available-by-order items shipped direct from Asia.</p>
      </div>

      {/* FILTER CHIPS */}
      <div style={{ background: 'white', borderBottom: '1px solid #EDD5DC', padding: isMobile ? '12px 16px' : '16px 48px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B5B5F' }}>Category:</span>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: '6px 18px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 600,
            border: `1.5px solid ${activeCategory === cat ? '#B07080' : '#EDD5DC'}`,
            background: activeCategory === cat ? '#B07080' : 'white',
            color: activeCategory === cat ? 'white' : '#6B5B5F', cursor: 'pointer',
          }}>{cat}</button>
        ))}
      </div>

      {isMobile && (
        <div style={{ padding: '8px 16px', background: 'white', borderBottom: '1px solid #EDD5DC' }}>
          <button onClick={() => setShowFilters(f => !f)} style={{
            padding: '8px 18px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700,
            border: '1.5px solid #EDD5DC', background: showFilters ? '#B07080' : 'white',
            color: showFilters ? 'white' : '#6B5B5F', cursor: 'pointer',
          }}>
            {showFilters ? '✕ Hide Filters' : '⚙ Filters'}
          </button>
        </div>
      )}

      <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '240px 1fr', minHeight: '60vh' }}>
        {/* SIDEBAR */}
        <div style={{ background: 'white', borderRight: '1px solid #EDD5DC', padding: '32px 24px', display: isMobile && !showFilters ? 'none' : 'block' }}>
          <SidebarSection title="Availability">
            <CheckItem label="Ready to Collect" checked={availFilter.in_stock} onChange={v => setAvailFilter(f => ({ ...f, in_stock: v }))} />
            <CheckItem label="Available by Order" checked={availFilter.by_order} onChange={v => setAvailFilter(f => ({ ...f, by_order: v }))} />
            <CheckItem label="Enquire" checked={availFilter.enquire} onChange={v => setAvailFilter(f => ({ ...f, enquire: v }))} />
          </SidebarSection>
          <SidebarSection title="Shipping Method">
            <CheckItem label="✈️ Air Shipping" checked={shippingFilter.air} onChange={v => setShippingFilter(f => ({ ...f, air: v }))} />
            <CheckItem label="🚢 Sea Shipping (Bulk)" checked={shippingFilter.sea} onChange={v => setShippingFilter(f => ({ ...f, sea: v }))} />
          </SidebarSection>
          <SidebarSection title="Origin">
            <CheckItem label="🇹🇭 Thailand" checked={originFilter.thailand} onChange={v => setOriginFilter(f => ({ ...f, thailand: v }))} />
            <CheckItem label="🇨🇳 China" checked={originFilter.china} onChange={v => setOriginFilter(f => ({ ...f, china: v }))} />
          </SidebarSection>
          <SidebarSection title="Price Range (USD)" last>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" placeholder="Min" min={0} value={priceRange[0]} onChange={e => setPriceRange(r => [+e.target.value, r[1]])} style={priceInput} />
              <span style={{ fontSize: '0.8rem', color: '#6B5B5F' }}>—</span>
              <input type="number" placeholder="Max" min={0} value={priceRange[1]} onChange={e => setPriceRange(r => [r[0], +e.target.value])} style={priceInput} />
            </div>
          </SidebarSection>
        </div>

        {/* PRODUCTS GRID */}
        <div style={{ padding: isMobile ? '16px' : '28px 32px', background: '#FDF6F0' }}>
          {loading ? (
            <p style={{ color: '#6B5B5F', textAlign: 'center', paddingTop: 60 }}>Loading products...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: '#6B5B5F', textAlign: 'center', paddingTop: 60 }}>No products match your filters.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 24 }}>
              {filtered.map(p => {
                const avail = effectiveAvail(p)
              const badge = AVAIL_BADGE[avail]
                return (
                  <div key={p.id} onClick={() => openModal(p)} style={{
                    background: 'white', borderRadius: 14, overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(180,120,140,0.13)',
                    cursor: 'pointer', border: '1.5px solid transparent',
                    transition: 'transform 0.22s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#F2B8C6' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'transparent' }}
                  >
                    <div style={{ height: p.category === 'cosmetics' ? 280 : 210, background: '#EDD5DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', position: 'relative', overflow: 'hidden' }}>
                      {p.images?.[0]
                        ? <img src={imgUrl(p.images[0], 500)} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span>🛍️</span>}
                      <span style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 50, ...badge.style }}>{badge.label}</span>
                    </div>
                    <div style={{ padding: '16px 18px 20px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>
                        {p.category} · {p.origin === 'thailand' ? '🇹🇭 Thailand' : '🇨🇳 China'}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#B07080', marginBottom: 12 }}>
                        ${p.price_usd} <span style={{ fontSize: '0.78rem', color: '#6B5B5F', fontWeight: 400 }}>/ {p.unit}</span>
                      </div>
                      {p.availability === 'enquire' ? (
                        <a
                          href={`https://wa.me/66625108102?text=${encodeURIComponent(`Hi, I'd like to enquire about: ${p.name}`)}`}
                          target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
                            padding: '9px 14px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700,
                            fontFamily: "'Lato', sans-serif", cursor: 'pointer',
                            background: '#25D366', color: 'white', border: 'none', textDecoration: 'none',
                            boxSizing: 'border-box',
                          }}
                        >
                          💬 WhatsApp to Order
                        </a>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); handleAddToCart(p) }}
                          disabled={avail === 'out_of_stock'}
                          style={{
                            width: '100%', display: 'flex', justifyContent: 'center',
                            padding: '9px 14px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700,
                            fontFamily: "'Lato', sans-serif", cursor: avail === 'out_of_stock' ? 'not-allowed' : 'pointer',
                            background: avail === 'out_of_stock' ? '#ccc' : p.availability === 'coming_soon' ? '#C9A96E' : '#B07080',
                            color: 'white', border: 'none',
                          }}
                        >
                          {avail === 'out_of_stock' ? 'Out of Stock' : p.availability === 'coming_soon' ? 'Notify Me' : 'Add to Cart'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

function SidebarSection({ title, children, last }) {
  return (
    <div style={{ marginBottom: 28, borderBottom: last ? 'none' : '1px solid #EDD5DC', paddingBottom: last ? 0 : 24 }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  )
}

function CheckItem({ label, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer' }} onClick={() => onChange(!checked)}>
      <input type="checkbox" checked={checked} onChange={() => onChange(!checked)} style={{ accentColor: '#B07080', width: 15, height: 15 }} />
      <label style={{ fontSize: '0.84rem', color: '#6B5B5F', cursor: 'pointer' }}>{label}</label>
    </div>
  )
}

const priceInput = {
  width: 80, padding: '6px 10px', border: '1.5px solid #EDD5DC',
  borderRadius: 8, fontSize: '0.82rem', outline: 'none', fontFamily: "'Lato', sans-serif",
}
