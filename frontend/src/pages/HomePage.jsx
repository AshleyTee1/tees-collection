import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import { useWindowWidth } from '../hooks/useWindowWidth'
import { imgUrl } from '../lib/cloudinary'

const CATEGORIES = [
  { image: 'https://res.cloudinary.com/dyllerlqa/image/upload/v1782456959/tees-collection/homepage/homepage-cosmetics.jpg', name: 'Cosmetics', desc: 'Skincare, makeup & beauty from Thailand', badge: '🇹🇭 Thai Sourced' },
  { image: 'https://res.cloudinary.com/dyllerlqa/image/upload/v1782456960/tees-collection/homepage/homepage-shoes.jpg', name: 'Shoes', desc: 'Sneakers, heels, sandals & more', badge: 'Air & Sea Available' },
  { image: 'https://res.cloudinary.com/dyllerlqa/image/upload/v1782457648/tees-collection/homepage/homepage-handbags.jpg', name: 'Handbags', desc: 'Totes, clutches & designer-inspired bags', badge: 'Ready & Order' },
  { image: 'https://res.cloudinary.com/dyllerlqa/image/upload/v1782457814/tees-collection/homepage/homepage-jewellery.jpg', name: 'Jewellery', desc: 'Rings, necklaces, earrings & sets', badge: 'Air Shipping' },
  { image: 'https://res.cloudinary.com/dyllerlqa/image/upload/v1782457129/tees-collection/homepage/homepage-accessories.jpg', name: 'Accessories', desc: 'Scarves, sunglasses, belts & more', badge: 'Available Now' },
  { image: 'https://res.cloudinary.com/dyllerlqa/image/upload/v1782457519/tees-collection/homepage/homepage-wigs.jpg', name: 'Wigs & Hair', desc: 'Wigs, extensions & hair accessories', badge: 'Coming Soon' },
]

const HOW_STEPS = [
  { n: '1', title: 'Browse & Choose', desc: 'Pick from ready-available stock or place an order for items sourced fresh from our suppliers.' },
  { n: '2', title: 'Select Shipping', desc: 'Choose air shipping (2–3 weeks) for single orders, or sea shipping for bulk quantities at a lower rate.' },
  { n: '3', title: 'We Source & Ship', desc: 'We handle everything — sourcing from Thailand or China, quality checks, and international shipping.' },
  { n: '4', title: 'Collect in Zimbabwe', desc: "Pick up your order from our office in Harare. We'll notify you the moment your goods arrive." },
]

const MARQUEE_ITEMS = ['Thai Cosmetics', 'Designer Handbags', 'Baby Essentials', 'Shoes & Sneakers', 'Jewellery', 'Accessories', 'Air & Sea Shipping', 'Custom Orders']

export default function HomePage() {
  const isMobile = useWindowWidth() < 768
  return (
    <>
      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #FDF0F5 0%, #FDF6F0 50%, #F9EEF3 100%)',
        minHeight: isMobile ? '70vh' : '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: isMobile ? '40px 16px' : '60px 24px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', maxWidth: 720 }}>
          <div style={{
            display: 'inline-block', background: '#EDD5DC', color: '#B07080',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '6px 18px', borderRadius: 50, marginBottom: 22,
          }}>✦ Sourced from Thailand & China · Delivered to Zimbabwe</div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1.18, marginBottom: 20 }}>
            Your Style,<br /><em style={{ color: '#B07080', fontStyle: 'italic' }}>Delivered from Asia</em>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#6B5B5F', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px' }}>
            Premium cosmetics, accessories, shoes, handbags, and baby essentials — curated in Bangkok and Guangzhou, shipped straight to our Harare collection office.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" style={btnPrimary}>Shop Now</Link>
            <Link to="/custom-order" style={btnOutline}>Custom Order</Link>
          </div>

          <div style={{ marginTop: 52, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['2–3 wks', 'Air Shipping'], ['60–90 days', 'Sea Shipping'], ['100%', 'Authentic'], ['ZW', 'Office Pickup']].map(([val, label]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#6B5B5F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <strong style={{ fontSize: '1.4rem', color: '#B07080', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{val}</strong>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ background: '#B07080', color: 'white', padding: '11px 0', overflow: 'hidden' }}>
        <div className="animate-marquee" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{ padding: '0 40px', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {item} <span style={{ opacity: 0.6 }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section style={{ padding: isMobile ? '40px 16px' : '80px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={sectionLabel}>Browse by Category</div>
          <h2 style={sectionH2}>Everything You Love,<br /><em style={{ color: '#B07080', fontStyle: 'italic' }}>All in One Place</em></h2>
          <p style={{ color: '#6B5B5F', marginTop: 10, fontSize: '0.95rem' }}>Explore our curated categories — sourced directly from top suppliers in Thailand and China.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? 14 : 22, maxWidth: 1100, margin: '0 auto' }}>
          {CATEGORIES.map(cat => (
            <Link key={cat.name} to={`/shop?category=${encodeURIComponent(cat.name)}`} style={{
              background: 'white', borderRadius: 14, padding: isMobile ? '16px 12px' : '36px 20px',
              textAlign: 'center', boxShadow: '0 4px 24px rgba(180,120,140,0.13)',
              textDecoration: 'none', color: 'inherit', display: 'block',
              border: '1.5px solid transparent', transition: 'transform 0.22s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#F2B8C6' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'transparent' }}
            >
              <div style={{ width: '100%', height: isMobile ? 110 : 140, borderRadius: 10, marginBottom: 10, overflow: 'hidden', background: '#EDD5DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cat.image
                  ? <img src={imgUrl(cat.image, 400)} alt={cat.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: '2.8rem' }}>{cat.emoji}</span>}
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>{cat.name}</h3>
              <p style={{ fontSize: '0.78rem', color: '#6B5B5F' }}>{cat.desc}</p>
              <div style={{ display: 'inline-block', marginTop: 12, background: '#EDD5DC', color: '#B07080', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', padding: '3px 10px', borderRadius: 50 }}>{cat.badge}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: isMobile ? '40px 16px' : '80px 48px', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={sectionLabel}>How It Works</div>
          <h2 style={sectionH2}>From Asia to Your <em style={{ color: '#B07080', fontStyle: 'italic' }}>Hands in Zimbabwe</em></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 28, maxWidth: 1000, margin: '0 auto' }}>
          {HOW_STEPS.map(s => (
            <div key={s.n} style={{ textAlign: 'center', padding: '28px 20px', borderRadius: 14, background: '#FDF6F0' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#B07080', color: 'white', fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{s.n}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: '0.83rem', color: '#6B5B5F', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SHIPPING */}
      <section style={{ padding: isMobile ? '40px 16px' : '80px 48px' }}>
        <div style={{
          background: 'linear-gradient(120deg, #F9E4EC 0%, #FDF6F0 100%)',
          borderRadius: 14, padding: '52px 48px',
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 32, alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: 14 }}>Flexible Shipping to <em style={{ fontStyle: 'italic', color: '#B07080' }}>Fit Your Needs</em></h2>
            <p style={{ color: '#6B5B5F', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: 16 }}>Whether you're buying for yourself or stocking up as a small business, we have a shipping option that works for you.</p>
            <Link to="/shop" style={btnPrimary}>Start Shopping</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '✈️', title: 'Air Shipping', desc: 'Fast delivery for single or small orders — ideal for personal shoppers.', time: '⏱ 2 – 3 Weeks to Zimbabwe', gold: false },
              { icon: '🚢', title: 'Sea Shipping', desc: 'Bulk orders only — minimum order quantities apply. Great for small businesses.', time: '⏱ 60 – 90 Days to Zimbabwe', gold: true },
            ].map(s => (
              <div key={s.title} style={{ background: 'white', borderRadius: 14, padding: '20px 24px', boxShadow: '0 4px 24px rgba(180,120,140,0.13)', borderLeft: `4px solid ${s.gold ? '#C9A96E' : '#B07080'}`, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
                <div>
                  <h4 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: '1rem' }}>{s.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#6B5B5F', marginTop: 3 }}>{s.desc}</p>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: s.gold ? '#C9A96E' : '#B07080', marginTop: 4 }}>{s.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '13px 32px', borderRadius: 50, fontFamily: "'Lato', sans-serif",
  fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', border: 'none',
  background: '#B07080', color: 'white', textDecoration: 'none',
}
const btnOutline = {
  ...btnPrimary,
  background: 'transparent', border: '1.5px solid #B07080', color: '#B07080',
}
const sectionLabel = { display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 10 }
const sectionH2 = { fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', fontWeight: 700, lineHeight: 1.25 }
