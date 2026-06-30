import { useEffect, useState } from 'react'
import { apiUrl } from '../../lib/api'

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('tc_token')}` }
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    ecocash_number: '', ecocash_name: '', office_address: '', office_hours: '', whatsapp_number: '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch(apiUrl('/api/v1/settings'), { headers: authHeader() })
      .then(r => r.json())
      .then(data => setSettings(s => ({ ...s, ...data })))
      .catch(() => {})
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(apiUrl('/api/v1/settings'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(settings),
    })
    setMsg(res.ok ? '✅ Settings saved!' : '❌ Failed to save.')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const set = k => e => setSettings(s => ({ ...s, [k]: e.target.value }))

  return (
    <div style={{ padding: 36, maxWidth: 640 }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, marginBottom: 8 }}>Settings</h1>
      <p style={{ color: '#6B5B5F', fontSize: '0.88rem', marginBottom: 28 }}>Update your EcoCash details and office information. These show live on the website.</p>

      {msg && <div style={{ background: msg.includes('✅') ? '#D4EDDA' : '#F8D7DA', color: msg.includes('✅') ? '#155724' : '#721C24', padding: '10px 16px', borderRadius: 10, marginBottom: 20, fontSize: '0.84rem' }}>{msg}</div>}

      <form onSubmit={save} style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(180,120,140,0.13)' }}>
        <Section title="💳 EcoCash Payment Details">
          <FG label="EcoCash Number">
            <input value={settings.ecocash_number} onChange={set('ecocash_number')} placeholder="077 XXX XXXX" style={inputStyle} />
          </FG>
          <FG label="Registered Name">
            <input value={settings.ecocash_name} onChange={set('ecocash_name')} placeholder="Tee's Collection" style={inputStyle} />
          </FG>
        </Section>

        <Section title="📍 Office Details">
          <FG label="Office Address">
            <textarea value={settings.office_address} onChange={set('office_address')} placeholder="Full office address..." style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} />
          </FG>
          <FG label="Office Hours">
            <input value={settings.office_hours} onChange={set('office_hours')} placeholder="Monday – Saturday, 8am – 6pm" style={inputStyle} />
          </FG>
          <FG label="WhatsApp Number">
            <input value={settings.whatsapp_number} onChange={set('whatsapp_number')} placeholder="+263 7X XXX XXXX" style={inputStyle} />
          </FG>
        </Section>

        <button type="submit" disabled={saving} style={{ padding: '11px 32px', borderRadius: 50, background: '#B07080', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #EDD5DC' }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  )
}

function FG({ label, children }) {
  return <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#2C2C2C', marginBottom: 6 }}>{label}</label>{children}</div>
}

const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #EDD5DC', borderRadius: 10, fontFamily: "'Lato', sans-serif", fontSize: '0.88rem', outline: 'none', background: '#FDF6F0' }
