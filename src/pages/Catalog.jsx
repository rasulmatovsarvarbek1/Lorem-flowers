import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import './Catalog.css'

const DEFAULT_HARF_PKGS = [
  { id: 'h1', label: 'Kichik', red: 25, white: 15, price: 225000, image: '' },
  { id: 'h2', label: "O'rta",  red: 35, white: 25, price: 380000, image: '' },
  { id: 'h3', label: 'Katta',  red: 50, white: 30, price: 520000, image: '' },
]

function loadHarfPkgs() {
  try {
    const s = localStorage.getItem('fratino_harf_pkgs')
    if (s) return JSON.parse(s)
  } catch {}
  return DEFAULT_HARF_PKGS
}

// ─── ISM UZUNLIGI KOEFFITSIENTLARI (admin paneldan tahrirlanadi) ─
const DEFAULT_ISM_MULTS = [
  { id: 's', label: 'Kichik ism', minLen: 3, maxLen: 5,    mult: 1.0  },
  { id: 'm', label: "O'rta ism",  minLen: 6, maxLen: 8,    mult: 1.45 },
  { id: 'l', label: 'Katta ism',  minLen: 9, maxLen: null, mult: 2.05 },
]

function loadIsmMults() {
  try {
    const s = localStorage.getItem('fratino_ism_mults')
    if (s) return JSON.parse(s)
  } catch {}
  return DEFAULT_ISM_MULTS
}

// ─── FORMAT PRICE ───────────────────────────────────────────────
function formatPrice(price) {
  return new Intl.NumberFormat('uz-UZ').format(price) + " so'm"
}

// ─── ISM UZUNLIGI KOEFFITSIENTI ─────────────────────────────────
function describeTier(m) {
  return m.maxLen == null
    ? `${m.label} (${m.minLen}+ harf)`
    : `${m.label} (${m.minLen}–${m.maxLen} harf)`
}

function getNameMult(len, mults) {
  const list = mults && mults.length ? mults : DEFAULT_ISM_MULTS
  for (const m of list) {
    if (len >= m.minLen && (m.maxLen == null || len <= m.maxLen)) {
      return { label: describeTier(m), mult: m.mult }
    }
  }
  const last = list[list.length - 1]
  return { label: describeTier(last), mult: last.mult }
}

// ─── CATEGORY SVG ICONS ─────────────────────────────────────────
const CAT_ICONS = {
  buket: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V13"/>
      <path d="M12 13C10 11 8 9 8 6.5a4 4 0 0 1 8 0C16 9 14 11 12 13z"/>
      <path d="M12 13C9 12 6 10 5.5 7"/>
      <path d="M12 13C15 12 18 10 18.5 7"/>
      <path d="M8 22h8"/>
    </svg>
  ),
  bayram: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.8 11.3 2 22l10.7-3.79"/>
      <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/>
      <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/>
      <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/>
      <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2z"/>
    </svg>
  ),
  donalik: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="3"/>
      <path d="M12 4C12 4 9.5 1.5 7 3S5.5 7.5 7.5 9"/>
      <path d="M12 4C12 4 14.5 1.5 17 3S18.5 7.5 16.5 9"/>
      <path d="M12 10v5"/>
      <path d="M8 22h8"/>
      <path d="M10 15v7"/>
      <path d="M14 15v7"/>
    </svg>
  ),
  kelin: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C9 2 7 4 7 6s2 3 5 3 5-1 5-3-2-4-5-4z"/>
      <path d="M6 8c-2 1-3 3-3 5h18c0-2-1-4-3-5"/>
      <path d="M9 13v2c0 2 1.5 4 3 4s3-2 3-4v-2"/>
      <path d="M8 22h8"/>
    </svg>
  ),
  harf: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>
    </svg>
  ),
}

function CatIcon({ catId }) {
  return CAT_ICONS[catId] || null
}

// ─── FLOWER IMAGE with fallback ─────────────────────────────────
function FlowerImg({ src, alt, emoji, className }) {
  const [err, setErr] = useState(false)
  if (src && !err) {
    return <img src={src} alt={alt} className={className} onError={() => setErr(true)} />
  }
  return <span style={{ fontSize: '4rem', lineHeight: 1 }}>{emoji}</span>
}

// ─── PRODUCT MODAL ───────────────────────────────────────────────
function ProductModal({ product, isDona, onClose, onAdd }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  // Harf/Ism opsiyasi (donalik uchun)
  const [harfMode, setHarfMode] = useState(null)  // null | 'harf' | 'ism'
  const [ismText, setIsmText]   = useState('')
  const [harfPkgs]              = useState(() => loadHarfPkgs())
  const [ismMults]              = useState(() => loadIsmMults())
  const [selectedHarfPkg, setSelectedHarfPkg] = useState(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const trimmed = ismText.trim()
  const nameLen = trimmed.replace(/\s/g, '').length
  const multInfo = (harfMode === 'ism' && nameLen >= 3) ? getNameMult(nameLen, ismMults) : null

  const harfPackages = harfPkgs.map(p => {
    if (multInfo) {
      const m = multInfo.mult
      return { ...p, red: Math.round(p.red * m), white: Math.round(p.white * m), price: Math.round(p.price * m / 1000) * 1000 }
    }
    return p
  })

  const selHarfPkg = harfPackages.find(p => p.id === selectedHarfPkg)

  const handleAdd = () => {
    onAdd(product, qty)
    // Agar harf/ism paketi ham tanlangan bo'lsa, uni ham qo'shamiz
    if (selHarfPkg && harfMode) {
      const harfName = harfMode === 'ism' && trimmed
        ? `Ism: "${trimmed}" — ${selHarfPkg.label} paket`
        : `Harf yozish — ${selHarfPkg.label} paket`
      onAdd({ id: `harf_${selectedHarfPkg}_${Date.now()}`, name: harfName, price: selHarfPkg.price, emoji: '🌹', category: 'harf' }, 1)
    }
    setAdded(true)
    setTimeout(() => { setAdded(false); onClose() }, 1200)
  }

  const totalPrice = product.price * qty + (selHarfPkg ? selHarfPkg.price : 0)

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div className="modal-top">
          <div>
            <p className="modal-type-label">{product.type}</p>
            <p className="modal-name">{product.name}</p>
          </div>
          <button className="modal-x-btn" onClick={onClose} aria-label="Yopish">✕</button>
        </div>

        <div className="modal-img-wrap">
          <FlowerImg
            src={product.imageUrl}
            alt={product.name}
            emoji={product.emoji}
            className="modal-real-img"
          />
        </div>

        <p className="modal-desc-text">{product.desc}</p>
        <p className="modal-sub-label">{product.sub}</p>

        <div className="modal-price-info">
          <div className="modal-price-info-block">
            <p>1 {isDona ? 'dona' : 'buket'} narxi</p>
            <p>{formatPrice(product.price)}</p>
          </div>
          <div className="modal-price-info-block" style={{ textAlign: 'right' }}>
            <p>Turi</p>
            <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>{product.type}</p>
          </div>
        </div>

        {isDona && (
          <div className="qty-control">
            <button className="qty-control-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Kamaytirish">−</button>
            <span className="qty-control-num">{qty}</span>
            <button className="qty-control-btn" onClick={() => setQty(q => q + 1)} aria-label="Ko'paytirish">+</button>
          </div>
        )}

        {/* ── Harf & Ism yozish bo'limi (donalik uchun) ── */}
        {isDona && (
          <div className="modal-harf-section">
            <p className="modal-harf-section-title">
              ✦ Harf yoki ism yozdirish
              <span className="modal-harf-optional"> (ixtiyoriy)</span>
            </p>
            <div className="modal-harf-mode-row">
              <button
                className={`modal-harf-mode-btn${harfMode === 'harf' ? ' active' : ''}`}
                onClick={() => { setHarfMode(harfMode === 'harf' ? null : 'harf'); setIsmText(''); setSelectedHarfPkg(null) }}
              >✦ Harf</button>
              <button
                className={`modal-harf-mode-btn${harfMode === 'ism' ? ' active' : ''}`}
                onClick={() => { setHarfMode(harfMode === 'ism' ? null : 'ism'); setIsmText(''); setSelectedHarfPkg(null) }}
              >✿ Ism</button>
              {harfMode && (
                <button
                  className="modal-harf-mode-btn cancel"
                  onClick={() => { setHarfMode(null); setIsmText(''); setSelectedHarfPkg(null) }}
                >✕ Bekor</button>
              )}
            </div>

            {harfMode === 'ism' && (
              <div className="modal-harf-ism-wrap">
                <input
                  className="modal-harf-ism-input"
                  placeholder="Ismni kiriting (masalan: Malika)"
                  value={ismText}
                  onChange={e => { setIsmText(e.target.value); setSelectedHarfPkg(null) }}
                  maxLength={30}
                  autoFocus
                />
                {nameLen > 0 && nameLen < 3 && <p className="harf-modal-hint warn">⚠ Kamida 3 harf kiriting</p>}
                {multInfo && <p className="harf-modal-hint ok">📏 {multInfo.label}</p>}
              </div>
            )}

            {harfMode && (harfMode === 'harf' || multInfo) && (
              <div className="modal-harf-pkgs">
                <p className="modal-harf-pkgs-label">PAKET TANLANG</p>
                {harfPackages.map((pkg, i) => (
                  <div
                    key={pkg.id}
                    className={`modal-harf-pkg-row${selectedHarfPkg === pkg.id ? ' selected' : ''}`}
                    onClick={() => setSelectedHarfPkg(selectedHarfPkg === pkg.id ? null : pkg.id)}
                  >
                    <span className="modal-harf-pkg-badge">{i === 0 ? 'Standart' : i === 1 ? '⭐' : '👑'}</span>
                    <span className="modal-harf-pkg-name">{pkg.label}</span>
                    <span className="modal-harf-pkg-flowers">🌹{pkg.red} + 🤍{pkg.white}</span>
                    <span className="modal-harf-pkg-price">{formatPrice(pkg.price)}</span>
                    {selectedHarfPkg === pkg.id && <span className="modal-harf-pkg-check">✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="modal-total-row">
          <span>Jami narx ({isDona ? `${qty} dona` : '1 buket'}{selHarfPkg ? ' + harf' : ''})</span>
          <span className="modal-total-price">{formatPrice(totalPrice)}</span>
        </div>

        <button className={`modal-cart-btn${added ? ' success' : ''}`} onClick={handleAdd}>
          {added ? "✓ Savatga qo'shildi!" : "🛒 Savatga qo'shish"}
        </button>
      </div>
    </div>
  )
}

// ─── PRODUCT CARD ───────────────────────────────────────────────
function ProductCard({ product, isDona, onSelect, liked, onToggleLike, onAddToCart }) {
  const [qty, setQty] = useState(1)

  const handleLike = (e) => {
    e.stopPropagation()
    onToggleLike(product.id)
  }

  return (
    <div className="cat-product-card" onClick={() => onSelect(product)}>
      <div className={`cat-product-img ${product.imgClass}`}>
        <FlowerImg
          src={product.imageUrl}
          alt={product.name}
          emoji={product.emoji}
          className="cat-product-real-img"
        />
        {product.badge && <span className="cat-product-badge">{product.badge}</span>}
        <button
          className={`card-like-btn${liked ? ' liked' : ''}`}
          onClick={handleLike}
          aria-label="Yoqtirish"
        >
          <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="cat-product-body">
        <p className="cat-product-type">{product.type}</p>
        <h3 className="cat-product-name">{product.name}</h3>
        <p className="cat-product-desc">{product.desc}</p>

        {isDona && (
          <div className="card-qty-control" onClick={e => e.stopPropagation()}>
            <button className="card-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Kamaytirish">−</button>
            <span className="card-qty-num">{qty}</span>
            <button className="card-qty-btn" onClick={() => setQty(q => q + 1)} aria-label="Ko'paytirish">+</button>
          </div>
        )}

        <div className="cat-product-footer">
          <div className="cat-product-price">
            {formatPrice(product.price)}
            <br />
            <small>/ {isDona ? '1 dona' : 'buket'}</small>
          </div>
          <button
            className={`cat-add-btn${isDona ? ' dona' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product, isDona ? qty : 1)
            }}
          >
            {isDona ? `${qty} dona` : 'Savatga'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── HARF CATEGORY CARD (katalogda ko'rinadigan karta) ───────────
// ─── HARF INLINE SECTION ────────────────────────────────────────
function HarfInlineSection({ harfPkgs, ismMults, onAdd }) {
  const [mode, setMode]       = useState(null)   // null | 'harf' | 'ism'
  const [ismText, setIsmText] = useState('')
  const [selected, setSelected] = useState(null)
  const [added, setAdded]     = useState(false)

  const trimmed = ismText.trim()
  const nameLen = trimmed.replace(/\s/g, '').length
  const multInfo = (mode === 'ism' && nameLen >= 3) ? getNameMult(nameLen, ismMults) : null

  const packages = harfPkgs.map(p => {
    if (multInfo) {
      const m = multInfo.mult
      return {
        ...p,
        red:   Math.round(p.red   * m),
        white: Math.round(p.white * m),
        price: Math.round(p.price * m / 1000) * 1000,
      }
    }
    return p
  })

  const selectedPkg = packages.find(p => p.id === selected)

  const handleAdd = () => {
    if (!selectedPkg) return
    const name = mode === 'ism' && trimmed
      ? `Ism: "${trimmed}" — ${selectedPkg.label} paket`
      : `Harf yozish — ${selectedPkg.label} paket`
    onAdd({ id: `harf_${selected}_${Date.now()}`, name, price: selectedPkg.price, emoji: '🌹', category: 'harf' }, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setSelected(null)
    setIsmText('')
    setAdded(false)
  }

  const showPackages = mode === 'harf' || (mode === 'ism' && !!multInfo)

  return (
    <div className="harf-inline-wrap">

      {/* 2 ta asosiy tugma */}
      <div className="harf-inline-btns">
        <button
          className={`harf-inline-btn${mode === 'harf' ? ' active' : ''}`}
          onClick={() => handleModeChange(mode === 'harf' ? null : 'harf')}
        >
          <span className="harf-inline-btn-icon">✦</span>
          <span className="harf-inline-btn-title">Harf yozish</span>
          <span className="harf-inline-btn-sub">Bitta harf — 3 paket</span>
          <span className="harf-inline-btn-from">225 000 so'mdan</span>
        </button>
        <button
          className={`harf-inline-btn${mode === 'ism' ? ' active' : ''}`}
          onClick={() => handleModeChange(mode === 'ism' ? null : 'ism')}
        >
          <span className="harf-inline-btn-icon">✿</span>
          <span className="harf-inline-btn-title">Ism yozish</span>
          <span className="harf-inline-btn-sub">To'liq ism — uzunlikka qarab</span>
          <span className="harf-inline-btn-from">225 000 so'mdan</span>
        </button>
      </div>

      {/* Ism input */}
      {mode === 'ism' && (
        <div className="harf-inline-ism-wrap">
          <label className="harf-inline-ism-label">ISMNI KIRITING</label>
          <input
            className="harf-inline-ism-input"
            placeholder="Masalan: Malika, Jasur, Mohlaroyim..."
            value={ismText}
            onChange={e => { setIsmText(e.target.value); setSelected(null) }}
            maxLength={30}
            autoFocus
          />
          {nameLen > 0 && nameLen < 3 && (
            <p className="harf-modal-hint warn">⚠ Kamida 3 ta harf kiriting</p>
          )}
          {multInfo && (
            <p className="harf-modal-hint ok">📏 {multInfo.label}</p>
          )}
        </div>
      )}

      {/* Paket cardlari */}
      {showPackages && (
        <div className="harf-inline-pkgs-wrap">
          <p className="harf-inline-pkgs-title">PAKET TANLANG</p>
          <div className="harf-inline-pkgs-grid">
            {packages.map((pkg, i) => (
              <button
                key={pkg.id}
                className={`harf-inline-pkg-card${selected === pkg.id ? ' selected' : ''}`}
                onClick={() => setSelected(selected === pkg.id ? null : pkg.id)}
              >
                <div className="harf-inline-pkg-img-wrap">
                  {pkg.image ? (
                    <img
                      src={pkg.image}
                      alt={pkg.label}
                      className="harf-inline-pkg-img"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '2.4rem' }}>🌹</span>
                  )}
                  <span className="harf-inline-pkg-tier">
                    {i === 0 ? 'Standart' : i === 1 ? '⭐ Mashhur' : '👑 Premium'}
                  </span>
                </div>
                <p className="harf-inline-pkg-name">{pkg.label}</p>
                <div className="harf-inline-pkg-flowers">
                  <span className="harf-inline-red">🌹 {pkg.red} ta</span>
                  <span className="harf-inline-plus">+</span>
                  <span className="harf-inline-white">🤍 {pkg.white} ta</span>
                </div>
                <p className="harf-inline-pkg-price">{formatPrice(pkg.price)}</p>
                {selected === pkg.id && <span className="harf-inline-pkg-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Jami va savatga qo'shish */}
      {selectedPkg && (
        <div className="harf-inline-total">
          <div className="harf-inline-total-info">
            <span className="harf-inline-total-label">
              {mode === 'ism' && trimmed ? `"${trimmed}" — ${selectedPkg.label}` : `Harf — ${selectedPkg.label}`}
            </span>
            <span className="harf-inline-total-price">{formatPrice(selectedPkg.price)}</span>
          </div>
          <button
            className={`harf-inline-cart-btn${added ? ' success' : ''}`}
            onClick={handleAdd}
          >
            {added ? "✓ Savatga qo'shildi!" : "🛒 Savatga qo'shish"}
          </button>
        </div>
      )}

      {/* Boshlang'ich holat */}
      {!mode && (
        <div className="harf-inline-empty">
          <p>Yuqoridan <strong>Harf yozish</strong> yoki <strong>Ism yozish</strong> ni tanlang</p>
        </div>
      )}

    </div>
  )
}

// ─── CATALOG PAGE ───────────────────────────────────────────────
export default function Catalog({ likedIds, onToggleLike, onAddToCart }) {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('products').select('*').order('id', { ascending: false }),
      ])
      setCategories(catRes.data || [])
      setProducts(prodRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const [activeCatId, setActiveCatId]   = useState('buket')
  const [activeFilter, setActiveFilter] = useState('Barchasi')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [harfPkgs, setHarfPkgs] = useState(() => loadHarfPkgs())

  useEffect(() => {
    const onStorage = (e) => { if (e.key === 'fratino_harf_pkgs') setHarfPkgs(loadHarfPkgs()) }
    const onCustom  = () => setHarfPkgs(loadHarfPkgs())
    window.addEventListener('storage', onStorage)
    window.addEventListener('fratino_harf_updated', onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('fratino_harf_updated', onCustom)
    }
  }, [])

  const [ismMults, setIsmMults] = useState(() => loadIsmMults())

  useEffect(() => {
    const onStorage = (e) => { if (e.key === 'fratino_ism_mults') setIsmMults(loadIsmMults()) }
    const onCustom  = () => setIsmMults(loadIsmMults())
    window.addEventListener('storage', onStorage)
    window.addEventListener('fratino_ism_updated', onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('fratino_ism_updated', onCustom)
    }
  }, [])

  const closeModal = useCallback(() => setSelectedProduct(null), [])

  const activeCat = categories.find(c => c.id === activeCatId) || {}

  const handleCatChange = (catId) => {
    setActiveCatId(catId)
    setActiveFilter('Barchasi')
  }

  // Harf kategoriyasi uchun grid'da ko'rsatish
  const filteredProducts = products.filter(p => {
    if (p.category !== activeCatId) return false
    if (p.category === 'harf') return false   // harf modal orqali
    if (activeFilter === 'Barchasi') return true
    return p.type === activeFilter || p.badge === activeFilter
  })

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Yuklanmoqda...</div>

  return (
    <div className="catalog-page">

      <div className="catalog-hero">
        <div className="catalog-hero-pattern" />
        <span className="catalog-hero-deco">✿</span>
        <div className="catalog-hero-content">
          <p className="catalog-hero-eyebrow">GUL KATALOGI</p>
          <h1 className="catalog-hero-title">Barcha gullar</h1>
          <p className="catalog-hero-sub">Sevimli gullarni toping — buket yoki donasini tanlang</p>
        </div>
      </div>

      <div className="catalog-big-cats">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`big-cat-btn${activeCatId === cat.id ? ' active' : ''}`}
            onClick={() => handleCatChange(cat.id)}
          >
            <span className="big-cat-icon"><CatIcon catId={cat.id} /></span>
            <span className="big-cat-label">{cat.label}</span>
          </button>
        ))}
      </div>

      {activeCatId !== 'harf' && (
        <div className="catalog-filter-row">
          <span className="filter-row-label">Filter:</span>
          {(activeCat.filters || []).map(f => (
            <button
              key={f}
              className={`filter-tag${activeFilter === f ? ' active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {activeCatId !== 'harf' && (
        <>
          <div className="catalog-section-top">
            <h2>{activeCat.label}</h2>
            <span className="catalog-count">{filteredProducts.length} ta mahsulot</span>
          </div>

          <div className="catalog-products-grid">
            {filteredProducts.length === 0 ? (
              <div className="catalog-empty">
                <div className="catalog-empty-icon">🌿</div>
                <h3>Mahsulot topilmadi</h3>
                <p>Boshqa filter tanlang</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isDona={product.category === 'donalik'}
                  onSelect={setSelectedProduct}
                  liked={likedIds.includes(product.id)}
                  onToggleLike={onToggleLike}
                  onAddToCart={onAddToCart}
                />
              ))
            )}
          </div>
        </>
      )}

      {activeCatId === 'harf' && (
        <div className="catalog-products-grid">
          <HarfInlineSection harfPkgs={harfPkgs} ismMults={ismMults} onAdd={onAddToCart} />
        </div>
      )}

      {/* Donalik modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isDona={selectedProduct.category === 'donalik'}
          onClose={closeModal}
          onAdd={onAddToCart}
        />
      )}



    </div>
  )
}