import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function fmt(n) {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(n)) + " so'm"
}

// catalog.json dagi barcha kategoriyalar
const CATEGORIES = [
  { id: 'buket',   label: 'Buketlar'    },
  { id: 'donalik', label: 'Donalik'     },
  { id: 'bayram',  label: 'Bayram uchun'},
  { id: 'kelin',   label: 'Kelin uchun' },
  { id: 'harf',    label: 'Ism yozish'  },
]

// imgClass → karta rangi (Catalog.jsx da ham shu)
const IMG_CLASSES = [
  { id: 'atirgul', label: 'Qizil (Atirgul)' },
  { id: 'lola',    label: 'Ko\'k (Lola)'    },
  { id: 'pion',    label: 'Binafsha (Pion)' },
  { id: 'tulpan',  label: 'Yashil (Tulpan)' },
  { id: 'nargiz',  label: 'Sariq (Nargiz)'  },
  { id: 'gilos',   label: 'To\'q sariq (Gilos)' },
  { id: 'aralash', label: 'Yashil (Aralash)' },
]

// ─── SUPABASE CRUD ───────────────────────────────────────────────
async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*').order('id')
  if (error) { console.error('Mahsulotlar yuklanmadi:', error); return [] }
  return data
}

async function upsertProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .upsert(product, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ─── MAHSULOT MODAL ──────────────────────────────────────────────
function ProductModal({ product, onSave, onClose, categories }) {
  const [form, setForm] = useState({
    name:      product?.name      || '',
    type:      product?.type      || '',
    desc:      product?.desc      || '',
    price:     product?.price     || '',
    category:  product?.category  || (categories[0]?.id || 'buket'),
    imgClass:  product?.imgClass  || 'atirgul',
    badge:     product?.badge     || '',
    imageUrl:  product?.imageUrl  || '',
    stock:     product?.stock     ?? true,
  })

  // Yangi kategoriya qo'shish
  const [newCatMode, setNewCatMode] = useState(false)
  const [newCatLabel, setNewCatLabel] = useState('')
  // Yangi filter qo'shish
  const [newFilterMode, setNewFilterMode] = useState(false)
  const [newFilterVal, setNewFilterVal] = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const activeCat = categories.find(c => c.id === form.category)
  const filters = (activeCat?.filters || []).filter(f => f !== 'Barchasi')

  const handleAddCategory = async () => {
    const label = newCatLabel.trim()
    if (!label) return
    const id = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const { error } = await supabase.from('categories').insert({ id, label, filters: ['Barchasi'] })
    if (error) { alert('Xato: ' + error.message); return }
    setNewCatMode(false)
    setNewCatLabel('')
    set('category', id)
    window.dispatchEvent(new CustomEvent('categories_updated'))
  }

  const handleAddFilter = async () => {
    const val = newFilterVal.trim()
    if (!val || !activeCat) return
    const updated = [...(activeCat.filters || ['Barchasi']), val]
    const { error } = await supabase.from('categories').update({ filters: updated }).eq('id', activeCat.id)
    if (error) { alert('Xato: ' + error.message); return }
    setNewFilterMode(false)
    setNewFilterVal('')
    set('type', val)
    window.dispatchEvent(new CustomEvent('categories_updated'))
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.price) {
      alert('Nom va narxni kiriting')
      return
    }
    onSave({ ...form, price: parseInt(form.price) })
  }

  const overlayStyle = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  }
  const modalStyle = {
    background: 'var(--white)',
    borderRadius: 20,
    padding: '1.75rem',
    width: 460,
    maxWidth: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
  }
  const fieldStyle = { marginBottom: '1rem' }
  const labelStyle = {
    fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
    letterSpacing: '0.05em', display: 'block', marginBottom: 5,
  }
  const inputStyle = {
    width: '100%', padding: '10px 13px', borderRadius: 11,
    border: '1.5px solid var(--cream-dark)', fontSize: '0.88rem',
    color: 'var(--text)', background: 'var(--white)',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }
  const selectStyle = { ...inputStyle, cursor: 'pointer' }
  const chipBase = {
    padding: '7px 13px', borderRadius: 20, cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 600, border: '1.5px solid var(--cream-dark)',
    background: 'var(--white)', color: 'var(--text-muted)',
    transition: 'all .15s', fontFamily: 'inherit',
  }
  const chipActive = {
    ...chipBase,
    background: 'var(--pink)', color: '#fff', border: '1.5px solid var(--pink)',
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem' }}>
          {product ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
        </h3>

        {/* Nomi */}
        <div style={fieldStyle}>
          <label style={labelStyle}>NOMI *</label>
          <input style={inputStyle} placeholder="Masalan: Atirgul buketi" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        {/* Kategoriya — chip tugmalar */}
        <div style={fieldStyle}>
          <label style={labelStyle}>KATEGORIYA</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
            {categories.map(c => (
              <button key={c.id} type="button"
                style={form.category === c.id ? chipActive : chipBase}
                onClick={() => { set('category', c.id); set('type', '') }}
              >{c.label}</button>
            ))}
            {newCatMode ? (
              <div style={{ display: 'flex', gap: 6, width: '100%', marginTop: 4 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Kategoriya nomi (masalan: Sovg'a)"
                  value={newCatLabel}
                  onChange={e => setNewCatLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                  autoFocus
                />
                <button type="button" onClick={handleAddCategory}
                  style={{ padding: '8px 14px', borderRadius: 11, background: 'var(--pink)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                  Qo'sh
                </button>
                <button type="button" onClick={() => setNewCatMode(false)}
                  style={{ padding: '8px 12px', borderRadius: 11, background: 'transparent', border: '1.5px solid var(--cream-dark)', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'inherit' }}>
                  ✕
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setNewCatMode(true)}
                style={{ ...chipBase, border: '1.5px dashed var(--cream-dark)', color: 'var(--pink)' }}>
                + Yangi
              </button>
            )}
          </div>
        </div>

        {/* Turi / Filter — chip tugmalar */}
        <div style={fieldStyle}>
          <label style={labelStyle}>TURI (katalog filtri)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
            {filters.map(f => (
              <button key={f} type="button"
                style={form.type === f ? chipActive : chipBase}
                onClick={() => set('type', f)}
              >{f}</button>
            ))}
            {newFilterMode ? (
              <div style={{ display: 'flex', gap: 6, width: '100%', marginTop: 4 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Yangi filter (masalan: Bahorgi)"
                  value={newFilterVal}
                  onChange={e => setNewFilterVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddFilter()}
                  autoFocus
                />
                <button type="button" onClick={handleAddFilter}
                  style={{ padding: '8px 14px', borderRadius: 11, background: 'var(--pink)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                  Qo'sh
                </button>
                <button type="button" onClick={() => setNewFilterMode(false)}
                  style={{ padding: '8px 12px', borderRadius: 11, background: 'transparent', border: '1.5px solid var(--cream-dark)', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'inherit' }}>
                  ✕
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setNewFilterMode(true)}
                style={{ ...chipBase, border: '1.5px dashed var(--cream-dark)', color: 'var(--pink)' }}>
                + Yangi
              </button>
            )}
          </div>
        </div>

        {/* Tavsif */}
        <div style={fieldStyle}>
          <label style={labelStyle}>TAVSIF</label>
          <textarea
            style={{ ...inputStyle, height: 72, resize: 'vertical' }}
            placeholder="Qisqa tavsif — katalogda ko'rinadi"
            value={form.desc}
            onChange={e => set('desc', e.target.value)}
          />
        </div>

        {/* Narx */}
        <div style={fieldStyle}>
          <label style={labelStyle}>NARXI (SO'M) *</label>
          <input style={inputStyle} type="number" placeholder="120000" value={form.price} onChange={e => set('price', e.target.value)} />
        </div>

        {/* Karta rangi */}
        <div style={fieldStyle}>
          <label style={labelStyle}>KARTA RANGI</label>
          <div className="admin-imgclass-grid">
            {IMG_CLASSES.map(c => {
              const COLORS = {
                lola: '#EFF6FF', atirgul: '#FFF1F2', pion: '#FAF5FF',
                tulpan: '#ECFDF5', nargiz: '#FEFCE8', gilos: '#FFF7ED', aralash: '#F0FDF4',
              }
              const STROKES = {
                lola: '#3B82F6', atirgul: '#F43F5E', pion: '#A855F7',
                tulpan: '#10B981', nargiz: '#EAB308', gilos: '#F97316', aralash: '#22C55E',
              }
              const isActive = form.imgClass === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => set('imgClass', c.id)}
                  style={{
                    padding: '7px 6px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    fontSize: '0.7rem', fontWeight: 600,
                    background: COLORS[c.id],
                    color: STROKES[c.id],
                    border: isActive ? `2px solid ${STROKES[c.id]}` : `1.5px solid ${COLORS[c.id]}`,
                    transition: 'all .15s',
                  }}
                >
                  {c.label.split('(')[0].trim()}
                </div>
              )
            })}
          </div>
        </div>

        {/* Badge */}
        <div style={fieldStyle}>
          <label style={labelStyle}>BADGE (ixtiyoriy)</label>
          <input style={inputStyle} placeholder="Masalan: Yangi, Top, -20%" value={form.badge} onChange={e => set('badge', e.target.value)} />
        </div>

        {/* Rasm — galereya tugmasi */}
        <div style={fieldStyle}>
          <label style={labelStyle}>RASM (ixtiyoriy)</label>
          {/* Yashirin file input */}
          <input
            id="img-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = ev => set('imageUrl', ev.target.result)
              reader.readAsDataURL(file)
              // inputni tozalash (qayta xuddi faylni tanlash uchun)
              e.target.value = ''
            }}
          />
          {form.imageUrl ? (
            <div style={{ position: 'relative' }}>
              <img
                src={form.imageUrl}
                alt="preview"
                style={{ width: '100%', height: 130, objectFit: 'contain', borderRadius: 12, border: '1.5px solid var(--cream-dark)', display: 'block', background: 'var(--cream)' }}
                onError={e => e.target.style.display = 'none'}
              />
              <button
                type="button"
                onClick={() => set('imageUrl', '')}
                style={{
                  position: 'absolute', top: 7, right: 7,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
              <button
                type="button"
                onClick={() => document.getElementById('img-file-input').click()}
                style={{
                  marginTop: 6, width: '100%', padding: '8px',
                  borderRadius: 10, border: '1.5px dashed var(--cream-dark)',
                  background: 'transparent', fontSize: '0.78rem',
                  color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >🔄 Rasmni almashtirish</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => document.getElementById('img-file-input').click()}
              style={{
                width: '100%', padding: '28px 16px',
                borderRadius: 12, border: '2px dashed var(--cream-dark)',
                background: 'var(--cream)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6,
                fontSize: '0.82rem', color: 'var(--text-muted)',
                fontFamily: 'inherit', transition: 'border-color .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--pink)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cream-dark)'}
            >
              <span style={{ fontSize: '1.8rem' }}>📷</span>
              <span style={{ fontWeight: 600 }}>Galereadan rasm tanlash</span>
              <span style={{ fontSize: '0.72rem' }}>JPG, PNG, WEBP — istalgan o'lcham</span>
            </button>
          )}
        </div>

        {/* Mavjudligi */}
        <div style={fieldStyle}>
          <label style={labelStyle}>MAVJUDLIGI</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ val: true, label: '✓ Mavjud' }, { val: false, label: '✗ Tugagan' }].map(opt => (
              <div
                key={String(opt.val)}
                onClick={() => set('stock', opt.val)}
                style={{
                  flex: 1, padding: '9px', borderRadius: 11, cursor: 'pointer', textAlign: 'center',
                  fontSize: '0.82rem', fontWeight: 600,
                  border: form.stock === opt.val ? '2px solid var(--pink)' : '1.5px solid var(--cream-dark)',
                  background: form.stock === opt.val ? 'var(--pink-pale)' : 'var(--white)',
                  color: form.stock === opt.val ? 'var(--pink)' : 'var(--text-muted)',
                  transition: 'all .15s',
                }}
              >{opt.label}</div>
            ))}
          </div>
        </div>

        {/* Tugmalar */}
        <div style={{ display: 'flex', gap: 8, marginTop: '1.25rem' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '11px', background: 'transparent', border: '1.5px solid var(--cream-dark)', borderRadius: 12, fontSize: '0.88rem', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'inherit' }}
          >Bekor</button>
          <button
            onClick={handleSave}
            style={{ flex: 2, padding: '11px', background: 'var(--pink)', border: 'none', borderRadius: 12, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', color: '#fff', fontFamily: 'inherit' }}
          >Saqlash</button>
        </div>
      </div>
    </div>
  )
}

// ─── SIDEBAR ─────────────────────────────────────────────────────
function Sidebar({ active, onNav }) {
  const links = [
    { key: 'orders',   icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18l-2 9H5L3 6z"/><path d="M8 6V5a4 4 0 0 1 8 0v1"/>
          <circle cx="9" cy="19" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="19" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
      ), label: 'Buyurtmalar' },
    { key: 'stats',    icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
        </svg>
      ), label: 'Statistika'  },
    { key: 'products', icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22v-9"/><path d="M9 13c0 0-4-1-4-5 0-2 1.5-3.5 4-3 0 0 1-3 3-3s3 3 3 3c2.5-.5 4 1 4 3 0 4-4 5-4 5"/>
        </svg>
      ), label: 'Mahsulotlar' },
    { key: 'harf', icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 19h20L12 2z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/>
        </svg>
      ), label: 'Ism yozish' },
  ]
  return (
    <aside className="admin-sidebar">
      <div style={{ padding: '0 1.25rem 1.25rem', borderBottom: '1px solid var(--cream-dark)', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '1rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: 'var(--text)' }}>✿ Gala Flowers</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginTop: 2 }}>ADMIN PANEL</div>
      </div>
      <div className="admin-sidebar-nav">
        {links.map(l => (
          <div
            key={l.key}
            className={`admin-sidebar-link${active === l.key ? ' active' : ''}`}
            onClick={() => onNav(l.key)}
            style={{
              fontSize: '0.88rem', cursor: 'pointer',
              color: active === l.key ? 'var(--pink)' : 'var(--text-muted)',
              fontWeight: active === l.key ? 600 : 400,
              background: active === l.key ? 'var(--pink-pale)' : 'transparent',
              borderLeft: `3px solid ${active === l.key ? 'var(--pink)' : 'transparent'}`,
              transition: 'all .15s',
            }}
          >
            <span style={{ display:'flex', alignItems:'center' }}>{l.icon}</span> {l.label}
          </div>
        ))}
      </div>
    </aside>
  )
}

// ─── ORDERS PAGE ─────────────────────────────────────────────────
function OrdersPage({ orders }) {
  const [q, setQ] = useState('')
  const filtered = orders.filter(o =>
    !q ||
    (o.customer_name || '').toLowerCase().includes(q.toLowerCase()) ||
    String(o.order_number).includes(q) ||
    String(o.id).includes(q)
  )

  function statusColor(s) {
    if (s === 'new')       return { bg: '#EFF6FF', color: '#3B82F6' }
    if (s === 'confirmed') return { bg: '#ECFDF5', color: '#10B981' }
    if (s === 'done')      return { bg: '#F0FDF4', color: '#6a9e5a' }
    if (s === 'cancelled') return { bg: '#FFF1F2', color: '#e05c6a' }
    return { bg: 'var(--cream)', color: 'var(--text-muted)' }
  }
  function statusLabel(s) {
    if (s === 'new')       return 'Yangi'
    if (s === 'confirmed') return 'Tasdiqlangan'
    if (s === 'done')      return 'Bajarildi'
    if (s === 'cancelled') return 'Bekor'
    return s || 'Yangi'
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', color: 'var(--pink)', fontWeight: 600, marginBottom: 4 }}>ADMIN PANEL</p>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)' }}>Buyurtmalar</h2>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Mijoz nomi yoki buyurtma raqami..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid var(--cream-dark)', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: 'var(--white)' }}
        />
      </div>

      <div style={{ background: 'var(--white)', borderRadius: 18, border: '1px solid var(--cream-dark)', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            {orders.length === 0 ? 'Hali buyurtma yo\'q' : 'Buyurtma topilmadi'}
          </div>
        ) : filtered.map((o, i) => {
          const items = Array.isArray(o.items) ? o.items : []
          const firstItem = items[0]
          const sc = statusColor(o.status)
          const date = o.created_at ? new Date(o.created_at) : null
          const dateStr = date ? date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''
          return (
            <div key={o.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--cream-dark)' : 'none' }}>
              <div className="order-row">
                {/* Emoji */}
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                  {firstItem?.emoji || '🌸'}
                </div>
                {/* Info */}
                <div className="order-row-info">
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{o.customer_name}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 1, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>#{o.order_number || o.id}</span>
                    <span>·</span>
                    <span>{items.map(it => `${it.name} ×${it.qty}`).join(', ')}</span>
                    {dateStr && <><span>·</span><span>{dateStr}</span></>}
                  </div>
                </div>
                {/* Status + narx */}
                <div className="order-row-right" style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{fmt(o.total_price)}</div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 8, fontWeight: 600, background: sc.bg, color: sc.color }}>{statusLabel(o.status)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+998 {o.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── STATS PAGE ──────────────────────────────────────────────────
function StatsPage({ orders, products }) {
  const total = orders.reduce((s, o) => s + (o.total_price || 0), 0)
  const totalQty = orders.reduce((s, o) => s + (o.total_qty || 0), 0)
  const dayLabels = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Sh', 'Ya']
  const now = new Date()
  const dayTotals = Array(7).fill(0)

  orders.forEach(o => {
    if (!o.created_at) return
    const d = new Date(o.created_at)
    const diffMs = now - d
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays >= 0 && diffDays < 7) {
      dayTotals[6 - diffDays] += (o.total_price || 0)
    }
  })

  const maxVal = Math.max(...dayTotals, 1)

  const metrics = [
    { label: 'Jami daromad',      val: fmt(total),      sub: 'Barcha vaqt'         },
    { label: 'Buyurtmalar',       val: orders.length,   sub: 'Jami'                },
    { label: 'Sotilgan gullar',   val: totalQty + ' ta', sub: 'Jami dona/buket'    },
    { label: "O'rtacha chek",     val: fmt(total / (orders.length || 1)), sub: 'Buyurtma boshiga' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', color: 'var(--pink)', fontWeight: 600, marginBottom: 4 }}>ADMIN PANEL</p>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)' }}>Statistika</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: 'var(--cream)', borderRadius: 14, padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 5 }}>{m.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>{m.val}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--white)', borderRadius: 18, border: '1px solid var(--cream-dark)', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem' }}>Oxirgi 7 kun daromadi</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130 }}>
          {dayTotals.map((val, i) => {
            const d = new Date(now); d.setDate(d.getDate() - (6 - i))
            const label = dayLabels[d.getDay()]
            const h = Math.round((val / maxVal) * 100)
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>{val ? Math.round(val / 1000) + 'K' : '—'}</div>
                <div style={{ width: '100%', height: h || 4, background: 'var(--pink)', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── HARF ADMIN PAGE ─────────────────────────────────────────────
const DEFAULT_HARF_PKGS = [
  { id: 'h1', label: 'Kichik',  red: 25, white: 15, price: 225000, image: '' },
  { id: 'h2', label: "O'rta",   red: 35, white: 25, price: 380000, image: '' },
  { id: 'h3', label: 'Katta',   red: 50, white: 30, price: 520000, image: '' },
]

const DEFAULT_ISM_MULTS = [
  { id: 's', label: 'Kichik ism', minLen: 3, maxLen: 5,    mult: 1.0  },
  { id: 'm', label: "O'rta ism",  minLen: 6, maxLen: 8,    mult: 1.45 },
  { id: 'l', label: 'Katta ism',  minLen: 9, maxLen: null, mult: 2.05 },
]

function describeTier(m) {
  return m.maxLen == null || m.maxLen === ''
    ? `${m.label} (${m.minLen}+ harf)`
    : `${m.label} (${m.minLen}–${m.maxLen} harf)`
}

function loadHarfPkgs() {
  try {
    const s = localStorage.getItem('fratino_harf_pkgs')
    if (s) return JSON.parse(s)
  } catch {}
  return DEFAULT_HARF_PKGS
}

function saveHarfPkgs(pkgs) {
  localStorage.setItem('fratino_harf_pkgs', JSON.stringify(pkgs))
  window.dispatchEvent(new CustomEvent('fratino_harf_updated'))
}

function loadIsmMults() {
  try {
    const s = localStorage.getItem('fratino_ism_mults')
    if (s) return JSON.parse(s)
  } catch {}
  return DEFAULT_ISM_MULTS
}

function saveIsmMults(mults) {
  localStorage.setItem('fratino_ism_mults', JSON.stringify(mults))
  window.dispatchEvent(new CustomEvent('fratino_ism_updated'))
}

function HarfAdminPage() {
  const [pkgs, setPkgs] = useState(() => loadHarfPkgs())
  const [mults, setMults] = useState(() => loadIsmMults())
  const [saved, setSaved] = useState(false)

  const setField = (id, field, val) => {
    setPkgs(ps => ps.map(p =>
      p.id === id
        ? { ...p, [field]: (field === 'label' || field === 'image') ? String(val) : (val === '' ? '' : Number(val)) }
        : p
    ))
  }

  const setMultField = (id, field, val) => {
    setMults(ms => ms.map(m => {
      if (m.id !== id) return m
      if (field === 'label') return { ...m, label: String(val) }
      if (field === 'maxLen') return { ...m, maxLen: val === '' ? null : Number(val) }
      if (field === 'minLen') return { ...m, minLen: val === '' ? '' : Number(val) }
      return { ...m, mult: val === '' ? '' : Number(val) }
    }))
  }

  const handleSave = () => {
    saveHarfPkgs(pkgs)
    saveIsmMults(mults)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReset = () => {
    if (!window.confirm("Standart narxlarga qaytarilsinmi?")) return
    setPkgs(DEFAULT_HARF_PKGS)
    saveHarfPkgs(DEFAULT_HARF_PKGS)
    setMults(DEFAULT_ISM_MULTS)
    saveIsmMults(DEFAULT_ISM_MULTS)
  }

  const inp = {
    padding: '9px 12px', borderRadius: 10, border: '1.5px solid var(--cream-dark)',
    fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none',
    background: 'var(--white)', color: 'var(--text)', width: '100%', boxSizing: 'border-box',
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', color: 'var(--pink)', fontWeight: 600, marginBottom: 4 }}>ADMIN PANEL</p>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)' }}>Ism yozish narxlari</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleReset} style={{ padding: '9px 16px', borderRadius: 11, border: '1.5px solid var(--cream-dark)', background: 'transparent', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>↺ Reset</button>
          <button onClick={handleSave} style={{ padding: '9px 20px', borderRadius: 11, border: 'none', background: 'var(--pink)', color: '#fff', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {saved ? '✓ Saqlandi' : 'Saqlash'}
          </button>
        </div>
      </div>

      {/* Harf paketlari */}
      <div style={{ background: 'var(--white)', borderRadius: 18, border: '1px solid var(--cream-dark)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '1.1rem' }}>ISM / HARF YOZISH — ASOSIY PAKETLAR</p>
        <div className="harf-pkg-grid">
          {pkgs.map((pkg, i) => (
            <div key={pkg.id} style={{ background: 'var(--cream)', borderRadius: 14, padding: '1.1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--pink)', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
                {i === 0 ? 'STANDART' : i === 1 ? '⭐ MASHHUR' : '👑 PREMIUM'}
              </div>

              {/* Paket rasmi */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>PAKET RASMI</label>
                <input
                  id={`harf-img-input-${pkg.id}`}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = ev => setField(pkg.id, 'image', ev.target.result)
                    reader.readAsDataURL(file)
                    e.target.value = ''
                  }}
                />
                {pkg.image ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={pkg.image}
                      alt={pkg.label}
                      style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 10, border: '1.5px solid var(--cream-dark)', display: 'block' }}
                      onError={e => e.target.style.display = 'none'}
                    />
                    <button
                      type="button"
                      onClick={() => setField(pkg.id, 'image', '')}
                      style={{
                        position: 'absolute', top: 5, right: 5,
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.55)', color: '#fff',
                        border: 'none', cursor: 'pointer', fontSize: '0.75rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >✕</button>
                    <button
                      type="button"
                      onClick={() => document.getElementById(`harf-img-input-${pkg.id}`).click()}
                      style={{
                        marginTop: 6, width: '100%', padding: '6px',
                        borderRadius: 8, border: '1.5px dashed var(--cream-dark)',
                        background: 'transparent', fontSize: '0.72rem',
                        color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >🔄 Almashtirish</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => document.getElementById(`harf-img-input-${pkg.id}`).click()}
                    style={{
                      width: '100%', padding: '18px 10px',
                      borderRadius: 10, border: '2px dashed var(--cream-dark)',
                      background: 'var(--white)', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 4,
                      fontSize: '0.72rem', color: 'var(--text-muted)',
                      fontFamily: 'inherit', transition: 'border-color .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--pink)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cream-dark)'}
                  >
                    <span style={{ fontSize: '1.4rem' }}>📷</span>
                    <span style={{ fontWeight: 600 }}>Rasm tanlash</span>
                  </button>
                )}
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>NOM</label>
                <input style={inp} value={pkg.label} onChange={e => setField(pkg.id, 'label', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>🌹 QIZIL</label>
                  <input style={inp} type="number" value={pkg.red} onChange={e => setField(pkg.id, 'red', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>🤍 OQ</label>
                  <input style={inp} type="number" value={pkg.white} onChange={e => setField(pkg.id, 'white', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>NARXI (SO'M)</label>
                <input style={inp} type="number" value={pkg.price} onChange={e => setField(pkg.id, 'price', e.target.value)} />
              </div>
              <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--white)', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', textAlign: 'center' }}>
                {fmt(pkg.price)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ism uzunligi koeffitsientlari — tahrirlanadigan */}
      <div style={{ background: 'var(--white)', borderRadius: 18, border: '1px solid var(--cream-dark)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '1.1rem' }}>ISM YOZISH — UZUNLIK KOEFFITSIENTLARI</p>
        <div className="harf-mult-grid">
          {mults.map((m, i) => (
            <div key={m.id} style={{ background: 'var(--cream)', borderRadius: 14, padding: '1.1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--pink)', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
                {i === 0 ? 'KICHIK ISM' : i === 1 ? "O'RTA ISM" : 'KATTA ISM'}
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>NOM</label>
                <input style={inp} value={m.label} onChange={e => setMultField(m.id, 'label', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>MIN HARF</label>
                  <input style={inp} type="number" value={m.minLen} onChange={e => setMultField(m.id, 'minLen', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>MAX HARF</label>
                  <input style={inp} type="number" placeholder="cheksiz" value={m.maxLen ?? ''} onChange={e => setMultField(m.id, 'maxLen', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>KOEFFITSIENT (masalan 1.45)</label>
                <input style={inp} type="number" step="0.01" value={m.mult} onChange={e => setMultField(m.id, 'mult', e.target.value)} />
              </div>
              <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--white)', borderRadius: 10, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', textAlign: 'center' }}>
                ×{m.mult || 0} — {describeTier(m)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ism koeffitsientlari preview */}
      <div style={{ background: 'var(--white)', borderRadius: 18, border: '1px solid var(--cream-dark)', padding: '1.5rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '1.1rem' }}>ISM YOZISH — AVTOMATIK HISOBLASH (PREVIEW)</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--cream-dark)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem' }}>ISM UZUNLIGI</th>
                {pkgs.map(p => (
                  <th key={p.id} style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem' }}>{p.label.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mults.map((m, mi) => {
                const mv = Number(m.mult) || 0
                return (
                  <tr key={m.id} style={{ borderBottom: mi < mults.length - 1 ? '1px solid var(--cream-dark)' : 'none', background: mi % 2 === 0 ? 'transparent' : 'var(--cream)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{describeTier(m)}</td>
                    {pkgs.map(p => (
                      <td key={p.id} style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>{fmt(Math.round(p.price * mv / 1000) * 1000)}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          🌹{Math.round(p.red * mv)} + 🤍{Math.round(p.white * mv)}
                        </div>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1rem', fontStyle: 'italic' }}>
          * Ism uzunligiga qarab narx avtomatik hisoblanadi. Yuqoridagi koeffitsientlarni o'zgartirib, "Saqlash"ni bosing.
        </p>
      </div>
    </div>
  )
}

// ─── PRODUCTS PAGE ───────────────────────────────────────────────
const CAT_COLORS = {
  lola:    { bg: '#EFF6FF', stroke: '#3B82F6' },
  atirgul: { bg: '#FFF1F2', stroke: '#F43F5E' },
  pion:    { bg: '#FAF5FF', stroke: '#A855F7' },
  tulpan:  { bg: '#ECFDF5', stroke: '#10B981' },
  nargiz:  { bg: '#FEFCE8', stroke: '#EAB308' },
  gilos:   { bg: '#FFF7ED', stroke: '#F97316' },
  aralash: { bg: '#F0FDF4', stroke: '#22C55E' },
}

function ProductsPage({ products, onAdd, onEdit, onDelete }) {
  const [filterCat, setFilterCat] = useState('all')

  const visible = filterCat === 'all'
    ? products
    : products.filter(p => p.category === filterCat)

  return (
    <div>
      <div className="admin-page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', color: 'var(--pink)', fontWeight: 600, marginBottom: 4 }}>ADMIN PANEL</p>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)' }}>Mahsulotlar</h2>
        </div>
        <button
          onClick={onAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'var(--pink)', color: '#fff', border: 'none', borderRadius: 13, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >+ Yangi mahsulot</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterCat('all')}
          style={{ padding: '5px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: filterCat === 'all' ? 'var(--pink)' : 'var(--cream-dark)', color: filterCat === 'all' ? '#fff' : 'var(--text-muted)', fontFamily: 'inherit' }}
        >Barchasi ({products.length})</button>
        {CATEGORIES.map(c => {
          const count = products.filter(p => p.category === c.id).length
          if (!count) return null
          return (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              style={{ padding: '5px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: filterCat === c.id ? 'var(--pink)' : 'var(--cream-dark)', color: filterCat === c.id ? '#fff' : 'var(--text-muted)', fontFamily: 'inherit' }}
            >{c.label} ({count})</button>
          )
        })}
      </div>

      <div style={{ background: 'var(--white)', borderRadius: 18, border: '1px solid var(--cream-dark)', overflow: 'hidden' }}>
        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌿</div>
            Mahsulot yo'q. Yangi qo'shing!
          </div>
        ) : visible.map((p, i) => {
          const colors = CAT_COLORS[p.imgClass] || { bg: '#FFF1F2', stroke: '#F43F5E' }
          const catLabel = CATEGORIES.find(c => c.id === p.category)?.label || p.category
          return (
            <div key={p.id} className="product-row" style={{
              borderBottom: i < visible.length - 1 ? '1px solid var(--cream-dark)' : 'none',
            }}>
              {/* Rang ko'rsatgich */}
              <div style={{ width: 44, height: 44, borderRadius: 10, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1.5px solid ${colors.stroke}22` }}>
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} onError={e => e.target.style.display='none'} />
                  : <span style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.stroke }}>{p.imgClass?.slice(0,3).toUpperCase()}</span>
                }
              </div>
              <div className="product-row-info">
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: colors.bg, color: colors.stroke, padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>{p.type || '—'}</span>
                  <span>{catLabel}</span>
                  {p.badge && <span style={{ background: 'var(--cream)', padding: '1px 7px', borderRadius: 10 }}>{p.badge}</span>}
                  <span style={{ color: p.stock ? '#6a9e5a' : '#e05c6a', fontWeight: 600 }}>{p.stock ? '✓ Mavjud' : '✗ Tugagan'}</span>
                </div>
              </div>
              <div className="product-row-right">
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', flexShrink: 0, minWidth: 90, textAlign: 'right' }}>
                  {fmt(p.price)}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => onEdit(p)}
                    style={{ padding: '7px 11px', borderRadius: 10, border: '1.5px solid var(--cream-dark)', background: 'var(--white)', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'inherit' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    style={{ padding: '7px 11px', borderRadius: 10, border: '1.5px solid var(--cream-dark)', background: 'var(--white)', cursor: 'pointer', fontSize: '0.82rem', color: '#e05c6a', fontFamily: 'inherit' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── DEMO ORDERS ─────────────────────────────────────────────────
const DEMO_NAMES = ['Jasur Toshmatov','Malika Yusupova','Bobur Karimov','Nilufar Rahimova','Sardor Nazarov','Zulfiya Mirzo','Akbar Hasanov']

function genDemoOrders(prods) {
  return Array.from({ length: 10 }, (_, i) => {
    const p = prods[i % prods.length]
    const qty = Math.ceil(Math.random() * 3)
    const daysAgo = Math.floor(Math.random() * 7)
    return {
      id: 100001 + i,
      name: DEMO_NAMES[i % DEMO_NAMES.length],
      phone: '90' + Math.floor(1000000 + Math.random() * 8999999),
      product: p.name,
      emoji: p.emoji || '🌸',
      price: p.price * qty,
      qty,
      dayOffset: daysAgo,
    }
  }).sort((a, b) => a.dayOffset - b.dayOffset)
}

// ─── RESPONSIVE STYLES (1200px → 320px) ───────────────────────────
const ADMIN_RESPONSIVE_CSS = `
  .admin-root { display: flex; min-height: calc(100vh - 130px); background: var(--cream); }
  .admin-sidebar { width: 210px; flex-shrink: 0; background: var(--white); border-right: 1px solid var(--cream-dark); padding: 1.5rem 0; }
  .admin-sidebar-link { display: flex; align-items: center; gap: 10px; padding: 11px 1.25rem; }
  .admin-main { flex: 1; padding: 2rem; overflow: auto; min-width: 0; }
  .admin-page-header { margin-bottom: 1.5rem; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .admin-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .admin-modal-box { background: var(--white); border-radius: 20px; padding: 1.75rem; width: 460px; max-width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 40px rgba(0,0,0,0.18); }
  .admin-imgclass-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .harf-pkg-grid, .harf-mult-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .order-row, .product-row { display: flex; align-items: center; gap: 12px; padding: 13px 1.25rem; flex-wrap: wrap; }
  .order-row-info, .product-row-info { flex: 1; min-width: 0; }
  .order-row-right, .product-row-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

  @media (max-width: 1200px) {
    .admin-main { padding: 1.5rem; }
  }

  @media (max-width: 900px) {
    .admin-root { flex-direction: column; min-height: auto; }
    .admin-sidebar { width: 100%; padding: 0.5rem 0; border-right: none; border-bottom: 1px solid var(--cream-dark); display: flex; flex-direction: column; }
    .admin-sidebar > div:first-child { display: none; }
    .admin-sidebar-nav { display: flex; overflow-x: auto; gap: 4px; padding: 0 0.5rem; }
    .admin-sidebar-link { flex-direction: column; gap: 4px !important; padding: 8px 14px !important; font-size: 0.7rem !important; white-space: nowrap; border-left: none !important; border-bottom: 3px solid transparent; flex-shrink: 0; }
    .admin-sidebar-link.active { border-bottom: 3px solid var(--pink) !important; }
    .admin-main { padding: 1.25rem; }
    .harf-pkg-grid, .harf-mult-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 640px) {
    .admin-main { padding: 1rem; }
    .admin-modal-box { padding: 1.25rem; border-radius: 16px; }
    .admin-imgclass-grid { grid-template-columns: repeat(3, 1fr); }
    .harf-pkg-grid, .harf-mult-grid { grid-template-columns: 1fr; }
    .order-row, .product-row { padding: 12px 0.85rem; }
    .order-row-right, .product-row-right { margin-left: 52px; width: calc(100% - 52px); justify-content: space-between; }
  }

  @media (max-width: 480px) {
    .admin-main { padding: 0.75rem; }
    .admin-page-header h2 { font-size: 1.3rem !important; }
    .admin-imgclass-grid { grid-template-columns: repeat(2, 1fr); }
    .product-row-right, .order-row-right { margin-left: 0; width: 100%; }
  }

  @media (max-width: 360px) {
    .admin-sidebar-link { padding: 7px 10px !important; font-size: 0.65rem !important; }
    .admin-modal-box { padding: 1rem; }
  }
`

function ResponsiveStyles() {
  return <style>{ADMIN_RESPONSIVE_CSS}</style>
}

// ─── ADMIN PAGE ROOT ─────────────────────────────────────────────
export default function Admin() {
  const [page, setPage] = useState('orders')

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [modal, setModal] = useState(null)
  const [savedTip, setSavedTip] = useState(false)

  // Supabase dan ma'lumotlarni yuklash
  useEffect(() => {
    async function loadAll() {
      const [prods, cats, ordersRes] = await Promise.all([
        fetchProducts(),
        supabase.from('categories').select('*').then(r => r.data || []),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ])
      setProducts(prods)
      setCategories(cats)
      setOrders(ordersRes.data || [])
      setLoading(false)
    }
    loadAll()

    // Kategoriya yangilanganda qayta yuklash
    const onCatUpdate = () => {
      supabase.from('categories').select('*').then(r => setCategories(r.data || []))
    }
    window.addEventListener('categories_updated', onCatUpdate)
    return () => window.removeEventListener('categories_updated', onCatUpdate)
  }, [])

  const handleSave = async (data) => {
    try {
      if (modal && modal !== 'add') {
        // Tahrirlash
        const updated = await upsertProduct({ ...modal, ...data })
        setProducts(ps => ps.map(p => p.id === updated.id ? updated : p))
      } else {
        // Yangi mahsulot — id yo'q, Supabase o'zi beradi
        const { id: _skip, ...rest } = data
        const created = await upsertProduct({ ...rest, emoji: '🌸' })
        setProducts(ps => [created, ...ps])
      }
      setModal(null)
      setSavedTip(true)
      setTimeout(() => setSavedTip(false), 3000)
    } catch (err) {
      alert('Xato: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) return
    try {
      await deleteProduct(id)
      setProducts(ps => ps.filter(p => p.id !== id))
      setSavedTip(true)
      setTimeout(() => setSavedTip(false), 2000)
    } catch (err) {
      alert('O\'chirishda xato: ' + err.message)
    }
  }

  return (
    <div className="admin-root">
      <ResponsiveStyles />
      <Sidebar active={page} onNav={setPage} />

      <main className="admin-main">
        {/* Saqlandi bildirishnomasi */}
        {savedTip && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 999,
            background: '#6a9e5a', color: '#fff',
            padding: '12px 20px', borderRadius: 14,
            fontSize: '0.88rem', fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
            animation: 'slideUp 0.2s ease',
          }}>
            ✓ Katalog yangilandi — foydalanuvchilar ko'ra oladi
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Yuklanmoqda...
          </div>
        ) : (
          <>
            {page === 'orders'   && <OrdersPage orders={orders} />}
            {page === 'stats'    && <StatsPage orders={orders} products={products} />}
            {page === 'harf'     && <HarfAdminPage />}
            {page === 'products' && (
              <ProductsPage
                products={products}
                onAdd={() => setModal('add')}
                onEdit={p => setModal(p)}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </main>

      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          categories={categories}
        />
      )}
    </div>
  )
}