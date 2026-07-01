import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Loader from '../components/Loader'
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

const CAT_ICONS = {

  // Kelin uchun — chiroyli uzuk (turmush qurish nishoni)
  kelin: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="15.5" r="5.5"/>
      <path d="M8 9 12 3l4 6z"/>
      <path d="M8 9h8l-4 4.5z"/>
    </svg>
  ),

  // Ism/Harf yozish — qalam
  harf: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      <path d="m15 5 4 4"/>
    </svg>
  ),

  // Bayram uchun — sovg'a qutisi
  bayram: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="1.5"/>
      <path d="M3 12h18"/>
      <path d="M12 8v13"/>
      <path d="M12 8c-1.3-4-5-4-5-1.5S9 8 12 8z"/>
      <path d="M12 8c1.3-4 5-4 5-1.5S15 8 12 8z"/>
    </svg>
  ),

  // Buketlar — o'ralgan guldasta
  buket: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 11 7 21h10l-1.5-10z"/>
      <path d="M10 21c0-1.8.9-2.8 2-2.8s2 1 2 2.8"/>
      <circle cx="9" cy="7" r="2"/>
      <circle cx="15" cy="7" r="2"/>
      <circle cx="12" cy="5" r="2.2"/>
      <circle cx="12" cy="8.3" r="1.8"/>
    </svg>
  ),

  // Yumshoq o'yinchoq — ayiqcha
  yumshoq: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="2.2"/>
      <circle cx="17" cy="7" r="2.2"/>
      <circle cx="12" cy="13" r="7"/>
      <ellipse cx="12" cy="15.5" rx="3" ry="2.2"/>
      <circle cx="9.3" cy="11.5" r="0.7" fill="currentColor" stroke="none"/>
      <circle cx="14.7" cy="11.5" r="0.7" fill="currentColor" stroke="none"/>
    </svg>
  ),

  // Donalik — bitta gul poyasi
  donalik: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V13"/>
      <circle cx="12" cy="7" r="1.6" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="3.5" r="2"/>
      <circle cx="15.5" cy="5.2" r="2"/>
      <circle cx="15.5" cy="8.8" r="2"/>
      <circle cx="12" cy="10.5" r="2"/>
      <circle cx="8.5" cy="8.8" r="2"/>
      <circle cx="8.5" cy="5.2" r="2"/>
    </svg>
  ),

}

function CatIcon({ catId }) {
  return CAT_ICONS[catId] || null
}

// ─── SMALL UI ICONS (emoji o'rniga) ─────────────────────────────
function XIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CheckIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function CartIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function WarnIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 1.8 18a1.5 1.5 0 0 0 1.3 2.2h17.8a1.5 1.5 0 0 0 1.3-2.2L13.7 3.9a1.5 1.5 0 0 0-2.6 0z" />
      <path d="M12 9v4" />
      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PenSmallIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

function FlowerSmallIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="12" cy="6" r="2.2" />
      <circle cx="12" cy="18" r="2.2" />
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="12" r="2.2" />
    </svg>
  )
}

function LeafIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 4 13c0-6 7-10 15-10 0 8-4 15-10 15a7 7 0 0 1-7-7" />
      <path d="M4 13c3 0 8-1 10-6" />
    </svg>
  )
}

function RoseSmallIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4.5" />
      <path d="M12 12.5V21" />
      <path d="M12 17c-2 0-3.5-1-3.5-1" />
    </svg>
  )
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
      onAdd({ id: `harf_${selectedHarfPkg}_${Date.now()}`, name: harfName, price: selHarfPkg.price, category: 'harf' }, 1)
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
          <button className="modal-x-btn" onClick={onClose} aria-label="Yopish"><XIcon size={16} /></button>
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
              Harf yoki ism yozdirish
              <span className="modal-harf-optional"> (ixtiyoriy)</span>
            </p>
            <div className="modal-harf-mode-row">
              <button
                className={`modal-harf-mode-btn${harfMode === 'harf' ? ' active' : ''}`}
                onClick={() => { setHarfMode(harfMode === 'harf' ? null : 'harf'); setIsmText(''); setSelectedHarfPkg(null) }}
              ><PenSmallIcon /> Harf</button>
              <button
                className={`modal-harf-mode-btn${harfMode === 'ism' ? ' active' : ''}`}
                onClick={() => { setHarfMode(harfMode === 'ism' ? null : 'ism'); setIsmText(''); setSelectedHarfPkg(null) }}
              ><FlowerSmallIcon /> Ism</button>
              {harfMode && (
                <button
                  className="modal-harf-mode-btn cancel"
                  onClick={() => { setHarfMode(null); setIsmText(''); setSelectedHarfPkg(null) }}
                ><XIcon size={12} /> Bekor</button>
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
                {nameLen > 0 && nameLen < 3 && <p className="harf-modal-hint warn"><WarnIcon /> Kamida 3 harf kiriting</p>}
                {multInfo && <p className="harf-modal-hint ok">{multInfo.label}</p>}
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
                    <span className="modal-harf-pkg-badge">{i === 0 ? 'Standart' : i === 1 ? 'Mashhur' : 'Premium'}</span>
                    <span className="modal-harf-pkg-name">{pkg.label}</span>
                    <span className="modal-harf-pkg-flowers">{pkg.red} qizil + {pkg.white} oq</span>
                    <span className="modal-harf-pkg-price">{formatPrice(pkg.price)}</span>
                    {selectedHarfPkg === pkg.id && <span className="modal-harf-pkg-check"><CheckIcon /></span>}
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
          {added ? <><CheckIcon /> Savatga qo'shildi!</> : <><CartIcon /> Savatga qo'shish</>}
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
  const [mode, setMode]         = useState(null)   // null | 'harf' | 'ism'
  const [ismText, setIsmText]   = useState('')
  const [harfText, setHarfText] = useState('')      // qaysi harf yozilishi
  const [selected, setSelected] = useState(null)
  const [added, setAdded]       = useState(false)

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
    let name
    if (mode === 'ism' && trimmed) {
      name = `Ism: "${trimmed}" — ${selectedPkg.label} paket`
    } else if (mode === 'harf' && harfText.trim()) {
      name = `Harf: "${harfText.trim().toUpperCase()}" — ${selectedPkg.label} paket`
    } else {
      name = `Harf yozish — ${selectedPkg.label} paket`
    }
    onAdd({
      id: `harf_${selected}_${Date.now()}`,
      name,
      price: selectedPkg.price,
      category: 'harf',
      harfNote: mode === 'ism'
        ? `Ism yozish: "${trimmed}"`
        : harfText.trim()
          ? `Harf yozish: "${harfText.trim().toUpperCase()}"`
          : 'Harf yozish',
    }, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setSelected(null)
    setIsmText('')
    setHarfText('')
    setAdded(false)
  }

  // Harf rejimida: harf kiritilsa paketlar ko'rinadi
  const showPackages = (mode === 'harf' && harfText.trim().length > 0) || (mode === 'ism' && !!multInfo)

  return (
    <div className="harf-inline-wrap">

      {/* 2 ta asosiy tugma */}
      <div className="harf-inline-btns">
        <button
          className={`harf-inline-btn${mode === 'harf' ? ' active' : ''}`}
          onClick={() => handleModeChange(mode === 'harf' ? null : 'harf')}
        >
          <span className="harf-inline-btn-icon"><PenSmallIcon size={18} /></span>
          <span className="harf-inline-btn-title">Harf yozish</span>
          <span className="harf-inline-btn-sub">Bitta harf — 3 paket</span>
          <span className="harf-inline-btn-from">225 000 so'mdan</span>
        </button>
        <button
          className={`harf-inline-btn${mode === 'ism' ? ' active' : ''}`}
          onClick={() => handleModeChange(mode === 'ism' ? null : 'ism')}
        >
          <span className="harf-inline-btn-icon"><FlowerSmallIcon size={18} /></span>
          <span className="harf-inline-btn-title">Ism yozish</span>
          <span className="harf-inline-btn-sub">To'liq ism — uzunlikka qarab</span>
          <span className="harf-inline-btn-from">225 000 so'mdan</span>
        </button>
      </div>

      {/* Harf input */}
      {mode === 'harf' && (
        <div className="harf-inline-ism-wrap">
          <label className="harf-inline-ism-label">QAYSI HARF YOZILSIN?</label>
          <input
            className="harf-inline-ism-input"
            placeholder="Masalan: A, O, Z ..."
            value={harfText}
            onChange={e => { setHarfText(e.target.value); setSelected(null) }}
            maxLength={5}
            autoFocus
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1.2rem', fontWeight: 700 }}
          />
          {harfText.trim().length === 0 && (
            <p className="harf-modal-hint warn"><WarnIcon /> Harf kiriting — paketlar ko'rinadi</p>
          )}
          {harfText.trim().length > 0 && (
            <p className="harf-modal-hint ok">"{harfText.trim().toUpperCase()}" harfi tanlandi</p>
          )}
        </div>
      )}

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
            <p className="harf-modal-hint warn"> Kamida 3 ta harf kiriting</p>
          )}
          {multInfo && (
            <p className="harf-modal-hint ok"> {multInfo.label}</p>
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
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}><RoseSmallIcon size={34} /></span>
                  )}
                  <span className="harf-inline-pkg-tier">
                    {i === 0 ? 'Standart' : i === 1 ? ' Mashhur' : ' Premium'}
                  </span>
                </div>
                <p className="harf-inline-pkg-name">{pkg.label}</p>
                <div className="harf-inline-pkg-flowers">
                  <span className="harf-inline-red"> {pkg.red} ta</span>
                  <span className="harf-inline-plus">+</span>
                  <span className="harf-inline-white"> {pkg.white} ta</span>
                </div>
                <p className="harf-inline-pkg-price">{formatPrice(pkg.price)}</p>
                {selected === pkg.id && <span className="harf-inline-pkg-check"><CheckIcon /></span>}
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
            {added ? <><CheckIcon /> Savatga qo'shildi!</> : <><CartIcon /> Savatga qo'shish</>}
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
export default function Catalog({ likedIds, onToggleLike, onAddToCart, catalogData, catalogLoading }) {
  const navigate = useNavigate()

  // Agar ma'lumot App.jsx dan props orqali kelsa — qayta fetch yo'q
  const hasExternalData = catalogData && Array.isArray(catalogData.categories) && Array.isArray(catalogData.products)
  const [localCategories, setLocalCategories] = useState([])
  const [localProducts, setLocalProducts]     = useState([])
  const [localLoading, setLocalLoading]       = useState(!hasExternalData)

  useEffect(() => {
    if (hasExternalData) return
    async function fetchData() {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('products').select('*').order('id', { ascending: false }),
      ])
      setLocalCategories(catRes.data || [])
      setLocalProducts(prodRes.data || [])
      setLocalLoading(false)
    }
    fetchData()
  }, [hasExternalData])

  const categories = hasExternalData ? catalogData.categories : localCategories
  const products   = hasExternalData ? catalogData.products   : localProducts
  const loading    = hasExternalData ? (catalogLoading ?? false) : localLoading

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

  if (loading) return <Loader />

  return (
    <div className="catalog-page">

      <div className="catalog-hero">
        <div className="catalog-hero-pattern" />
        <span className="catalog-hero-deco"></span>
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
        {/* Buket terish tugmasi — "Ism yozish" dan keyin */}
        <button
          className="big-cat-btn bouquet-builder-btn"
          onClick={() => navigate('/bouquet')}
        >
          <span className="big-cat-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12 7 21h10l-2-9z"/>
              <path d="M10 12v-1a2 2 0 0 1 4 0v1"/>
              <circle cx="8.5" cy="7.5" r="2"/>
              <circle cx="15.5" cy="7.5" r="2"/>
              <circle cx="12" cy="5.3" r="2.2"/>
              <path d="M11 21c.3-1.3 1-1.9 1-1.9s.7.6 1 1.9"/>
            </svg>
          </span>
          <span className="big-cat-label">Buket terish</span>
        </button>
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
                <div className="catalog-empty-icon"><LeafIcon /></div>
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