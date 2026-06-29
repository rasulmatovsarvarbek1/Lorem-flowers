import { useState, useCallback, useEffect } from 'react'
import catalogData from '../data/catalog.json'
import './Liked.css'

// ─── FORMAT PRICE ───────────────────────────────────────────────
function formatPrice(price) {
  return new Intl.NumberFormat('uz-UZ').format(price) + " so'm"
}

// ─── FLOWER IMAGE with fallback ─────────────────────────────────
function FlowerImg({ src, alt, emoji, className }) {
  const [err, setErr] = useState(false)
  if (src && !err) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setErr(true)}
      />
    )
  }
  return <span style={{ fontSize: '4rem', lineHeight: 1 }}>{emoji}</span>
}

// ─── LIKED CARD ─────────────────────────────────────────────────
function LikedCard({ product, onUnlike, onAddToCart, onOpenModal }) {
  const isDona = product.category === 'donalik'

  return (
    <div className="liked-card" onClick={() => onOpenModal(product)} style={{ cursor: 'pointer' }}>
      <div className={`liked-card-img ${product.imgClass}`}>
        <FlowerImg
          src={product.imageUrl}
          alt={product.name}
          emoji={product.emoji}
          className="liked-card-real-img"
        />
        {product.badge && <span className="liked-card-badge">{product.badge}</span>}
        <button
          className="liked-unlike-btn"
          onClick={(e) => { e.stopPropagation(); onUnlike(product.id) }}
          aria-label="Yoqtirishdan olib tashlash"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="liked-card-body">
        <p className="liked-card-type">{product.type}</p>
        <h3 className="liked-card-name">{product.name}</h3>
        <p className="liked-card-desc">{product.desc}</p>
        <div className="liked-card-footer">
          <div className="liked-card-price">
            {formatPrice(product.price)}
            <br />
            <small>/ {isDona ? '1 dona' : 'buket'}</small>
          </div>
          <button
            className="liked-cart-btn"
            onClick={(e) => { e.stopPropagation(); onAddToCart(product, 1); onUnlike(product.id) }}
          >
            🛒 Savat
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── LIKED PAGE ─────────────────────────────────────────────────
export default function Liked({ likedIds, onUnlike, onAddToCart }) {
  const likedProducts = catalogData.products.filter(p => likedIds.includes(p.id))
  const [selectedProduct, setSelectedProduct] = useState(null)
  const closeModal = useCallback(() => setSelectedProduct(null), [])

  // Mini modal (Catalog.jsx dagi ProductModal o'rniga)
  function LikedModal({ product, onClose, onUnlike }) {
    const [qty, setQty] = useState(1)
    const [added, setAdded] = useState(false)
    const isDona = product.category === 'donalik'

    useEffect(() => {
      const h = (e) => { if (e.key === 'Escape') onClose() }
      window.addEventListener('keydown', h)
      document.body.style.overflow = 'hidden'
      return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
    }, [onClose])

    const handleAdd = () => {
      onAddToCart(product, qty)
      onUnlike(product.id)
      setAdded(true)
      setTimeout(() => { setAdded(false); onClose() }, 1200)
    }

    return (
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(42,33,24,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}
      >
        <div style={{ background: '#fff', borderRadius: 20, padding: '1.75rem', width: 340, maxWidth: 'calc(100vw - 2rem)', maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div>
              <p style={{ fontSize: '0.68rem', color: 'var(--pink)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>{product.type}</p>
              <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '1.15rem', fontWeight: 600, color: 'var(--text)' }}>{product.name}</p>
            </div>
            <button onClick={onClose} style={{ background: '#f0ebe6', border: 'none', width: 32, height: 32, borderRadius: '50%', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          <div style={{ width: '100%', height: 200, borderRadius: 14, overflow: 'hidden', margin: '0.9rem 0', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlowerImg src={product.imageUrl} alt={product.name} emoji={product.emoji} className="liked-card-real-img" />
          </div>

          <p style={{ fontSize: '0.82rem', color: '#9e8c84', marginBottom: '1rem' }}>{product.desc}</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#faf5f0', borderRadius: 12, padding: '12px 16px', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: '#9e8c84', marginBottom: 2 }}>1 {isDona ? 'dona' : 'buket'} narxi</p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--pink)' }}>{formatPrice(product.price)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.7rem', color: '#9e8c84', marginBottom: 2 }}>Turi</p>
              <p style={{ fontSize: '0.82rem', fontWeight: 500 }}>{product.type}</p>
            </div>
          </div>

          {isDona && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid #e8c4c8', background: '#fff', color: '#c4848a', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontSize: '1.6rem', fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid #e8c4c8', background: '#fff', color: '#c4848a', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderTop: '1px solid #f0ebe6', borderBottom: '1px solid #f0ebe6', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#9e8c84' }}>Jami narx ({isDona ? `${qty} dona` : '1 buket'})</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatPrice(product.price * qty)}</span>
          </div>

          <button
            onClick={handleAdd}
            style={{ width: '100%', background: added ? '#6a9e5a' : 'var(--pink)', color: '#fff', border: 'none', padding: 13, borderRadius: 14, fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
          >
            {added ? "✓ Savatga qo'shildi!" : "🛒 Savatga qo'shish"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="liked-page">

      {/* HERO */}
      <div className="liked-hero">
        <div className="liked-hero-pattern" />
        <div className="liked-hero-content">
          <p className="liked-hero-eyebrow">MENING SAHIFAM</p>
          <h1 className="liked-hero-title">Yoqtirilganlar</h1>
          <p className="liked-hero-sub">Siz yoqtirgan gullar shu yerda saqlanadi</p>
        </div>
        <span className="liked-hero-deco">♡</span>
      </div>

      {/* COUNT */}
      <div className="liked-section-top">
        <h2>Saqlangan gullar</h2>
        <span className="liked-count">{likedProducts.length} ta</span>
      </div>

      {/* GRID */}
      <div className="liked-grid">
        {likedProducts.length === 0 ? (
          <div className="liked-empty">
            <div className="liked-empty-icon">🤍</div>
            <h3>Hali hech narsa yoqtirilmagan</h3>
            <p>Katalogdagi gullarda yurak belgisini bosing</p>
          </div>
        ) : (
          likedProducts.map(product => (
            <LikedCard
              key={product.id}
              product={product}
              onUnlike={onUnlike}
              onAddToCart={onAddToCart}
              onOpenModal={setSelectedProduct}
            />
          ))
        )}
      </div>

      {selectedProduct && (
        <LikedModal product={selectedProduct} onClose={closeModal} onUnlike={onUnlike} />
      )}

    </div>
  )
}