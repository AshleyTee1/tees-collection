import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useUiStore } from '../store/uiStore'

export default function Navbar() {
  const items = useCartStore(s => s.items)
  const openCart = useUiStore(s => s.openCart)

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(253,246,240,0.96)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #EDD5DC',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 48px',
    }}>
      <Link to="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.55rem', fontWeight: 700, color: '#B07080', letterSpacing: '0.02em' }}>
        Tee<span style={{ color: '#C9A96E', fontStyle: 'italic' }}>'s</span> Collection
      </Link>

      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {[['Home', '/'], ['Shop', '/shop'], ['Custom Order', '/custom-order']].map(([label, to]) => (
          <Link key={to} to={to} style={{ fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B5B5F' }}>{label}</Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={openCart} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '9px 22px', borderRadius: 50, fontFamily: "'Lato', sans-serif",
          fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer',
          background: 'transparent', border: '1.5px solid #B07080', color: '#B07080',
        }}>
          🛍️ Cart
          <span style={{
            background: '#B07080', color: 'white', borderRadius: '50%',
            width: 18, height: 18, fontSize: '0.7rem',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>{items.length}</span>
        </button>
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '9px 22px', borderRadius: 50,
          fontFamily: "'Lato', sans-serif", fontSize: '0.84rem', fontWeight: 700,
          background: '#B07080', color: 'white', border: 'none', cursor: 'pointer',
        }}>Sign In</Link>
      </div>
    </nav>
  )
}
