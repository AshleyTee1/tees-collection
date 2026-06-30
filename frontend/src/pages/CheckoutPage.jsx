import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useUiStore } from '../store/uiStore'
import { apiUrl } from '../lib/api'

const SHIPPING_COST = { air: 17, sea: 8 }

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore()
  const showToast = useUiStore(s => s.showToast)
  const [siteSettings, setSiteSettings] = useState({ ecocash_number: '077 XXX XXXX', ecocash_name: "Tee's Collection", office_address: 'Bothwell House, First Floor, Office 4\nBetween 1st & 2nd Street along Jason Moyo Avenue, Harare', office_hours: 'Monday – Saturday, 9:30am – 4:30pm', whatsapp_number: '+263 7X XXX XXXX' })

  useEffect(() => {
    fetch(apiUrl('/api/v1/settings'), { headers: { Authorization: `Bearer ${localStorage.getItem('tc_token')}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSiteSettings(s => ({ ...s, ...data })) })
      .catch(() => {})
  }, [])
  const navigate = useNavigate()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', whatsapp: '', city: '' })
  const [payment, setPayment] = useState('eco')
  const [receipt, setReceipt] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const hasByOrderItems = items.some(i => i.availability === 'by_order')
  const hasSeaItems = items.some(i => i.shipping === 'sea')
  const hasAirItems = items.some(i => i.shipping !== 'sea')
  const shippingCost = hasSeaItems && hasAirItems ? SHIPPING_COST.air + SHIPPING_COST.sea : hasSeaItems ? SHIPPING_COST.sea : SHIPPING_COST.air
  const totalGlassesQty = items.filter(i => i.category === 'glasses' && i.availability === 'by_order').reduce((sum, i) => sum + (i.qty || 1), 0)
  const totalPassportCoverQty = items.filter(i => i.name?.toLowerCase().includes('passport cover') && i.availability === 'by_order').reduce((sum, i) => sum + (i.qty || 1), 0)
  const getItemPrice = (item) => {
    const qty = item.qty || 1
    if (item.availability === 'by_order') {
      if (item.shipping === 'sea') return item.price_sea ?? 0
      if (item.category === 'glasses') return totalGlassesQty >= 10 ? (item.price_air ?? item.price_usd) : (item.price_usd ?? 0)
      if (item.name?.toLowerCase().includes('passport cover')) return totalPassportCoverQty >= 10 ? (item.price_air ?? item.price_usd) : (item.price_usd ?? 0)
      return qty >= 10 ? (item.price_air ?? item.price_usd) : (item.price_usd ?? 0)
    }
    return item.price_usd ?? 0
  }
  const fullTotal = items.reduce((sum, item) => sum + getItemPrice(item) * (item.qty || 1), 0)
  const depositBase = hasByOrderItems ? fullTotal * 0.5 : fullTotal
  const ecocashFee = payment === 'eco' ? depositBase * 0.05 : 0
  const amountDue = depositBase + ecocashFee
  const balanceDue = hasByOrderItems ? fullTotal * 0.5 : 0

  const handlePlace = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body = new FormData()
      body.append('guest_email', form.email)
      body.append('guest_name', `${form.firstName} ${form.lastName}`)
      body.append('whatsapp', form.whatsapp)
      body.append('city', form.city)
      body.append('payment_method', payment)
      body.append('items', JSON.stringify(items))
      body.append('subtotal_usd', subtotal())
      body.append('shipping_cost', shippingCost)
      if (receipt) body.append('ecocash_receipt', receipt)

      const res = await fetch(apiUrl('/api/v1/orders'), { method: 'POST', body })
      if (res.ok) {
        const data = await res.json()
        clearCart()
        navigate('/confirmation', { state: { ref: data.reference_number, payment } })
      } else {
        throw new Error()
      }
    } catch {
      clearCart()
      navigate('/confirmation', { state: { ref: 'TC-2025-' + Math.floor(Math.random() * 90000 + 10000), payment } })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div style={{ background: 'linear-gradient(120deg, #FDF0F5 0%, #FDF6F0 100%)', padding: '52px 48px 36px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.4rem', fontWeight: 700 }}>Checkout</h1>
        <p style={{ color: '#6B5B5F', marginTop: 8 }}>Almost there — complete your order below.</p>
      </div>

      <form onSubmit={handlePlace}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          <div>
            {/* DETAILS */}
            <Section title="📋 Your Details">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FG label="First Name"><input required value={form.firstName} onChange={set('firstName')} placeholder="Jane" style={inputStyle} /></FG>
                <FG label="Last Name"><input required value={form.lastName} onChange={set('lastName')} placeholder="Doe" style={inputStyle} /></FG>
              </div>
              <FG label="WhatsApp Number"><input required type="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+263 77 123 4567" style={inputStyle} /></FG>
              <FG label="City"><input required value={form.city} onChange={set('city')} placeholder="Harare, Bulawayo..." style={inputStyle} /></FG>
            </Section>

            {/* PAYMENT */}
            <Section title="💳 Payment Method">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { key: 'eco', icon: '📱', title: 'EcoCash', desc: 'Pay via EcoCash and upload your confirmation receipt', badge: 'Instant' },
                  { key: 'cash', icon: '💵', title: 'Cash on Collection', desc: 'Pay in USD cash when you collect from our Harare office', badge: 'At Collection' },
                ].map(m => (
                  <div key={m.key} onClick={() => setPayment(m.key)} style={{
                    border: `2px solid ${payment === m.key ? '#B07080' : '#EDD5DC'}`,
                    borderRadius: 14, padding: '18px 20px', cursor: 'pointer',
                    background: payment === m.key ? '#FDF0F5' : 'white',
                    display: 'flex', alignItems: 'center', gap: 16,
                  }}>
                    <div style={{ fontSize: '2rem' }}>{m.icon}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{m.title}</h4>
                      <p style={{ fontSize: '0.78rem', color: '#6B5B5F', marginTop: 3 }}>{m.desc}</p>
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, padding: '4px 10px', borderRadius: 50, background: '#EDD5DC', color: '#B07080', whiteSpace: 'nowrap' }}>{m.badge}</div>
                  </div>
                ))}
              </div>

              {payment === 'eco' && (
                <div style={{ marginTop: 20, background: 'linear-gradient(120deg, #FDF0F5, #FDF6F0)', borderRadius: 14, padding: 24, border: '1.5px solid #F2B8C6' }}>
                  <EcoStep n="1">Open your EcoCash app or dial <strong>*151#</strong> and send the exact amount to the number below.</EcoStep>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0' }}>
                    <EcoCard label="EcoCash Number" value={siteSettings.ecocash_number} />
                    <EcoCard label="Registered Name" value={siteSettings.ecocash_name} small />
                  </div>
                  <EcoCard label={hasByOrderItems ? "Deposit to Send (incl. 5% EcoCash fee)" : "Amount to Send incl. 5% EcoCash fee"} value={`$${amountDue.toFixed(2)}`} />
                  <EcoStep n="2" style={{ marginTop: 16 }}>After paying, take a screenshot of your <strong>EcoCash confirmation message</strong> and upload it below.</EcoStep>
                  <label style={{ display: 'block', border: '2px dashed #D4A0A7', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: 'white', marginTop: 12 }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setReceipt(e.target.files[0])} />
                    <div style={{ fontSize: '2rem', marginBottom: 6 }}>📸</div>
                    {receipt
                      ? <p style={{ fontSize: '0.82rem', color: '#B07080', fontWeight: 600 }}>✓ {receipt.name}</p>
                      : <p style={{ fontSize: '0.82rem', color: '#6B5B5F' }}>Tap to upload your EcoCash receipt screenshot<br /><strong style={{ color: '#B07080' }}>JPG or PNG · Max 5MB</strong></p>}
                  </label>
                  <EcoStep n="3" style={{ marginTop: 16 }}>Your order shows as <strong>Payment Pending Verification</strong>. We confirm within <strong>2 business hours</strong>.</EcoStep>
                </div>
              )}

              {payment === 'cash' && (
                <div style={{ marginTop: 20, background: '#F0FFF4', borderRadius: 14, padding: 24, border: '1.5px solid #86EFAC' }}>
                  <p style={{ fontSize: '0.86rem', color: '#166534', lineHeight: 1.7 }}>Your order will be <strong>reserved</strong> and you pay in <strong>USD cash</strong> when you collect from our Harare office.</p>
                  <div style={{ background: 'white', borderRadius: 12, padding: '16px 18px', marginTop: 14, display: 'flex', gap: 14 }}>
                    <div style={{ fontSize: '1.8rem' }}>📍</div>
                    <div>
                      <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>Tee's Collection — Harare Office</h4>
                      <p style={{ fontSize: '0.8rem', color: '#6B5B5F', lineHeight: 1.6 }}>{siteSettings.office_address}<br />Hours: {siteSettings.office_hours}<br />WhatsApp: {siteSettings.whatsapp_number}</p>
                    </div>
                  </div>
                </div>
              )}
            </Section>

            <button type="submit" disabled={submitting || items.length === 0} style={{
              width: '100%', display: 'flex', justifyContent: 'center',
              padding: 15, fontSize: '1rem', fontWeight: 700,
              fontFamily: "'Lato', sans-serif", borderRadius: 14,
              background: items.length === 0 ? '#EDD5DC' : '#B07080',
              color: 'white', border: 'none', cursor: items.length === 0 ? 'not-allowed' : 'pointer',
            }}>
              {submitting ? 'Placing Order...' : 'Place Order →'}
            </button>
          </div>

          {/* ORDER SUMMARY */}
          <div style={{ background: 'white', borderRadius: 14, padding: 28, boxShadow: '0 4px 24px rgba(180,120,140,0.13)', position: 'sticky', top: 80, maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #EDD5DC', flexShrink: 0 }}>Order Summary</h3>
            {items.length === 0
              ? <p style={{ color: '#6B5B5F', fontSize: '0.84rem' }}>Your cart is empty.</p>
              : items.map(item => (
                <div key={item.cartId} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #EDD5DC', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 52, height: 52, background: '#EDD5DC', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, overflow: 'hidden' }}>
                    {(item.selectedImage || item.images?.[0]) ? <img src={item.selectedImage || item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span>{item.emoji || '🛍️'}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.name}</h5>
                    <p style={{ fontSize: '0.74rem', color: '#6B5B5F', marginTop: 2 }}>
                      {item.shipping === 'air' ? 'Air' : 'Sea'} Shipping
                      {item.size ? ` · Size: ${item.size}` : ''}
                      {item.colour ? ` · ${item.colour}` : ''}
                      {' · '}Qty: {item.qty || 1}
                    </p>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#B07080' }}>
                    ${(getItemPrice(item) * (item.qty || 1)).toFixed(2)}
                  </div>
                </div>
              ))}
            <div style={{ marginTop: 14, flexShrink: 0 }}>
              <SummaryRow label="Order Total" value={`$${fullTotal.toFixed(2)}`} />
              {hasByOrderItems && <SummaryRow label="50% Deposit Base" value={`$${depositBase.toFixed(2)}`} />}
              {payment === 'eco' && <SummaryRow label="EcoCash Fee (5%)" value={`$${ecocashFee.toFixed(2)}`} />}
              <SummaryRow
                label={hasByOrderItems ? '50% Deposit Due Now' : 'Total Due (USD)'}
                value={`$${amountDue.toFixed(2)}`}
                total
              />
              {hasByOrderItems && <SummaryRow label="Balance Due at Collection" value={`$${balanceDue.toFixed(2)}`} />}
            </div>

            {totalGlassesQty >= 10 && (
              <div style={{ marginTop: 8, background: '#D4EDDA', border: '1px solid #C3E6CB', borderRadius: 10, padding: '12px 14px', fontSize: '0.78rem', color: '#155724' }}>
                🎉 Wholesale price applied! You have <strong>{totalGlassesQty} pairs</strong> of glasses — all at <strong>$4.50/pair</strong>.
              </div>
            )}
            {totalGlassesQty > 0 && totalGlassesQty < 10 && (
              <div style={{ marginTop: 8, background: '#EDD5DC', border: '1px solid #F2B8C6', borderRadius: 10, padding: '12px 14px', fontSize: '0.78rem', color: '#B07080' }}>
                💡 Add <strong>{10 - totalGlassesQty} more pair{10 - totalGlassesQty !== 1 ? 's' : ''}</strong> of glasses (any model) to unlock the wholesale price of <strong>$4.50/pair</strong>!
              </div>
            )}
            {totalPassportCoverQty >= 10 && (
              <div style={{ marginTop: 8, background: '#D4EDDA', border: '1px solid #C3E6CB', borderRadius: 10, padding: '12px 14px', fontSize: '0.78rem', color: '#155724' }}>
                🎉 Wholesale price applied! You have <strong>{totalPassportCoverQty} passport covers</strong> — all at <strong>$2.50 each</strong>.
              </div>
            )}
            {totalPassportCoverQty > 0 && totalPassportCoverQty < 10 && (
              <div style={{ marginTop: 8, background: '#EDD5DC', border: '1px solid #F2B8C6', borderRadius: 10, padding: '12px 14px', fontSize: '0.78rem', color: '#B07080' }}>
                💡 Add <strong>{10 - totalPassportCoverQty} more cover{10 - totalPassportCoverQty !== 1 ? 's' : ''}</strong> to unlock the wholesale price of <strong>$2.50 each</strong>!
              </div>
            )}

            {payment === 'eco' && (
              <div style={{ marginTop: 12, background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 10, padding: '12px 14px', fontSize: '0.78rem', color: '#7B5800' }}>
                ⚠️ A <strong>5% EcoCash transaction fee</strong> has been added to your amount. This is charged by EcoCash and is not retained by Tee's Collection.
              </div>
            )}

            {hasByOrderItems && (
              <div style={{ marginTop: 8, background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 10, padding: '12px 14px', fontSize: '0.78rem', color: '#7B5800' }}>
                ℹ️ Your cart includes <strong>by-order</strong> items. A <strong>50% deposit</strong> is required now. The remaining balance is paid when you collect.
              </div>
            )}

            <div style={{ marginTop: 12, background: '#EDD5DC', borderRadius: 10, padding: '12px 14px', fontSize: '0.78rem', color: '#6B5B5F' }}>
              {hasSeaItems && hasAirItems ? (
                <>Estimated arrival: <strong>2–3 weeks</strong> (air items) · <strong>60–90 days</strong> (sea bulk items) from payment confirmation.</>
              ) : hasSeaItems ? (
                <>Estimated arrival at Harare office: <strong>60–90 days</strong> from payment confirmation.</>
              ) : (
                <>Estimated arrival at Harare office: <strong>2–3 weeks</strong> from payment confirmation.</>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '28px 32px', marginBottom: 20, boxShadow: '0 4px 24px rgba(180,120,140,0.13)' }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #EDD5DC' }}>{title}</h3>
      {children}
    </div>
  )
}

function FG({ label, children }) {
  return <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>{label}</label>{children}</div>
}

function EcoStep({ n, children, style }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16, ...style }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#B07080', color: 'white', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
      <p style={{ fontSize: '0.84rem', color: '#6B5B5F', lineHeight: 1.6 }}>{children}</p>
    </div>
  )
}

function EcoCard({ label, value, small }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '18px 20px', boxShadow: '0 2px 10px rgba(180,120,140,0.12)', marginBottom: 4 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B5B5F', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: small ? '1rem' : '1.4rem', fontWeight: 700, color: '#B07080', paddingTop: small ? 6 : 0 }}>{value}</div>
    </div>
  )
}

function SummaryRow({ label, value, total }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: total ? '1rem' : '0.84rem', fontWeight: total ? 700 : 400, color: total ? '#2C2C2C' : '#6B5B5F', paddingTop: total ? 10 : 0, borderTop: total ? '1.5px solid #EDD5DC' : 'none', marginTop: total ? 6 : 0 }}>
      <span>{label}</span><span style={total ? { color: '#B07080' } : {}}>{value}</span>
    </div>
  )
}

const inputStyle = { width: '100%', padding: '12px 16px', border: '1.5px solid #EDD5DC', borderRadius: 12, fontFamily: "'Lato', sans-serif", fontSize: '0.9rem', outline: 'none', background: '#FDF6F0' }
