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

export default function Cart({ cartItems, onRemove, onUpdateQty, onClearCart }) {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const navigate = useNavigate()

  const handleOrder = () => {
    navigate('/checkout')
  }

  return (
    <main className="cart-page-main" style={{ minHeight: '70vh', padding: '3rem 3rem 5rem', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', color: 'var(--pink)', fontWeight: 600, marginBottom: '0.4rem' }}>
          XARID SAVATI
        </p>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem', fontWeight: 600, color: 'var(--text)' }}>
          Savatim
        </h1>
      </div>

      {cartItems.length === 0 ? (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Savat bo'sh
          </h3>
          <p style={{ fontSize: '0.85rem' }}>Katalogdan gul tanlang va savatga qo'shing</p>
        </div>
      ) : (
        <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>

          {/* Items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'var(--white)', borderRadius: 16,
                padding: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
              }}>
                {/* Image */}
                <div style={{
                  width: 72, height: 72, borderRadius: 10, overflow: 'hidden',
                  flexShrink: 0, background: 'var(--cream)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FlowerImg src={item.imageUrl} alt={item.name} emoji={item.emoji} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.68rem', color: 'var(--pink)', fontWeight: 600, marginBottom: 2, letterSpacing: '0.05em' }}>
                    {item.type}
                  </p>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                    {formatPrice(item.price * item.qty)}
                  </p>
                </div>

                {/* Qty */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
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
                      fontFamily: 'inherit', lineHeight: 1
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
                      transition: 'all 0.15s', fontFamily: 'inherit', lineHeight: 1
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
            ))}
          </div>

          {/* Order summary */}
          <div style={{
            background: 'var(--white)', borderRadius: 20,
            padding: '1.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
            position: 'sticky', top: '5rem'
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