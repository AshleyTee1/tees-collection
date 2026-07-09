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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('tc_token')
    if (!token) { navigate('/login'); return }
    const payload = parseJwt(token)
    if (!payload || payload.role !== 'ADMIN') { navigate('/'); return }
    setAdmin(payload)
  }, [])

  // Close sidebar when navigating
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  if (!admin) return null

  const nav = [
    { to: '/admin/orders', label: '📦 Orders' },
    { to: '/admin/custom-orders', label: '✉️ Custom Requests' },
    { to: '/admin/products', label: '🛍️ Products' },
    { to: '/admin/settings', label: '⚙️ Settings' },
    { to: '/admin/analytics', label: '📊 Analytics' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FDF6F0', position: 'relative' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }}
        />
      )}

      {/* SIDEBAR */}
      <div style={{
        width: 220, background: '#2C2C2C', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 300,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }}>
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#F2B8C6' }}>Tee's Collection</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Dashboard</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {nav.map(n => (
            <Link key={n.to} to={n.to} style={{
              display: 'block', padding: '12px 14px', borderRadius: 10,
              fontSize: '0.9rem', fontWeight: 600, marginBottom: 4,
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

      {/* CONTENT — full width, with top bar */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar with hamburger */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 20px', background: 'white',
          borderBottom: '1px solid #EDD5DC', position: 'sticky', top: 0, zIndex: 100,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 5 }}
            aria-label="Open menu"
          >
            <span style={{ display: 'block', width: 24, height: 2.5, background: '#2C2C2C', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 24, height: 2.5, background: '#2C2C2C', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 24, height: 2.5, background: '#2C2C2C', borderRadius: 2 }} />
          </button>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: '#B07080' }}>Tee's Collection</span>
          <span style={{ fontSize: '0.72rem', color: '#9B8B8F', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</span>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
