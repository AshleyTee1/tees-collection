import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('tc_token')
    if (!token) { navigate('/login'); return }
    const payload = parseJwt(token)
    if (!payload || payload.role !== 'ADMIN') { navigate('/'); return }
    setAdmin(payload)
  }, [])

  if (!admin) return null

  const nav = [
    { to: '/admin/orders', label: '📦 Orders' },
    { to: '/admin/custom-orders', label: '✉️ Custom Requests' },
    { to: '/admin/products', label: '🛍️ Products' },
    { to: '/admin/settings', label: '⚙️ Settings' },
    { to: '/admin/analytics', label: '📊 Analytics' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FDF6F0' }}>
      {/* SIDEBAR */}
      <div style={{ width: 220, background: '#2C2C2C', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#F2B8C6' }}>Tee's Collection</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Dashboard</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {nav.map(n => (
            <Link key={n.to} to={n.to} style={{
              display: 'block', padding: '10px 14px', borderRadius: 10,
              fontSize: '0.86rem', fontWeight: 600, marginBottom: 4,
              color: location.pathname.startsWith(n.to) ? 'white' : 'rgba(255,255,255,0.6)',
              background: location.pathname.startsWith(n.to) ? '#B07080' : 'transparent',
              textDecoration: 'none',
            }}>{n.label}</Link>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>{admin.email}</div>
          <button onClick={() => { localStorage.removeItem('tc_token'); navigate('/login') }} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  )
}
