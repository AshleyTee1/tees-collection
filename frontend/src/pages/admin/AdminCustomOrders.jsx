import { useEffect, useState } from 'react'
import { apiUrl } from '../../lib/api'

const STATUS_COLOURS = {
  pending:  { bg: '#FFF3CD', color: '#856404' },
  reviewed: { bg: '#CCE5FF', color: '#004085' },
  quoted:   { bg: '#D4EDDA', color: '#155724' },
  declined: { bg: '#F8D7DA', color: '#721C24' },
}

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('tc_token')}` }
}

export default function AdminCustomOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [notes, setNotes] = useState({})

  const load = async () => {
    setLoading(true)
    const res = await fetch(apiUrl('/api/v1/custom-orders'), { headers: authHeader() })
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const update = async (id, status, admin_notes) => {
    await fetch(apiUrl(`/api/v1/custom-orders/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ status, admin_notes }),
    })
    load()
  }

  return (
    <div style={{ padding: 36 }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, marginBottom: 24 }}>Custom Order Requests</h1>

      {loading ? <p style={{ color: '#6B5B5F' }}>Loading...</p> : orders.length === 0 ? <p style={{ color: '#6B5B5F' }}>No custom requests yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const sc = STATUS_COLOURS[order.status] || STATUS_COLOURS.pending
            const isOpen = expanded === order.id
            return (
              <div key={order.id} style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 12px rgba(180,120,140,0.1)', overflow: 'hidden' }}>
                <div onClick={() => setExpanded(isOpen ? null : order.id)} style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: "'Playfair Display', serif" }}>{order.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6B5B5F', marginTop: 2 }}>
                      {order.category || 'No category'} · {order.contact_method === 'wa' ? '💬' : '📧'} {order.contact_value} · {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ padding: '4px 12px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', ...sc }}>{order.status}</div>
                  <div style={{ color: '#B07080' }}>{isOpen ? '▲' : '▼'}</div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid #EDD5DC', padding: '20px 24px', background: '#FDF9FB' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                      <div>
                        <div style={labelStyle}>Description</div>
                        <p style={{ fontSize: '0.84rem', lineHeight: 1.6 }}>{order.description}</p>
                        {order.quantity && <p style={{ fontSize: '0.84rem', marginTop: 8 }}>Qty: <strong>{order.quantity}</strong></p>}
                      </div>
                      <div>
                        <div style={labelStyle}>Contact</div>
                        <div style={{ fontSize: '0.84rem' }}>
                          <div><strong>{order.name}</strong></div>
                          {order.city && <div style={{ color: '#6B5B5F' }}>{order.city}</div>}
                          <div style={{ marginTop: 6 }}>{order.contact_method === 'wa' ? '💬 WhatsApp:' : '📧 Email:'} <strong>{order.contact_value}</strong></div>
                        </div>
                      </div>
                    </div>

                    {order.image_url && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={labelStyle}>Product Photo</div>
                        <img src={order.image_url} alt="Product" style={{ maxWidth: 200, borderRadius: 10 }} />
                      </div>
                    )}

                    <div style={labelStyle}>Admin Notes</div>
                    <textarea
                      value={notes[order.id] ?? order.admin_notes ?? ''}
                      onChange={e => setNotes(n => ({ ...n, [order.id]: e.target.value }))}
                      placeholder="Add notes, quote, or response..."
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #EDD5DC', borderRadius: 10, fontSize: '0.84rem', fontFamily: "'Lato', sans-serif", resize: 'vertical', minHeight: 80, marginBottom: 12, outline: 'none' }}
                    />

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['pending', 'reviewed', 'quoted', 'declined'].map(s => (
                        <button key={s} onClick={() => update(order.id, s, notes[order.id] ?? order.admin_notes)} style={{
                          padding: '7px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: 'none', textTransform: 'capitalize',
                          background: order.status === s ? '#B07080' : '#EDD5DC',
                          color: order.status === s ? 'white' : '#2C2C2C',
                        }}>{s}</button>
                      ))}
                      <button onClick={() => update(order.id, order.status, notes[order.id])} style={{ padding: '7px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: 'none', background: '#2C2C2C', color: 'white' }}>Save Notes</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const labelStyle = { fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B5B5F', marginBottom: 6 }
