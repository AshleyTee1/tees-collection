import { useState, useEffect } from 'react'
import { useCartStore } from '../store/cartStore'
import { useUiStore } from '../store/uiStore'
import { useWindowWidth } from '../hooks/useWindowWidth'
import { imgUrl } from '../lib/cloudinary'

const AVAIL_LABEL = { in_stock: 'In Stock', by_order: 'By Order', coming_soon: 'Coming Soon', enquire: 'Enquire' }
const AVAIL_STYLE = {
  in_stock:    { background: '#D4EDDA', color: '#2D6A4F' },
  by_order:    { background: '#FFF3CD', color: '#856404' },
  coming_soon: { background: '#EDD5DC', color: '#B07080' },
  enquire:     { background: '#E8D5F5', color: '#6B3FA0' },
}

export default function ProductModal() {
  const { modalProduct: p, closeModal } = useUiStore()
  const addItem = useCartStore(s => s.addItem)
  const showToast = useUiStore(s => s.showToast)
  const isMobile = useWindowWidth() < 768

  const [size, setSize] = useState(null)
  const [colour, setColour] = useState(null)
  const [colourNote, setColourNote] = useState('')
  const [qty, setQty] = useState(0)
  const [shipping, setShipping] = useState('air')
  const [imgIdx, setImgIdx] = useState(0)
  // tracks {letter: qty} for multi-colour products
  const [selections, setSelections] = useState({})

  useEffect(() => {
    setSize(null)
    setColour(null)
    setColourNote('')
    setQty(0)
    setShipping('air')
    setImgIdx(0)
    setSelections({})
  }, [p?.id])

  const selectColour = (c) => {
    setColour(c)
    setQty(selections[c] || 0)
    const idx = p.colours.indexOf(c) + 1
    if (idx > 0 && idx < p.images.length) setImgIdx(idx)
  }

  if (!p) return null

  const hasColours = p.colours.length > 0
  const isEnquire = p.availability === 'enquire'
  const totalSelected = Object.values(selections).reduce((s, q) => s + q, 0)

  const changeQty = (delta) => {
    const next = Math.max(0, qty + delta)
    setQty(next)
    if (hasColours && colour) {
      setSelections(prev => {
        const updated = { ...prev }
        if (next === 0) delete updated[colour]
        else updated[colour] = next
        return updated
      })
    }
  }

  const seaMoqMet = !p.min_order_qty_sea || qty >= p.min_order_qty_sea
  const canAddToCart = p.availability !== 'coming_soon' && p.availability !== 'enquire' &&
    (hasColours ? totalSelected > 0 : qty > 0)

  const handleAdd = () => {
    if (hasColours) {
      const baseImage = p.images?.[0]
      Object.entries(selections).forEach(([col, q]) => {
        const idx = p.colours.indexOf(col) + 1
        const selectedImage = (idx > 0 && idx < p.images.length) ? p.images[idx] : baseImage
        addItem(p, { size, colour: col, qty: q, shipping, selectedImage })
      })
      showToast(`🛍️ ${totalSelected} item${totalSelected > 1 ? 's' : ''} added to cart!`)
    } else {
      const selectedImage = p.images?.[imgIdx] || p.images?.[0]
      addItem(p, { size, colour: colourNote || colour, qty, shipping, selectedImage })
      showToast(`🛍️ ${p.name} added to cart!`)
    }
    closeModal()
  }

  return (
    <div onClick={(e) => e.target === e.currentTarget && closeModal()} style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(44,44,44,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center', padding: isMobile ? 0 : 24,
    }}>
      <div style={{
        background: 'white',
        borderRadius: isMobile ? '20px 20px 0 0' : 20,
        maxWidth: isMobile ? 'none' : 860,
        width: isMobile ? '100vw' : '100%',
        margin: 0,
        maxHeight: isMobile ? '95vh' : '90vh',
        overflowY: 'auto',
        boxShadow: '0 24px 72px rgba(44,44,44,0.22)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: isMobile ? '20px 20px 0 0' : '20px 0 0 20px', overflow: 'hidden' }}>
            {/* Main image with prev/next arrows */}
            <div style={{
              minHeight: isMobile ? 280 : 380, background: '#EDD5DC', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '6rem', flexShrink: 0,
            }}>
              {/* Close button on mobile sits over the image */}
              {isMobile && (
                <button onClick={closeModal} style={{
                  position: 'absolute', top: 12, right: 12, zIndex: 10,
                  background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                  width: 36, height: 36, cursor: 'pointer', fontSize: '1.1rem',
                }}>✕</button>
              )}
              {p.images?.[imgIdx]
                ? <img src={imgUrl(p.images[imgIdx], 800)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: isMobile ? 280 : 380 }} />
                : <span>🛍️</span>}
              {p.images?.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + p.images.length) % p.images.length)} style={arrowBtnStyle('left')}>‹</button>
                  <button onClick={() => setImgIdx(i => (i + 1) % p.images.length)} style={arrowBtnStyle('right')}>›</button>
                </>
              )}
            </div>
            {/* Thumbnail strip */}
            {p.images?.length > 1 && (
              <div style={{
                display: 'flex', gap: 6, padding: '8px 10px', background: '#F9E8EE',
                overflowX: 'auto', flexShrink: 0,
              }}>
                {p.images.map((img, i) => (
                  <img
                    key={i}
                    src={imgUrl(img, 120)}
                    alt=""
                    loading="lazy"
                    onClick={() => setImgIdx(i)}
                    style={{
                      width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0,
                      cursor: 'pointer', border: `2px solid ${imgIdx === i ? '#B07080' : 'transparent'}`,
                      opacity: imgIdx === i ? 1 : 0.65,
                      transition: 'border 0.15s, opacity 0.15s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: isMobile ? '20px 20px 32px' : '36px 32px', overflowY: 'auto' }}>
            {!isMobile && (
              <button onClick={closeModal} style={{
                float: 'right', background: '#EDD5DC', border: 'none', borderRadius: '50%',
                width: 34, height: 34, cursor: 'pointer', fontSize: '1.1rem',
              }}>✕</button>
            )}

            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>
              {p.category} · {p.origin === 'thailand' ? '🇹🇭 Thailand' : '🇨🇳 China'}
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, marginBottom: 6 }}>{p.name}</h2>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#B07080' }}>
                ${p.price_usd}
                <span style={{ fontSize: '0.78rem', color: '#6B5B5F', fontWeight: 400 }}> retail</span>
              </div>
              {/* Air wholesale: price_air lower than retail (e.g. passport covers 10+, glasses 10+) */}
              {p.price_air && p.price_air < p.price_usd && (
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2D6A4F', marginTop: 4 }}>
                  ${p.price_air}
                  <span style={{ fontSize: '0.78rem', color: '#6B5B5F', fontWeight: 400 }}>
                    {' '}wholesale — min. {p.category === 'glasses' ? 10 : p.min_order_qty_sea || 10} {p.unit || (p.category === 'shoes' ? 'pairs' : 'items')} (air)
                  </span>
                </div>
              )}
              {/* Sea wholesale */}
              {p.price_sea && p.price_sea < p.price_usd && p.shipping !== 'air' && (
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2D6A4F', marginTop: 4 }}>
                  ${p.price_sea}
                  <span style={{ fontSize: '0.78rem', color: '#6B5B5F', fontWeight: 400 }}>
                    {' '}wholesale — min. {p.min_order_qty_sea || 50} {p.unit || (p.category === 'shoes' ? 'pairs' : 'items')} (sea)
                  </span>
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.86rem', color: '#6B5B5F', lineHeight: 1.7, marginBottom: 20 }}>{p.description}</p>

            {p.images?.[0] && p.colours.length === 0 && p.category !== 'cosmetics' && (
              <div style={{ marginBottom: 16 }}>
                <div style={labelStyle}>Colour / Style <span style={{ fontSize: '0.7rem', color: '#B07080', fontWeight: 400, textTransform: 'none' }}>— refer to colours shown in the image above</span></div>
                <input
                  type="text"
                  value={colourNote}
                  onChange={e => setColourNote(e.target.value)}
                  placeholder="e.g. Black Gold, Rose Gold Pink..."
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #EDD5DC', borderRadius: 10, fontSize: '0.86rem', outline: 'none', fontFamily: "'Lato', sans-serif", boxSizing: 'border-box' }}
                />
              </div>
            )}

            {p.colours.length > 0 && (
              <>
                <div style={labelStyle}>Colour</div>
                <Chips options={p.colours} selected={colour} onSelect={selectColour} />
              </>
            )}

            {p.sizes.length > 0 && (
              <>
                <div style={labelStyle}>Size</div>
                <Chips options={p.sizes} selected={size} onSelect={setSize} />
              </>
            )}

            {!isEnquire && hasColours && totalSelected > 0 && (
              <div style={{ background: '#F9E8EE', borderRadius: 10, padding: '10px 14px', marginBottom: 10, marginTop: 8 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B07080', marginBottom: 6 }}>Your Selection</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(selections).map(([col, q]) => (
                    <span key={col} style={{ background: '#B07080', color: 'white', borderRadius: 20, padding: '3px 10px', fontSize: '0.78rem', fontWeight: 600 }}>
                      {col} × {q}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!isEnquire && (!hasColours || colour) && <div style={labelStyle}>{hasColours ? `Quantity for ${colour}` : 'Quantity'}</div>}
            {!isEnquire && (!hasColours || colour) && <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 14px' }}>
              <div style={{ display: 'flex', border: '1.5px solid #EDD5DC', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => changeQty(-1)} style={qtyBtnStyle}>−</button>
                <input type="number" value={qty} min={0} onChange={e => { const v = Math.max(0, +e.target.value); setQty(v); if (hasColours && colour) setSelections(prev => { const u = { ...prev }; if (v === 0) delete u[colour]; else u[colour] = v; return u }) }} style={{ width: 46, border: 'none', textAlign: 'center', fontSize: '0.9rem', outline: 'none' }} />
                <button onClick={() => changeQty(1)} style={qtyBtnStyle}>+</button>
              </div>
              {p.min_order_qty_sea > 0 && <span style={{ fontSize: '0.75rem', color: '#6B5B5F' }}>Min {p.min_order_qty_sea} for sea shipping</span>}
            </div>}

            {!isEnquire && <div style={labelStyle}>Shipping Method</div>}
            {!isEnquire && ['air', 'sea'].map(method => {
              const disabled = method === 'sea' && p.shipping === 'air'
              return (
                <label key={method} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  border: `1.5px solid ${shipping === method ? '#B07080' : '#EDD5DC'}`,
                  borderRadius: 12, padding: '14px 16px', cursor: disabled ? 'not-allowed' : 'pointer',
                  background: shipping === method ? '#FDF0F5' : 'white',
                  marginBottom: 10, opacity: disabled ? 0.5 : 1,
                }}>
                  <input type="radio" name="modal-ship" value={method} checked={shipping === method} disabled={disabled} onChange={() => setShipping(method)} style={{ accentColor: '#B07080', marginTop: 3 }} />
                  <div>
                    <strong style={{ fontSize: '0.88rem' }}>{method === 'air' ? '✈️ Air Shipping' : '🚢 Sea Shipping'}</strong>
                    <p style={{ fontSize: '0.76rem', color: '#6B5B5F', marginTop: 2 }}>
                      {method === 'air' ? 'Individual & small orders — 2–3 weeks' : `Bulk orders only — 60–90 days${p.min_order_qty_sea ? ` · Min ${p.min_order_qty_sea} required` : ''}`}
                    </p>
                  </div>
                </label>
              )
            })}

            {!isEnquire && shipping === 'sea' && p.min_order_qty_sea > 0 && !seaMoqMet && (
              <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 10, padding: '10px 14px', fontSize: '0.77rem', color: '#7B5800', marginBottom: 10 }}>
                🚢 Sea shipping requires a minimum of <strong>{p.min_order_qty_sea} {p.unit}s</strong>. Please update your quantity.
              </div>
            )}

            {isEnquire ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ background: '#F5EFF9', border: '1px solid #D4B8EA', borderRadius: 10, padding: '10px 14px', fontSize: '0.8rem', color: '#6B3FA0', marginBottom: 10 }}>
                  This product is available by enquiry. Message us on WhatsApp to check availability and place your order.
                </div>
                <a
                  href={`https://wa.me/66625108102?text=${encodeURIComponent(`Hi, I'd like to order: ${p.name}`)}`}
                  target="_blank" rel="noreferrer"
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                    padding: 13, borderRadius: 12, fontSize: '0.9rem', fontWeight: 700,
                    fontFamily: "'Lato', sans-serif",
                    background: '#25D366', color: 'white', border: 'none', textDecoration: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  💬 WhatsApp to Order
                </a>
              </div>
            ) : (
              <button
                disabled={!canAddToCart || (shipping === 'sea' && !seaMoqMet)}
                onClick={handleAdd}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'center',
                  padding: 13, borderRadius: 12, fontSize: '0.9rem', fontWeight: 700,
                  fontFamily: "'Lato', sans-serif", cursor: canAddToCart ? 'pointer' : 'not-allowed',
                  background: canAddToCart ? '#B07080' : '#EDD5DC',
                  color: canAddToCart ? 'white' : '#6B5B5F', border: 'none', marginTop: 8,
                }}
              >
                {p.availability === 'coming_soon' ? 'Coming Soon' : hasColours && totalSelected > 0 ? `Add to Cart (${totalSelected} item${totalSelected > 1 ? 's' : ''})` : 'Add to Cart'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Chips({ options, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
      {options.map(o => (
        <div key={o} onClick={() => onSelect(o)} style={{
          padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem',
          border: `1.5px solid ${selected === o ? '#B07080' : '#EDD5DC'}`,
          background: selected === o ? '#B07080' : 'white',
          color: selected === o ? 'white' : '#6B5B5F',
        }}>{o}</div>
      ))}
    </div>
  )
}

const labelStyle = { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2C2C2C', marginBottom: 8, marginTop: 14 }
const qtyBtnStyle = { background: 'none', border: 'none', padding: '8px 14px', fontSize: '1rem', cursor: 'pointer' }
const arrowBtnStyle = (side) => ({
  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
  [side]: 10,
  background: 'rgba(255,255,255,0.75)', border: 'none', borderRadius: '50%',
  width: 34, height: 34, fontSize: '1.4rem', lineHeight: '1',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(44,44,44,0.15)', color: '#B07080', fontWeight: 700,
})
