import { useState, useEffect } from 'react'
import catalogData from '../data/catalog.json'

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

// localStorage dan catalog o'qi, yo'q bo'lsa catalog.json
function loadCatalog() {
  try {
    const saved = localStorage.getItem('fratino_catalog')
    if (saved) return JSON.parse(saved)
  } catch {}
  return catalogData.products
}

function saveCatalog(products) {
  localStorage.setItem('fratino_catalog', JSON.stringify(products))
  // Bir xil tabda ham Catalog.jsx ni xabardor qilish
  window.dispatchEvent(new CustomEvent('fratino_catalog_updated'))
}

// ─── MAHSULOT MODAL ──────────────────────────────────────────────
function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState({
    name:      product?.name      || '',
    type:      product?.type      || '',
    desc:      product?.desc      || '',
    price:     product?.price     || '',
    category:  product?.category  || 'buket',
    imgClass:  product?.imgClass  || 'atirgul',
    badge:     product?.badge     || '',
    imageUrl:  product?.imageUrl  || '',
    stock:     product?.stock     ?? true,
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

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
    width: 420,
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

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem' }}>
          {product ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
        </h3>

        {/* Nomi */}
        <div style={fieldStyle}>
          <label style={labelStyle}>NOMI *</label>
          <input style={inputStyle} placeholder="Masalan: Atirgul buketi" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        {/* Turi */}
        <div style={fieldStyle}>
          <label style={labelStyle}>TURI (karta ustida rangli chiqadi)</label>
          <input style={inputStyle} placeholder="Masalan: Premium, Klassik, Bahorgi..." value={form.type} onChange={e => set('type', e.target.value)} />
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

        {/* Kategoriya */}
        <div style={fieldStyle}>
          <label style={labelStyle}>KATEGORIYA</label>
          <select style={selectStyle} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        {/* Karta rangi */}
        <div style={fieldStyle}>
          <label style={labelStyle}>KARTA RANGI</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
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
                style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 12, border: '1.5px solid var(--cream-dark)', display: 'block' }}
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
    <aside style={{ width: 210, flexShrink: 0, background: 'var(--white)', borderRight: '1px solid var(--cream-dark)', padding: '1.5rem 0' }}>
      <div style={{ padding: '0 1.25rem 1.25rem', borderBottom: '1px solid var(--cream-dark)', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '1rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: 'var(--text)' }}>✿ Gala Flowers</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', marginTop: 2 }}>ADMIN PANEL</div>
      </div>
      {links.map(l => (
        <div
          key={l.key}
          onClick={() => onNav(l.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 1.25rem', fontSize: '0.88rem', cursor: 'pointer',
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
    </aside>
  )
}

// ─── ORDERS PAGE ─────────────────────────────────────────────────
function OrdersPage({ orders }) {
  const [q, setQ] = useState('')
  const filtered = orders.filter(o =>
    !q || o.name.toLowerCase().includes(q.toLowerCase()) || String(o.id).includes(q)
  )

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', color: 'var(--pink)', fontWeight: 600, marginBottom: 4 }}>ADMIN PANEL</p>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)' }}>Buyurtmalar</h2>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Mijoz nomi yoki buyurtma ID..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid var(--cream-dark)', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: 'var(--white)' }}
        />
      </div>

      <div style={{ background: 'var(--white)', borderRadius: 18, border: '1px solid var(--cream-dark)', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Buyurtma topilmadi</div>
        ) : filtered.map((o, i) => (
          <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 1.25rem', borderBottom: i < filtered.length - 1 ? '1px solid var(--cream-dark)' : 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              {o.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{o.name}</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 1 }}>#{o.id} · {o.product} · {o.qty} dona</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>{fmt(o.price)}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>+998 {o.phone}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── STATS PAGE ──────────────────────────────────────────────────
function StatsPage({ orders, products }) {
  const total = orders.reduce((s, o) => s + o.price, 0)
  const dayLabels = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Sh', 'Ya']
  const now = new Date()
  const dayTotals = Array(7).fill(0)
  orders.forEach(o => { dayTotals[6 - o.dayOffset] += o.price })
  const maxVal = Math.max(...dayTotals, 1)

  const metrics = [
    { label: 'Jami daromad',    val: fmt(total),       sub: 'Oxirgi 7 kun'    },
    { label: 'Buyurtmalar',     val: orders.length,    sub: 'Jami'            },
    { label: 'Mahsulotlar',     val: products.length,  sub: 'Katalogda'       },
    { label: "O'rtacha chek",   val: fmt(total / (orders.length || 1)), sub: 'Buyurtma boshiga' },
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
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
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
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '13px 1.25rem',
              borderBottom: i < visible.length - 1 ? '1px solid var(--cream-dark)' : 'none',
            }}>
              {/* Rang ko'rsatgich */}
              <div style={{ width: 44, height: 44, borderRadius: 10, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1.5px solid ${colors.stroke}22` }}>
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} onError={e => e.target.style.display='none'} />
                  : <span style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.stroke }}>{p.imgClass?.slice(0,3).toUpperCase()}</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: colors.bg, color: colors.stroke, padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>{p.type || '—'}</span>
                  <span>{catLabel}</span>
                  {p.badge && <span style={{ background: 'var(--cream)', padding: '1px 7px', borderRadius: 10 }}>{p.badge}</span>}
                  <span style={{ color: p.stock ? '#6a9e5a' : '#e05c6a', fontWeight: 600 }}>{p.stock ? '✓ Mavjud' : '✗ Tugagan'}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', flexShrink: 0, minWidth: 100, textAlign: 'right' }}>
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

// ─── ADMIN PAGE ROOT ─────────────────────────────────────────────
export default function Admin() {
  const [page, setPage] = useState('orders')

  // catalog.json dan boshlang'ich holat, localStorage dan o'qib updated versiya
  const [products, setProducts] = useState(() => loadCatalog())
  const [nextId, setNextId] = useState(() => {
    const all = loadCatalog()
    return Math.max(...all.map(p => Number(p.id) || 0), 0) + 1
  })
  const [orders] = useState(() => genDemoOrders(loadCatalog()))
  const [modal, setModal] = useState(null)
  const [savedTip, setSavedTip] = useState(false)

  // Har safar products o'zgarganda localStorage ga yoz
  useEffect(() => {
    saveCatalog(products)
  }, [products])

  const handleSave = (data) => {
    if (modal && modal !== 'add') {
      // Tahrirlash
      setProducts(ps => ps.map(p => p.id === modal.id ? { ...p, ...data } : p))
    } else {
      // Yangi mahsulot — catalog.json formatiga mos id yaratish
      const newId = `admin_${nextId}`
      setProducts(ps => [...ps, { ...data, id: newId, emoji: '🌸' }])
      setNextId(n => n + 1)
    }
    setModal(null)
    setSavedTip(true)
    setTimeout(() => setSavedTip(false), 3000)
  }

  const handleDelete = (id) => {
    if (!window.confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) return
    setProducts(ps => ps.filter(p => p.id !== id))
    setSavedTip(true)
    setTimeout(() => setSavedTip(false), 2000)
  }

  const handleReset = () => {
    if (!window.confirm("Barcha o'zgarishlarni bekor qilib, catalog.json ga qaytarilsinmi?")) return
    localStorage.removeItem('fratino_catalog')
    setProducts(catalogData.products)
    setNextId(Math.max(...catalogData.products.map(p => Number(p.id) || 0), 0) + 1)
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 130px)', background: 'var(--cream)' }}>
      <Sidebar active={page} onNav={setPage} />

      <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
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

        {page === 'orders'   && <OrdersPage orders={orders} />}
        {page === 'stats'    && <StatsPage orders={orders} products={products} />}
        {page === 'harf'     && <HarfAdminPage />}
        {page === 'products' && (
          <>
            <ProductsPage
              products={products}
              onAdd={() => setModal('add')}
              onEdit={p => setModal(p)}
              onDelete={handleDelete}
            />
            {/* Reset tugmasi */}
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={handleReset}
                style={{ padding: '8px 16px', borderRadius: 12, border: '1.5px solid var(--cream-dark)', background: 'transparent', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}
              >↺ Asl katalogga qaytarish</button>
            </div>
          </>
        )}
      </main>

      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}