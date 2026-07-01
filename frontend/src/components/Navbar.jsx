import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useUiStore } from '../store/uiStore'
import { useWindowWidth } from '../hooks/useWindowWidth'

export default function Navbar() {
  const items = useCartStore(s => s.items)
  const openCart = useUiStore(s => s.openCart)
  const [menuOpen, setMenuOpen] = useState(false)
  const width = useWindowWidth()
  const isMobile = width < 768

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(253,246,240,0.96)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #EDD5DC',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '12px 16px' : '14px 48px',
      }}>
        <Link to="/" onClick={() => setMenuOpen(false)} style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? '1.2rem' : '1.55rem', fontWeight: 700, color: '#B07080', letterSpacing: '0.02em' }}>
          Tee<span style={{ color: '#C9A96E', fontStyle: 'italic' }}>'s</span> Collection
        </Link>

        {!isMobile && (
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {[['Home', '/'], ['Shop', '/shop'], ['Custom Order', '/custom-order']].map(([label, to]) => (
              <Link key={to} to={to} style={{ fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B5B5F' }}>{label}</Link>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={openCart} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: isMobile ? '7px 12px' : '9px 22px', borderRadius: 50,
            fontFamily: "'Lato', sans-serif", fontSize: '0.84rem', fontWeight: 700,
            cursor: 'pointer', background: 'transparent', border: '1.5px solid #B07080', color: '#B07080',
          }}>
            🛍️ <span style={{ display: isMobile ? 'none' : 'inline' }}>Cart</span>
            <span style={{
              background: '#B07080', color: 'white', borderRadius: '50%',
              width: 18, height: 18, fontSize: '0.7rem',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>{items.length}</span>
          </button>

          {!isMobile && (
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '9px 22px', borderRadius: 50,
              fontFamily: "'Lato', sans-serif", fontSize: '0.84rem', fontWeight: 700,
              background: '#B07080', color: 'white', border: 'none', cursor: 'pointer',
            }}>Sign In</Link>
          )}

          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.4rem', color: '#B07080', padding: '4px 8px',
            }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: 57, left: 0, right: 0, zIndex: 99,
          background: 'rgba(253,246,240,0.98)', borderBottom: '1px solid #EDD5DC',
          display: 'flex', flexDirection: 'column', padding: '8px 0',
        }}>
          {[['Home', '/'], ['Shop', '/shop'], ['Custom Order', '/custom-order'], ['Sign In', '/login']].map(([label, to]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
              padding: '14px 24px', fontSize: '0.95rem', fontWeight: 600,
              color: '#6B5B5F', borderBottom: '1px solid #EDD5DC',
            }}>{label}</Link>
          ))}
        </div>
      )}
    </>
  )
}
