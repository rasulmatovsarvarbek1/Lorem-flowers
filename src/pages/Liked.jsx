
import { useState, useCallback } from 'react'
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
function LikedCard({ product, onUnlike }) {
  const isDona = product.category === 'donalik'

  return (
    <div className="liked-card">
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
          onClick={() => onUnlike(product.id)}
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
          <button className="liked-cart-btn">
            🛒 Savat
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── LIKED PAGE ─────────────────────────────────────────────────
export default function Liked({ likedIds, onUnlike }) {
  const likedProducts = catalogData.products.filter(p => likedIds.includes(p.id))

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
            />
          ))
        )}
      </div>

    </div>
  )
}