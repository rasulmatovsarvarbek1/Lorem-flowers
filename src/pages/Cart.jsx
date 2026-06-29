import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function formatPrice(price) {
  return new Intl.NumberFormat('uz-UZ').format(price) + " so'm"
}

function FlowerImg({ src, alt, emoji }) {
  const [err, setErr] = useState(false)
  if (src && !err) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setErr(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 10 }}
      />
    )
  }
  return <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{emoji}</span>
}

const CART_RESPONSIVE_CSS = `
  /* ── Base ── */
  .cart-page-main { padding: 3rem 3rem 5rem; max-width: 860px; margin: 0 auto; box-sizing: border-box; }
  .cart-layout { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; align-items: start; }
  .cart-item-card { display: flex; align-items: center; gap: 1rem; box-sizing: border-box; }
  .cart-item-img { width: 72px; height: 72px; flex-shrink: 0; }
  .cart-item-info { flex: 1; min-width: 0; overflow: hidden; }
  .cart-item-controls { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
  .cart-item-qty { display: flex; align-items: center; gap: 0.5rem; }
  .cart-summary { position: sticky; top: 5rem; box-sizing: border-box; }
  .cart-header-title { font-size: 2rem; }

  /* ── 1200px ── */
  @media (max-width: 1200px) {
    .cart-page-main { padding: 2.5rem 2rem 4rem; max-width: 100%; }
  }

  /* ── 860px ── */
  @media (max-width: 860px) {
    .cart-layout { grid-template-columns: 1fr; }
    .cart-summary { position: static; top: auto; }
  }

  /* ── 640px ── */
  @media (max-width: 640px) {
    .cart-page-main { padding: 1.75rem 1.25rem 3.5rem; }
    .cart-header-title { font-size: 1.65rem !important; }
    .cart-item-card { padding: 0.85rem !important; gap: 0.75rem !important; }
    .cart-item-img { width: 62px !important; height: 62px !important; }
  }

  /* ── 480px ── */
  @media (max-width: 480px) {
    .cart-page-main { padding: 1.5rem 1rem 3rem; }
    .cart-header-title { font-size: 1.45rem !important; }
    .cart-item-card { flex-wrap: wrap; gap: 0.6rem !important; }
    .cart-item-img { width: 56px !important; height: 56px !important; }
    .cart-item-info { min-width: calc(100% - 56px - 0.6rem - 32px) !important; }
    .cart-item-controls { order: 3; margin-left: calc(56px + 0.6rem); gap: 0.6rem !important; }
    .cart-item-qty button { width: 26px !important; height: 26px !important; font-size: 1rem !important; }
  }

  /* ── 380px ── */
  @media (max-width: 380px) {
    .cart-page-main { padding: 1.25rem 0.875rem 2.5rem; }
    .cart-header-title { font-size: 1.25rem !important; }
    .cart-item-card { padding: 0.75rem !important; }
    .cart-item-img { width: 50px !important; height: 50px !important; }
    .cart-item-controls { margin-left: calc(50px + 0.6rem); }
    .cart-summary { padding: 1.1rem !important; border-radius: 16px !important; }
  }

  /* ── 320px ── */
  @media (max-width: 320px) {
    .cart-page-main { padding: 1rem 0.75rem 2rem; }
    .cart-header-title { font-size: 1.1rem !important; }
    .cart-item-card { padding: 0.65rem !important; gap: 0.5rem !important; }
    .cart-item-img { width: 44px !important; height: 44px !important; }
    .cart-item-info { min-width: calc(100% - 44px - 0.5rem - 28px) !important; }
    .cart-item-controls { margin-left: calc(44px + 0.5rem); gap: 0.4rem !important; }
    .cart-item-qty button { width: 24px !important; height: 24px !important; font-size: 0.9rem !important; }
    .cart-summary { padding: 0.9rem !important; border-radius: 14px !important; }
  }
`

export default function Cart({ cartItems, onRemove, onUpdateQty, onClearCart }) {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const navigate = useNavigate()

  const handleOrder = () => {
    navigate('/checkout')
  }

  return (
    <main className="cart-page-main" style={{ minHeight: '70vh' }}>
      <style>{CART_RESPONSIVE_CSS}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', color: 'var(--pink)', fontWeight: 600, marginBottom: '0.4rem' }}>
          XARID SAVATI
        </p>
        <h1 className="cart-header-title" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: 'var(--text)' }}>
          Savatim
        </h1>
      </div>

      {cartItems.length === 0 ? (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Savat bo'sh
          </h3>
          <p style={{ fontSize: '0.85rem' }}>Katalogdan gul tanlang va savatga qo'shing</p>
        </div>
      ) : (
        <div className="cart-layout">

          {/* Items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: 0 }}>
            {cartItems.map(item => (
              <div key={item.id} className="cart-item-card" style={{
                background: 'var(--white)', borderRadius: 16,
                padding: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
              }}>
                {/* Image */}
                <div className="cart-item-img" style={{
                  borderRadius: 10, overflow: 'hidden',
                  flexShrink: 0, background: 'var(--cream)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FlowerImg src={item.imageUrl} alt={item.name} emoji={item.emoji} />
                </div>

                {/* Info */}
                <div className="cart-item-info" style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.68rem', color: 'var(--pink)', fontWeight: 600, marginBottom: 2, letterSpacing: '0.05em' }}>
                    {item.type}
                  </p>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                    {formatPrice(item.price * item.qty)}
                  </p>
                </div>

                {/* Qty + Remove */}
                <div className="cart-item-controls">
                  <div className="cart-item-qty">
                    <button
                      onClick={() => onUpdateQty(item.id, item.qty - 1)}
                      disabled={item.qty <= 1}
                      style={{
                        width: 30, height: 30, borderRadius: '50%',
                        border: '1.5px solid var(--pink-light)',
                        background: 'var(--white)', color: 'var(--pink)',
                        fontSize: '1.1rem', cursor: item.qty <= 1 ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: item.qty <= 1 ? 0.35 : 1, transition: 'all 0.15s',
                        fontFamily: 'inherit', lineHeight: 1, flexShrink: 0
                      }}
                    >−</button>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: 20, textAlign: 'center' }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      style={{
                        width: 30, height: 30, borderRadius: '50%',
                        border: '1.5px solid var(--pink-light)',
                        background: 'var(--white)', color: 'var(--pink)',
                        fontSize: '1.1rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', fontFamily: 'inherit', lineHeight: 1, flexShrink: 0
                      }}
                    >+</button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemove(item.id)}
                    aria-label="O'chirish"
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      border: 'none', background: 'var(--cream-dark)',
                      color: 'var(--text-muted)', fontSize: '0.85rem',
                      cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fce8ea'; e.currentTarget.style.color = 'var(--pink)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--cream-dark)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                  >✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="cart-summary" style={{
            background: 'var(--white)', borderRadius: 20,
            padding: '1.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.07)'
          }}>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem' }}>
              Buyurtma xulosasi
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
              <span>Mahsulotlar ({cartItems.reduce((s, i) => s + i.qty, 0)} ta)</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
              <span>Yetkazib berish</span>
              <span style={{ color: '#6a9e5a', fontWeight: 600 }}>Bepul</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: '1px solid var(--cream-dark)', paddingTop: '1rem', marginBottom: '1.25rem'
            }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>Jami</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--pink)' }}>{formatPrice(total)}</span>
            </div>

            <button
              onClick={handleOrder}
              style={{
                width: '100%', padding: '13px',
                background: 'var(--pink)',
                color: '#fff', border: 'none', borderRadius: 14,
                fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s, transform 0.1s',
                marginBottom: '0.65rem'
              }}
            >
              Buyurtma berish →
            </button>

            <button
              onClick={onClearCart}
              style={{
                width: '100%', padding: '10px',
                background: 'transparent', color: 'var(--text-muted)',
                border: '1px solid var(--cream-dark)', borderRadius: 14,
                fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--pink)'; e.currentTarget.style.color = 'var(--pink)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cream-dark)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              Savatni tozalash
            </button>
          </div>
        </div>
      )}
    </main>
  )
}