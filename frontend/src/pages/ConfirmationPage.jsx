import { useLocation, Link } from 'react-router-dom'

export default function ConfirmationPage() {
  const { state } = useLocation()
  const ref = state?.ref || 'TC-2025-00001'
  const isCash = state?.payment === 'cash'

  const STEPS = [
    { title: 'Order Received ✓', desc: isCash ? 'We have your order and will have it ready for you to collect.' : 'We have your order and are reviewing your payment receipt.', done: true },
    { title: 'Payment Verified', desc: isCash ? 'We confirm your cash payment when you collect from our Harare office.' : 'We confirm your EcoCash payment — usually within 2 business hours.', done: false },
    { title: 'Sourcing & Air Shipping', desc: 'Items dispatched from Thailand/China via air freight.', done: false },
    { title: 'Ready to Collect in Harare', desc: "We'll email and WhatsApp you when your order arrives at our office.", done: false },
  ]

  return (
    <div style={{ background: 'linear-gradient(120deg, #F0FFF4, #FDF6F0)', minHeight: '80vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, marginBottom: 10 }}>
          Order <em style={{ color: '#B07080', fontStyle: 'italic' }}>Confirmed!</em>
        </h1>
        <p style={{ color: '#6B5B5F', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: 24 }}>
          Thank you for shopping with Tee's Collection. We have received your order and will be in touch shortly.
        </p>

        <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 4px 24px rgba(180,120,140,0.13)', marginBottom: 24 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B5B5F', marginBottom: 6 }}>Your Order Reference Number</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#B07080', letterSpacing: '0.06em' }}>{ref}</div>
          <p style={{ fontSize: '0.78rem', color: '#6B5B5F', marginTop: 8 }}>Save this — use it to track your order or contact us about it.</p>
        </div>

        <div style={{ background: 'white', borderRadius: 14, padding: 24, boxShadow: '0 4px 24px rgba(180,120,140,0.13)', textAlign: 'left', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>📦 What Happens Next</h3>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < STEPS.length - 1 ? 16 : 0, alignItems: 'flex-start' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: s.done ? '#B07080' : '#EDD5DC', border: s.done ? 'none' : '2px solid #F2B8C6', flexShrink: 0, marginTop: 2 }} />
              <div>
                <h4 style={{ fontSize: '0.84rem', fontWeight: 700 }}>{s.title}</h4>
                <p style={{ fontSize: '0.76rem', color: '#6B5B5F', marginTop: 2 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 28px', borderRadius: 50, background: '#B07080', color: 'white', fontWeight: 700, fontSize: '0.9rem', fontFamily: "'Lato', sans-serif", textDecoration: 'none' }}>Back to Home</Link>
          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', padding: '11px 28px', borderRadius: 50, background: 'transparent', border: '1.5px solid #B07080', color: '#B07080', fontWeight: 700, fontSize: '0.9rem', fontFamily: "'Lato', sans-serif", textDecoration: 'none' }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
