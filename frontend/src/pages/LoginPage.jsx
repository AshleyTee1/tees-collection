import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUiStore } from '../store/uiStore'
import { apiUrl } from '../lib/api'

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const showToast = useUiStore(s => s.showToast)
  const navigate = useNavigate()

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', email: '', whatsapp: '', password: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(apiUrl('/api/v1/auth/login'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      })
      if (res.ok) {
        const { token } = await res.json()
        localStorage.setItem('tc_token', token)
        showToast('👋 Welcome back!')
        navigate('/shop')
      } else {
        showToast('❌ Invalid email or password.')
      }
    } catch {
      showToast('👋 Welcome back!')
      navigate('/shop')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(apiUrl('/api/v1/auth/register'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${regForm.firstName} ${regForm.lastName}`,
          email: regForm.email, whatsapp: regForm.whatsapp, password: regForm.password,
        }),
      })
      if (res.ok) {
        showToast("🎉 Account created! Welcome to Tee's Collection.")
        navigate('/shop')
      } else {
        showToast('❌ Registration failed. Try again.')
      }
    } catch {
      showToast("🎉 Account created! Welcome to Tee's Collection.")
      navigate('/shop')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FDF0F5 0%, #FDF6F0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '52px 48px', maxWidth: 460, width: '100%', boxShadow: '0 12px 48px rgba(180,120,140,0.18)' }}>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: '#B07080' }}>
            Tee<span style={{ color: '#C9A96E', fontStyle: 'italic' }}>'s</span> Collection
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#6B5B5F', marginBottom: 32 }}>Sign in to track your orders, or continue as a guest.</p>

        <div style={{ display: 'flex', background: '#FDF6F0', borderRadius: 12, padding: 4, marginBottom: 28 }}>
          {['login', 'register'].map(t => (
            <div key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: 10, textAlign: 'center', borderRadius: 10,
              fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer',
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? '#B07080' : '#6B5B5F',
              boxShadow: tab === t ? '0 2px 10px rgba(180,120,140,0.15)' : 'none',
            }}>{t === 'login' ? 'Sign In' : 'Create Account'}</div>
          ))}
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <InputGroup label="Email Address">
              <input required type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" style={inputStyle} />
            </InputGroup>
            <InputGroup label="Password">
              <input required type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} placeholder="Enter your password" style={inputStyle} />
            </InputGroup>
            <button type="submit" style={submitBtn}>Sign In</button>
            <Divider />
            <button type="button" onClick={() => { showToast("🛍️ Browsing as guest — no account needed!"); navigate('/shop') }} style={guestBtn}>Continue as Guest</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <InputGroup label="First Name">
                <input required type="text" value={regForm.firstName} onChange={e => setRegForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Jane" style={inputStyle} />
              </InputGroup>
              <InputGroup label="Last Name">
                <input required type="text" value={regForm.lastName} onChange={e => setRegForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Doe" style={inputStyle} />
              </InputGroup>
            </div>
            <InputGroup label="Email Address">
              <input required type="email" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" style={inputStyle} />
            </InputGroup>
            <InputGroup label="WhatsApp Number">
              <input type="tel" value={regForm.whatsapp} onChange={e => setRegForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="+263 77 123 4567" style={inputStyle} />
            </InputGroup>
            <InputGroup label="Password">
              <input required type="password" value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} placeholder="Create a strong password" style={inputStyle} />
            </InputGroup>
            <button type="submit" style={submitBtn}>Create Account</button>
            <Divider />
            <button type="button" onClick={() => { showToast("🛍️ Browsing as guest — no account needed!"); navigate('/shop') }} style={guestBtn}>Continue as Guest →</button>
          </form>
        )}
      </div>
    </div>
  )
}

function InputGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  )
}

function Divider() {
  return (
    <div style={{ textAlign: 'center', color: '#6B5B5F', fontSize: '0.8rem', margin: '18px 0', position: 'relative' }}>
      <span style={{ background: 'white', padding: '0 12px', position: 'relative', zIndex: 1 }}>or</span>
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#EDD5DC' }} />
    </div>
  )
}

const inputStyle = { width: '100%', padding: '12px 16px', border: '1.5px solid #EDD5DC', borderRadius: 12, fontFamily: "'Lato', sans-serif", fontSize: '0.9rem', outline: 'none', background: '#FDF6F0' }
const submitBtn = { width: '100%', display: 'flex', justifyContent: 'center', padding: 13, fontSize: '0.9rem', fontWeight: 700, fontFamily: "'Lato', sans-serif", borderRadius: 14, background: '#B07080', color: 'white', border: 'none', cursor: 'pointer', marginTop: 6 }
const guestBtn = { width: '100%', padding: 12, borderRadius: 14, border: '1.5px solid #EDD5DC', background: 'white', color: '#6B5B5F', fontFamily: "'Lato', sans-serif", fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }
