import { useEffect, useState } from 'react'
import { apiUrl } from '../../lib/api'

const STATUS_COLOURS = {
  received:             { bg: '#EDD5DC', color: '#B07080' },
  payment_pending:      { bg: '#FFF3CD', color: '#856404' },
  reserved:             { bg: '#D1ECF1', color: '#0C5460' },
  confirmed:            { bg: '#D4EDDA', color: '#155724' },
  shipped_air:          { bg: '#CCE5FF', color: '#004085' },
  shipped_sea:          { bg: '#CCE5FF', color: '#004085' },
  ready_for_collection: { bg: '#D4EDDA', color: '#155724' },
  completed:            { bg: '#C3E6CB', color: '#155724' },
  cancelled:            { bg: '#F8D7DA', color: '#721C24' },
}

const STATUS_OPTIONS = [
  'payment_pending', 'reserved', 'confirmed',
  'shipped_air', 'shipped_sea', 'ready_for_collection', 'completed', 'cancelled',
]

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('tc_token')}` }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch(apiUrl(`/api/v1/orders${filter ? `?status=${filter}` : ''}`), { headers: authHeader() })
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (id, order_status, payment_status) => {
    await fetch(apiUrl(`/api/v1/orders/${id}/status`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ order_status, payment_status }),
    })
    load()
  }

  return (
    <div style={{ padding: 36 }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, marginBottom: 24 }}>Orders</h1>

      {/* FILTER */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {['', ...STATUS_OPTIONS].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 16px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            background: filter === s ? '#B07080' : 'white',
            color: filter === s ? 'white' : '#6B5B5F',
            border: `1.5px solid ${filter === s ? '#B07080' : '#EDD5DC'}`,
          }}>{s === '' ? 'All' : s.replace(/_/g, ' ')}</button>
        ))}
      </div>

      {loading ? <p style={{ color: '#6B5B5F' }}>Loading...</p> : orders.length === 0 ? <p style={{ color: '#6B5B5F' }}>No orders found.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const sc = STATUS_COLOURS[order.order_status] || STATUS_COLOURS.received
            const isOpen = expanded === order.id
            return (
              <div key={order.id} style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 12px rgba(180,120,140,0.1)', overflow: 'hidden' }}>
                {/* ROW */}
                <div onClick={() => setExpanded(isOpen ? null : order.id)} style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: "'Playfair Display', serif" }}>{order.reference_number}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6B5B5F', marginTop: 2 }}>
                      {order.guest_name || order.user?.name || 'Guest'} · {order.guest_email || order.user?.email} · {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#B07080' }}>${(order.subtotal_usd + order.shipping_cost).toFixed(2)}</div>
                  <div style={{ padding: '4px 12px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', ...sc }}>{order.order_status.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6B5B5F', background: '#FDF6F0', padding: '4px 10px', borderRadius: 8 }}>{order.payment_method}</div>
                  <div style={{ color: '#B07080', fontSize: '1rem' }}>{isOpen ? '▲' : '▼'}</div>
                </div>

                {/* EXPANDED */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #EDD5DC', padding: '20px 24px', background: '#FDF9FB' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                      <div>
                        <div style={labelStyle}>Items</div>
                        {order.items?.map((item, i) => (
                          <div key={i} style={{ fontSize: '0.84rem', marginBottom: 4 }}>
                            {item.name} {item.size ? `· ${item.size}` : ''} {item.colour ? `· ${item.colour}` : ''} × {item.qty} — <strong>${item.price_usd}</strong>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={labelStyle}>Customer</div>
                        <div style={{ fontSize: '0.84rem' }}>
                          <div>{order.guest_name || order.user?.name}</div>
                          <div style={{ color: '#6B5B5F' }}>{order.guest_email || order.user?.email}</div>
                          {order.whatsapp && <div style={{ color: '#6B5B5F' }}>WhatsApp: {order.whatsapp}</div>}
                          {order.city && <div style={{ color: '#6B5B5F' }}>{order.city}</div>}
                        </div>
                      </div>
                    </div>

                    {order.ecocash_receipt_url && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={labelStyle}>EcoCash Receipt</div>
                        <img
                          src={order.ecocash_receipt_url}
                          alt="EcoCash receipt"
                          style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 10, border: '1.5px solid #EDD5DC', marginTop: 8, display: 'block', cursor: 'pointer' }}
                          onClick={() => window.open(order.ecocash_receipt_url, '_blank')}
                        />
                      </div>
                    )}

                    <div style={labelStyle}>Update Status</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                      {order.payment_method === 'ecocash' && order.payment_status === 'pending' && (
                        <>
                          <ActionBtn label="✅ Confirm Payment" color="#155724" bg="#D4EDDA" onClick={() => updateStatus(order.id, 'confirmed', 'verified')} />
                          <ActionBtn label="❌ Reject Payment" color="#721C24" bg="#F8D7DA" onClick={() => updateStatus(order.id, 'cancelled', 'rejected')} />
                        </>
                      )}
                      {['confirmed', 'shipped_air', 'shipped_sea', 'ready_for_collection', 'completed', 'cancelled'].map(s => (
                        <ActionBtn key={s} label={s.replace(/_/g, ' ')} color="#2C2C2C" bg="#EDD5DC" onClick={() => updateStatus(order.id, s, undefined)} />
                      ))}
                    </div>

                    {order.order_status === 'ready_for_collection' && order.whatsapp && (
                      <a
                        href={`https://wa.me/${order.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hello ${order.guest_name || order.user?.name || 'there'} 👋\n\nYour order *${order.reference_number}* from *Tee's Collection* is ready for collection! 🛍️\n\n📍 *Our Harare Office:*\nBothwell House, First Floor, Office 4\nBetween 1st & 2nd Street along Jason Moyo Avenue\n\n🕐 *Office Hours:* Monday – Saturday, 9:30am – 4:30pm\n\nPlease bring this message or your order reference number when you come to collect.\n\nThank you for shopping with us! 💕`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-block', marginTop: 12, padding: '9px 20px', borderRadius: 10, background: '#25D366', color: 'white', fontWeight: 700, fontSize: '0.84rem', textDecoration: 'none' }}
                      >
                        📲 Send WhatsApp to Customer
                      </a>
                    )}
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

function ActionBtn({ label, onClick, color, bg }) {
  return (
    <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', background: bg, color, border: 'none', textTransform: 'capitalize' }}>{label}</button>
  )
}

const labelStyle = { fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B5B5F', marginBottom: 6 }
