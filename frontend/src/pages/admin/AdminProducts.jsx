import { useEffect, useState } from 'react'
import { apiUrl } from '../../lib/api'

const AVAIL_COLOURS = {
  in_stock:    { bg: '#D4EDDA', color: '#155724' },
  by_order:    { bg: '#FFF3CD', color: '#856404' },
  coming_soon: { bg: '#EDD5DC', color: '#B07080' },
}

const EMPTY_FORM = { name: '', description: '', category: 'cosmetics', origin: 'thailand', price_usd: '', price_air: '', price_sea: '', sizes: '', colours: '', availability: 'in_stock', shipping: 'both', min_order_qty_sea: '', images: [] }

const CATEGORIES_WITH_SIZES = ['shoes', 'baby_wear']

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('tc_token')}` }
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch(apiUrl('/api/v1/products'))
    if (res.ok) setProducts(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit = (p) => {
    setEditing(p.id)
    setForm({ ...p, sizes: p.sizes?.join(', ') || '', colours: p.colours?.join(', ') || '', min_order_qty_sea: p.min_order_qty_sea || '', price_air: p.price_air || '', price_sea: p.price_sea || '', images: p.images || [] })
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    const body = new FormData()
    const saveForm = { ...form }
    if (saveForm.availability === 'by_order' && saveForm.price_air) saveForm.price_usd = saveForm.price_air
    Object.entries(saveForm).forEach(([k, v]) => { if (v !== '' && k !== 'images') body.append(k, v) })
    body.set('sizes', JSON.stringify(form.sizes.split(',').map(s => s.trim()).filter(Boolean)))
    body.set('colours', JSON.stringify(form.colours.split(',').map(s => s.trim()).filter(Boolean)))
    if (form.images?.length && typeof form.images[0] !== 'string') {
      form.images.forEach(f => body.append('images', f))
    }

    const url = editing ? `/api/v1/products/${editing}` : '/api/v1/products'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: authHeader(), body })
    if (res.ok) { setMsg(editing ? 'Product updated!' : 'Product created!'); setShowForm(false); load() }
    else setMsg('Something went wrong.')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const del = async (id) => {
    if (!confirm('Delete this product?')) return
    await fetch(apiUrl(`/api/v1/products/${id}`), { method: 'DELETE', headers: authHeader() })
    load()
  }

  return (
    <div style={{ padding: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700 }}>Products</h1>
        <button onClick={openNew} style={{ padding: '9px 22px', borderRadius: 50, background: '#B07080', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}>+ Add Product</button>
      </div>

      {msg && <div style={{ background: '#D4EDDA', color: '#155724', padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: '0.84rem' }}>{msg}</div>}

      {/* FORM */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: 32, marginBottom: 28, boxShadow: '0 4px 24px rgba(180,120,140,0.13)' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, marginBottom: 24 }}>{editing ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={save}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FG label="Name *"><input required value={form.name} onChange={set('name')} placeholder="Product name" style={inputStyle} /></FG>
              {form.availability !== 'by_order'
                ? <FG label="Price (USD) *"><input required type="number" min="0" step="0.01" value={form.price_usd} onChange={set('price_usd')} placeholder="e.g. 28.00" style={inputStyle} /></FG>
                : <>
                    <FG label="Air Shipping Price (USD) *"><input required type="number" min="0" step="0.01" value={form.price_air} onChange={set('price_air')} placeholder="e.g. 35.00" style={inputStyle} /></FG>
                    <FG label="Sea Shipping Price (USD) *"><input required type="number" min="0" step="0.01" value={form.price_sea} onChange={set('price_sea')} placeholder="e.g. 20.00" style={inputStyle} /></FG>
                  </>
              }
              <FG label="Category">
                <select value={form.category} onChange={set('category')} style={inputStyle}>
                  {['cosmetics','shoes','handbags','jewellery','accessories','watches','baby_wear','glasses'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </FG>
              <FG label="Origin">
                <select value={form.origin} onChange={set('origin')} style={inputStyle}>
                  <option value="thailand">Thailand</option>
                  <option value="china">China</option>
                </select>
              </FG>
              <FG label="Availability">
                <select value={form.availability} onChange={set('availability')} style={inputStyle}>
                  <option value="in_stock">In Stock</option>
                  <option value="by_order">By Order</option>
                  <option value="enquire">Enquire (WhatsApp)</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </FG>
              <FG label="Shipping">
                <select value={form.shipping} onChange={set('shipping')} style={inputStyle}>
                  <option value="air">Air Only</option>
                  <option value="sea">Sea Only</option>
                  <option value="both">Air & Sea</option>
                </select>
              </FG>
              {CATEGORIES_WITH_SIZES.includes(form.category) && (
                <FG label="Sizes (comma separated)"><input value={form.sizes} onChange={set('sizes')} placeholder="e.g. 36, 37, 38, 39" style={inputStyle} /></FG>
              )}
              <FG label="Colours (comma separated)"><input value={form.colours} onChange={set('colours')} placeholder="e.g. Black, White, Pink" style={inputStyle} /></FG>
              <FG label="Min Qty for Sea Shipping"><input type="number" min="0" value={form.min_order_qty_sea} onChange={set('min_order_qty_sea')} placeholder="e.g. 100" style={inputStyle} /></FG>
            </div>
            <FG label="Product Images">
              <input type="file" accept="image/*" multiple onChange={e => setForm(f => ({ ...f, images: Array.from(e.target.files) }))} style={inputStyle} />
              {form.images?.length > 0 && typeof form.images[0] === 'string' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {form.images.map((url, i) => <img key={i} src={url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />)}
                </div>
              )}
            </FG>
            <FG label="Description *">
              <textarea required value={form.description} onChange={set('description')} placeholder="Product description..." style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
            </FG>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" disabled={saving} style={{ padding: '10px 28px', borderRadius: 50, background: '#B07080', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Product'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 24px', borderRadius: 50, background: '#EDD5DC', color: '#B07080', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
      {loading ? <p style={{ color: '#6B5B5F' }}>Loading...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {products.map(p => {
            const ac = AVAIL_COLOURS[p.availability] || AVAIL_COLOURS.in_stock
            return (
              <div key={p.id} style={{ background: 'white', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 12px rgba(180,120,140,0.08)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{p.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6B5B5F', marginTop: 2 }}>{p.category} · {p.origin} · ${p.price_usd}</div>
                </div>
                <div style={{ padding: '3px 10px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', ...ac }}>{p.availability.replace('_', ' ')}</div>
                <div style={{ fontSize: '0.78rem', color: '#6B5B5F', background: '#FDF6F0', padding: '4px 10px', borderRadius: 8 }}>{p.shipping}</div>
                <button onClick={() => openEdit(p)} style={{ padding: '6px 16px', borderRadius: 8, background: '#EDD5DC', color: '#B07080', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => del(p.id)} style={{ padding: '6px 16px', borderRadius: 8, background: '#F8D7DA', color: '#721C24', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>Delete</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FG({ label, children }) {
  return <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#2C2C2C', marginBottom: 6 }}>{label}</label>{children}</div>
}

const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #EDD5DC', borderRadius: 10, fontFamily: "'Lato', sans-serif", fontSize: '0.88rem', outline: 'none', background: '#FDF6F0' }
