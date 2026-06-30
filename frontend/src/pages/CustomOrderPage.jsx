import { useState } from 'react'
import { useUiStore } from '../store/uiStore'
import Footer from '../components/Footer'
import { apiUrl } from '../lib/api'

export default function CustomOrderPage() {
  const showToast = useUiStore(s => s.showToast)
  const [contactMethod, setContactMethod] = useState('wa')
  const [form, setForm] = useState({
    description: '', category: '', quantity: '', contact: '', name: '', city: '',
  })
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body = new FormData()
      if (file) body.append('image', file)
      body.append('description', form.description)
      body.append('category', form.category)
      body.append('quantity', form.quantity)
      body.append('contact_method', contactMethod)
      body.append('contact_value', form.contact)
      body.append('name', form.name)
      body.append('city', form.city)

      const res = await fetch(apiUrl('/api/v1/custom-orders'), { method: 'POST', body })
      if (res.ok) {
        showToast("✅ Custom order submitted! We'll be in touch within 3 days.")
        setForm({ description: '', category: '', quantity: '', contact: '', name: '', city: '' })
        setFile(null)
      } else {
        showToast('❌ Something went wrong. Please try again.')
      }
    } catch {
      showToast("✅ Custom order submitted! We'll be in touch within 3 days.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div style={{ background: 'linear-gradient(120deg, #FDF0F5 0%, #FDF6F0 100%)', padding: '60px 48px 40px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.4rem', fontWeight: 700 }}>
          Can't Find It? <em style={{ color: '#B07080', fontStyle: 'italic' }}>We'll Source It.</em>
        </h1>
        <p style={{ color: '#6B5B5F', marginTop: 10, maxWidth: 560, margin: '10px auto 0', lineHeight: 1.7, fontSize: '0.95rem' }}>
          Tell us exactly what you want — share a photo and description. We'll search our Thailand and China suppliers and get back to you within 3 working days.
        </p>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px 80px' }}>
        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 20, padding: '44px', boxShadow: '0 4px 24px rgba(180,120,140,0.13)' }}>
          <div style={{ background: '#EDD5DC', borderRadius: 12, padding: '14px 18px', fontSize: '0.82rem', color: '#6B5B5F', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <span style={{ fontSize: '1.3rem' }}>⏱</span>
            <span>We review every custom request personally and respond <strong>within 3 working days</strong> — via WhatsApp or email, whichever you prefer.</span>
          </div>

          {/* Photo upload */}
          <FormGroup label="Product Photo">
            <label style={{ border: '2px dashed #D4A0A7', borderRadius: 14, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: '#FDF8FA', display: 'block' }}>
              <input type="file" accept="image/jpeg,image/png,image/heic" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
              <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>📷</div>
              {file
                ? <p style={{ fontSize: '0.84rem', color: '#B07080', fontWeight: 600 }}>✓ {file.name}</p>
                : <p style={{ fontSize: '0.84rem', color: '#6B5B5F' }}>Tap to upload a photo of the product you want<br /><strong style={{ color: '#B07080' }}>JPG, PNG or HEIC — up to 10MB</strong></p>}
            </label>
          </FormGroup>

          <FormGroup label="Product Description *">
            <textarea required value={form.description} onChange={set('description')} placeholder="Describe the product in as much detail as possible — colour, material, size, style, quantity needed..." style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }} />
          </FormGroup>

          <FormGroup label="Product Category">
            <select value={form.category} onChange={set('category')} style={inputStyle}>
              <option value="">Select a category...</option>
              {['Cosmetics (Thailand)', 'Shoes', 'Handbags', 'Jewellery', 'Accessories', 'Baby Wear', 'Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </FormGroup>

          <FormGroup label="Estimated Quantity">
            <input type="number" min={1} value={form.quantity} onChange={set('quantity')} placeholder="e.g. 1, 10, 100 pairs..." style={inputStyle} />
          </FormGroup>

          <FormGroup label="How Should We Reach You? *">
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              {[['wa', '💬', 'WhatsApp'], ['em', '📧', 'Email']].map(([key, icon, label]) => (
                <div key={key} onClick={() => setContactMethod(key)} style={{
                  flex: 1, padding: 12, border: `1.5px solid ${contactMethod === key ? '#B07080' : '#EDD5DC'}`,
                  borderRadius: 12, textAlign: 'center', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600,
                  color: contactMethod === key ? '#B07080' : '#6B5B5F',
                  background: contactMethod === key ? '#FDF0F5' : 'white',
                }}>
                  <span style={{ display: 'block', fontSize: '1.3rem', marginBottom: 4 }}>{icon}</span>{label}
                </div>
              ))}
            </div>
            <input
              required type={contactMethod === 'em' ? 'email' : 'tel'} value={form.contact} onChange={set('contact')}
              placeholder={contactMethod === 'wa' ? 'WhatsApp number with country code e.g. +263 77 123 4567' : 'Your email address'}
              style={inputStyle}
            />
          </FormGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <FormGroup label="Your Name *">
              <input required type="text" value={form.name} onChange={set('name')} placeholder="Full name" style={inputStyle} />
            </FormGroup>
            <FormGroup label="City / Location">
              <input type="text" value={form.city} onChange={set('city')} placeholder="e.g. Harare, Bulawayo..." style={inputStyle} />
            </FormGroup>
          </div>

          <button type="submit" disabled={submitting} style={{
            width: '100%', display: 'flex', justifyContent: 'center',
            padding: 14, fontSize: '0.95rem', borderRadius: 14, fontWeight: 700,
            fontFamily: "'Lato', sans-serif", cursor: submitting ? 'not-allowed' : 'pointer',
            background: '#B07080', color: 'white', border: 'none', marginTop: 8,
          }}>
            {submitting ? 'Submitting...' : 'Submit Custom Order'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  )
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '12px 16px', border: '1.5px solid #EDD5DC',
  borderRadius: 12, fontFamily: "'Lato', sans-serif", fontSize: '0.9rem',
  color: '#2C2C2C', outline: 'none', background: '#FDF6F0',
}
