import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#2C2C2C', color: 'rgba(255,255,255,0.8)', padding: '52px 48px 30px', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, color: '#F2B8C6', marginBottom: 8 }}>Tee's Collection</div>
      <p style={{ fontSize: '0.83rem', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 28px' }}>
        Premium fashion, cosmetics & accessories — sourced from Thailand & China, delivered to Zimbabwe with love.
      </p>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
        {[['Home', '/'], ['Shop', '/shop'], ['Custom Order', '/custom-order']].map(([label, to]) => (
          <Link key={label} to={to} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', fontWeight: 600 }}>{label}</Link>
        ))}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
        © 2025 Tee's Collection · Harare, Zimbabwe · All rights reserved
      </div>
    </footer>
  )
}
