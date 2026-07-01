import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useUiStore } from '../store/uiStore'
import { useWindowWidth } from '../hooks/useWindowWidth'

export default function CartPanel() {
  const { items, removeItem, updateQty, subtotal } = useCartStore()
  const { cartOpen, closeCart } = useUiStore()
  const navigate = useNavigate()
  const isMobile = useWindowWidth() < 768

  const go = () => { closeCart(); navigate('/checkout') }

  return (
    <>
      {cartOpen && (
        <div onClick={closeCart} style={{
          position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(44,44,44,0.4)',
        }} />
      )}
      <div style={{
        position: 'fixed', top: 0, right: cartOpen ? 0 : -420,
        height: '100vh', width: isMobile ? '100vw' : 390, zIndex: 401,
        background: 'white', boxShadow: '-8px 0 40px rgba(44,44,44,0.15)',
        transition: 'right 0.32s cubic-bezier(.21,1,.49,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: 24, borderBottom: '1px solid #EDD5DC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700 }}>🛍️ Your Cart</h3>
          <button onClick={closeCart} style={{ background: '#EDD5DC', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B5B5F' }}>
              <div style={{ fontSize: '3rem', marginBottom: 14 }}>🛍️</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, marginBottom: 6 }}>Your cart is empty</p>
              <p style={{ fontSize: '0.82rem' }}>Start browsing to add items you love.</p>
            </div>
          ) : items.map(item => (
            <div key={item.cartId} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid #EDD5DC', alignItems: 'flex-start' }}>
              <div style={{ width: 66, height: 66, background: '#EDD5DC', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0, overflow: 'hidden' }}>
                {(item.selectedImage || item.images?.[0]) ? <img src={item.selectedImage || item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span>{item.emoji || '🛍️'}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.9rem', fontWeight: 600 }}>{item.name}</h4>
                {(item.size || item.colour) && (
                  <p style={{ fontSize: '0.75rem', color: '#6B5B5F', marginTop: 3 }}>
                    {item.size ? `Size: ${item.size}` : ''}{item.size && item.colour ? ' · ' : ''}{item.colour || ''}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <div style={{ display: 'flex', border: '1px solid #EDD5DC', borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => updateQty(item.cartId, (item.qty || 1) - 1)} style={{ background: 'none', border: 'none', padding: '2px 8px', fontSize: '0.9rem', cursor: 'pointer', color: '#B07080' }}>−</button>
                    <span style={{ padding: '2px 6px', fontSize: '0.82rem', fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.qty || 1}</span>
                    <button onClick={() => updateQty(item.cartId, (item.qty || 1) + 1)} style={{ background: 'none', border: 'none', padding: '2px 8px', fontSize: '0.9rem', cursor: 'pointer', color: '#B07080' }}>+</button>
                  </div>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#B07080' }}>${item.price_usd}</span>
                </div>
              </div>
              <button onClick={() => removeItem(item.cartId)} style={{ background: 'none', border: 'none', color: '#6B5B5F', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div style={{ padding: 20, borderTop: '1px solid #EDD5DC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: '0.84rem', color: '#6B5B5F' }}>Subtotal (excl. shipping)</span>
              <strong style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem' }}>${subtotal().toFixed(2)}</strong>
            </div>
            <button onClick={go} style={{
              width: '100%', display: 'flex', justifyContent: 'center',
              padding: 14, fontSize: '0.9rem', borderRadius: 14,
              background: '#B07080', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: "'Lato', sans-serif",
            }}>Proceed to Checkout</button>
          </div>
        )}
      </div>
    </>
  )
}
