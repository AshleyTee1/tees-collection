import { useEffect, useState } from 'react'
import { apiUrl } from '../../lib/api'

const PAGE_LABELS = {
  '/': 'Home',
  '/shop': 'Shop',
  '/custom-order': 'Custom Order',
  '/checkout': 'Checkout',
  '/confirmation': 'Confirmation',
  '/login': 'Login',
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('tc_token')
    fetch(apiUrl('/api/v1/analytics'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Failed to load analytics'); setLoading(false) })
  }, [])

  if (loading) return <div style={pageStyle}><p style={{ color: '#6B5B5F' }}>Loading analytics...</p></div>
  if (error) return <div style={pageStyle}><p style={{ color: '#B07080' }}>{error}</p></div>

  const maxViews = Math.max(...(data.daily?.map(d => d.views) || [1]), 1)

  return (
    <div style={pageStyle}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, marginBottom: 6 }}>Analytics</h1>
      <p style={{ color: '#6B5B5F', fontSize: '0.85rem', marginBottom: 32 }}>Page views from your shop visitors</p>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
        {[
          { label: 'Today', value: data.totalToday },
          { label: 'This Week', value: data.totalWeek },
          { label: 'This Month', value: data.totalMonth },
          { label: 'All Time', value: data.totalAll },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 12px rgba(180,120,140,0.1)', border: '1.5px solid #EDD5DC' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C9A96E', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#B07080' }}>{s.value?.toLocaleString() ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: '#6B5B5F', marginTop: 4 }}>page views</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Daily bar chart */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>Views — Last 30 Days</h2>
          {data.daily?.length === 0 ? (
            <p style={{ color: '#6B5B5F', fontSize: '0.85rem' }}>No data yet.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140, paddingTop: 8 }}>
              {data.daily.map((d, i) => {
                const height = Math.max(4, Math.round((d.views / maxViews) * 120))
                const date = new Date(d.date)
                const label = `${date.getMonth() + 1}/${date.getDate()}`
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }} title={`${label}: ${d.views} views`}>
                    <div style={{ fontSize: '0.58rem', color: '#B07080', fontWeight: 600 }}>{d.views > 0 ? d.views : ''}</div>
                    <div style={{ width: '100%', height, background: '#B07080', borderRadius: '3px 3px 0 0', opacity: 0.8 }} />
                    {data.daily.length <= 14 && <div style={{ fontSize: '0.55rem', color: '#9B8B8F', transform: 'rotate(-40deg)', whiteSpace: 'nowrap' }}>{label}</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top pages */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>Top Pages</h2>
          {data.topPages?.length === 0 ? (
            <p style={{ color: '#6B5B5F', fontSize: '0.85rem' }}>No data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.topPages.map((p, i) => {
                const label = PAGE_LABELS[p.path] || p.path
                const pct = Math.round((p._count.path / data.topPages[0]._count.path) * 100)
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2C2C2C' }}>{label}</span>
                      <span style={{ fontSize: '0.82rem', color: '#B07080', fontWeight: 700 }}>{p._count.path.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 6, background: '#EDD5DC', borderRadius: 4 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#B07080', borderRadius: 4 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <p style={{ marginTop: 24, fontSize: '0.75rem', color: '#9B8B8F' }}>
        Note: your own admin visits are not counted. Data starts from when analytics was first set up.
      </p>
    </div>
  )
}

const pageStyle = { padding: '36px 40px', maxWidth: 1000 }
const cardStyle = { background: 'white', borderRadius: 14, padding: '24px 24px 20px', boxShadow: '0 2px 12px rgba(180,120,140,0.1)', border: '1.5px solid #EDD5DC' }
const cardTitle = { fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: '#2C2C2C' }
