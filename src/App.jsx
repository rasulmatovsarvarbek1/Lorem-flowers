import { useState, useCallback, useEffect } from 'react'
import Gallery from './pages/Gallery'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import data from './data/flowers.json'
import catalogData from './data/catalog.json'
import Footer from './components/Footer'
import Catalog from './pages/Catalog'
import Contact from './pages/Contact'
import Liked from './pages/Liked'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'
import { useLiked } from './hooks/useLiked'
import { useCart } from './hooks/useCart'
import './App.css'

// ─── STAR RATING ────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
      <span className="rating-num">{rating}</span>
    </span>
  )
}

const StepIcons = {
  1: (
    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  2: (
    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  3: (
    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 4v4h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
}

// ─── NAVBAR ─────────────────────────────────────────────────────
function Navbar({ likedCount, cartCount }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { to: '/',         label: 'Bosh sahifa' },
    { to: '/catalog',  label: 'Gullar'      },
    { to: '/gallery',  label: 'Gallereya'   },
    { to: '/contact',  label: 'Aloqa'       },
  ]

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo" style={{ cursor: 'default' }}>
          <span className="logo-icon">✿</span>
          <div className="logo-text">
            <span className="logo-name">Lorem Flowers</span>
            <span className="logo-sub">GUL DO'KONI</span>
          </div>
        </div>

        <ul className="navbar-links">
          {navLinks.map(link => (
            <li key={link.to}>
              <Link
                to={link.to}
                style={{
                  color: location.pathname === link.to ? 'var(--pink)' : undefined,
                  fontWeight: location.pathname === link.to ? 600 : 400
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-icons">
          {/* Yoqtirilganlar */}
          <Link to="/liked" className="icon-btn" aria-label="Yoqtirilganlar" style={{ position: 'relative', textDecoration: 'none', color: 'inherit' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {likedCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--pink)', color: '#fff',
                borderRadius: '50%', fontSize: '0.62rem',
                width: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, lineHeight: 1
              }}>
                {likedCount}
              </span>
            )}
          </Link>

          {/* Savat */}
          <Link to="/cart" className="icon-btn" aria-label="Savat" style={{ position: 'relative', textDecoration: 'none', color: 'inherit' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M3 6h18l-2 9H5L3 6z"/>
              <path d="M8 6V5a4 4 0 0 1 8 0v1"/>
              <circle cx="9" cy="19" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="19" r="1.2" fill="currentColor" stroke="none"/>
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--pink)', color: '#fff',
                borderRadius: '50%', fontSize: '0.62rem',
                width: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, lineHeight: 1
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Hamburger */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menyu"
          >
            {menuOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="mobile-menu-link"
              style={{
                color: location.pathname === link.to ? 'var(--pink)' : undefined,
                fontWeight: location.pathname === link.to ? 600 : 400
              }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

// ─── HOME PAGE ───────────────────────────────────────────────────
function Hero() {
  const { hero } = data
  const lines = hero.title.split('\n')
  return (
    <section
      className="hero"
      style={{
        backgroundImage: `url(${hero.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-title">
          {lines.map((line, i) => <span key={i}>{line}<br /></span>)}
        </h1>
        <p className="hero-subtitle">{hero.subtitle}</p>
        <div className="hero-btns">
          <Link to="/catalog">
            <button className="btn-primary">Xarid qilish →</button>
          </Link>
          <button className="btn-outline">Kolleksiyalar</button>
        </div>
      </div>
    </section>
  )
}

function Collections() {
  const { collections } = data
  return (
    <section className="collections-section">
      <div className="section-header">
        <h2 className="section-title">Maxsus Kolleksiyalar</h2>
        <p className="section-sub">Hayotingizning har bir muhim lahzasi uchun mukammal gul kompozitsiyalari</p>
      </div>
      <div className="collections-grid">
        {collections.map(col => (
          <div
            key={col.id}
            className="collection-card"
            style={{
              backgroundImage: `url(${col.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="collection-overlay" />
            <div className="collection-info">
              <span className="collection-count">{col.count} ta kompozitsiya</span>
              <h3 className="collection-name">{col.name}</h3>
              <p className="collection-desc">{col.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── FLOWER TYPE SVG ICONS ───────────────────────────────────────
function FlowerTypeIcon({ type, size = 40 }) {
  const t = (type || '').toLowerCase()
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (t.includes('atirgul') || t.includes('rose')) return (
    <svg {...props}><path d="M12 22V12"/><path d="M12 12C12 12 7 10 7 6a5 5 0 0 1 10 0c0 4-5 6-5 6z"/><path d="M9 16c-2 0-4-1-4-3 0-1.5 1.5-2.5 3-2"/><path d="M15 16c2 0 4-1 4-3 0-1.5-1.5-2.5-3-2"/></svg>
  )
  if (t.includes('lola') || t.includes('tulip')) return (
    <svg {...props}><path d="M12 22v-8"/><path d="M12 14c0 0-5-2-5-7 0-2.5 2-4 5-4s5 1.5 5 4c0 5-5 7-5 7z"/></svg>
  )
  if (t.includes('pion') || t.includes('peony')) return (
    <svg {...props}><circle cx="12" cy="10" r="4"/><path d="M12 14v8"/><path d="M8 10c0 0-3-1-3-4 1-1 3 0 3 0"/><path d="M16 10c0 0 3-1 3-4-1-1-3 0-3 0"/><path d="M12 6c0 0-1-3 1-4 1 1 1 3 1 3"/></svg>
  )
  if (t.includes('nargiz')) return (
    <svg {...props}><circle cx="12" cy="9" r="2.5"/><path d="M12 2v2M12 14v2M5.5 5.5l1.4 1.4M15.1 12.1l1.4 1.4M2 9h2M18 9h2M5.5 12.5l1.4-1.4M15.1 5.9l1.4-1.4"/><path d="M12 16v6"/></svg>
  )
  if (t.includes('gilos') || t.includes('cherry')) return (
    <svg {...props}><path d="M9 18c0 1.7-1.3 3-3 3s-3-1.3-3-3 1.3-3 3-3 3 1.3 3 3z"/><path d="M21 18c0 1.7-1.3 3-3 3s-3-1.3-3-3 1.3-3 3-3 3 1.3 3 3z"/><path d="M6 15V9c0-3 3-6 6-7"/><path d="M18 15V9c0-3-3-6-6-7"/></svg>
  )
  // default: buket
  return (
    <svg {...props}><path d="M12 22v-9"/><path d="M9 13c0 0-4-1-4-5 0-2 1.5-3.5 4-3 0 0 1-3 3-3s3 3 3 3c2.5-.5 4 1 4 3 0 4-4 5-4 5"/><path d="M9 17c-1.5 0-3-.8-3-2"/><path d="M15 17c1.5 0 3-.8 3-2"/></svg>
  )
}

// imgClass → rang
const CAT_COLORS = {
  lola:    { bg: '#EFF6FF', stroke: '#3B82F6' },
  atirgul: { bg: '#FFF1F2', stroke: '#F43F5E' },
  pion:    { bg: '#FAF5FF', stroke: '#A855F7' },
  tulpan:  { bg: '#ECFDF5', stroke: '#10B981' },
  nargiz:  { bg: '#FEFCE8', stroke: '#EAB308' },
  gilos:   { bg: '#FFF7ED', stroke: '#F97316' },
  aralash: { bg: '#F0FDF4', stroke: '#22C55E' },
}

// ─── HOME PRODUCT MODAL ──────────────────────────────────────────
function HomeProductModal({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const colors = CAT_COLORS[product.imgClass] || { bg: '#FFF1F2', stroke: '#F43F5E' }
  const formatPrice = (p) => new Intl.NumberFormat('uz-UZ').format(p) + " so'm"
  const isDona = product.category === 'donalik'

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])

  const handleAdd = () => {
    onAdd(product, qty)
    setAdded(true)
    setTimeout(() => { setAdded(false); onClose() }, 1200)
  }

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(42,33,24,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, animation:'fadeIn 0.15s ease' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background:'#fff', borderRadius:20, padding:'1.75rem', width:340, maxWidth:'calc(100vw - 2rem)', animation:'slideUp 0.2s ease' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.25rem' }}>
          <div>
            <p style={{ fontSize:'0.68rem', color: colors.stroke, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:3 }}>{product.type}</p>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'1.15rem', fontWeight:600, color:'#2a2118' }}>{product.name}</p>
          </div>
          <button onClick={onClose} style={{ background:'#f0ebe6', border:'none', width:32, height:32, borderRadius:'50%', fontSize:'1rem', color:'#9e8c84', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Image / Icon */}
        <div style={{ width:'100%', height:200, borderRadius:14, overflow:'hidden', margin:'0.9rem 0', background: colors.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          ) : (
            <span style={{ color: colors.stroke, opacity:0.8 }}><FlowerTypeIcon type={product.type} size={72} /></span>
          )}
        </div>

        <p style={{ fontSize:'0.82rem', color:'#9e8c84', lineHeight:1.6, marginBottom:'0.8rem', textAlign:'center' }}>{product.desc}</p>

        {/* Price info */}
        <div style={{ display:'flex', justifyContent:'space-between', background:'#faf5f0', borderRadius:12, padding:'12px 16px', marginBottom:'1rem' }}>
          <div><p style={{ fontSize:'0.7rem', color:'#9e8c84', marginBottom:2 }}>1 {isDona ? 'dona' : 'buket'} narxi</p><p style={{ fontSize:'1rem', fontWeight:700, color: colors.stroke }}>{formatPrice(product.price)}</p></div>
          <div style={{ textAlign:'right' }}><p style={{ fontSize:'0.7rem', color:'#9e8c84', marginBottom:2 }}>Turi</p><p style={{ fontSize:'0.82rem', fontWeight:500, color:'#2a2118' }}>{product.type}</p></div>
        </div>

        {/* Qty (donalik uchun) */}
        {isDona && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'1rem', marginBottom:'1rem' }}>
            <button onClick={() => setQty(q => Math.max(1,q-1))} disabled={qty<=1} style={{ width:40,height:40,borderRadius:'50%',border:'1.5px solid #e8c4c8',background:'#fff',color:'#c4848a',fontSize:'1.3rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>−</button>
            <span style={{ fontSize:'1.6rem', fontWeight:700, color:'#2a2118', minWidth:40, textAlign:'center' }}>{qty}</span>
            <button onClick={() => setQty(q => q+1)} style={{ width:40,height:40,borderRadius:'50%',border:'1.5px solid #e8c4c8',background:'#fff',color:'#c4848a',fontSize:'1.3rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>+</button>
          </div>
        )}

        {/* Total */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.9rem 0', borderTop:'1px solid #f0ebe6', borderBottom:'1px solid #f0ebe6', marginBottom:'1rem' }}>
          <span style={{ fontSize:'0.82rem', color:'#9e8c84' }}>Jami narx ({isDona ? `${qty} dona` : '1 buket'})</span>
          <span style={{ fontSize:'1.4rem', fontWeight:700, color:'#2a2118' }}>{formatPrice(product.price * qty)}</span>
        </div>

        <button
          onClick={handleAdd}
          style={{ width:'100%', background: added ? '#6a9e5a' : '#c4848a', color:'#fff', border:'none', padding:13, borderRadius:14, fontSize:'0.92rem', fontWeight:600, cursor:'pointer', transition:'background 0.2s' }}
        >
          {added ? "✓ Savatga qo'shildi!" : "🛒 Savatga qo'shish"}
        </button>
      </div>
    </div>
  )
}

// ─── PRODUCTS (catalog.json dan) ─────────────────────────────────
function Products({ onAddToCart }) {
  const { products: catalogProducts } = catalogData
  const [startIdx, setStartIdx] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const visible = 4

  const featured = catalogProducts.filter(p => p.category === 'buket').slice(0, 8)

  const prev = () => setStartIdx(i => Math.max(0, i - 1))
  const next = () => setStartIdx(i => Math.min(featured.length - visible, i + 1))
  const closeModal = useCallback(() => setSelectedProduct(null), [])

  const formatPrice = (p) => new Intl.NumberFormat('uz-UZ').format(p) + " so'm"

  return (
    <section className="products-section">
      <div className="section-header">
        <h2 className="section-title">Mashhur Gullar</h2>
        <p className="section-sub">Mijozlarimiz eng ko'p yoqtirgan kompozitsiyalar</p>
      </div>
      <div className="products-carousel-wrap">
        <button className="carousel-btn" onClick={prev} disabled={startIdx === 0}>‹</button>
        <div className="products-grid">
          {featured.slice(startIdx, startIdx + visible).map(product => {
            const colors = CAT_COLORS[product.imgClass] || { bg:'#FFF1F2', stroke:'#F43F5E' }
            return (
              <div key={product.id} className="product-card" onClick={() => setSelectedProduct(product)} style={{ cursor:'pointer' }}>
                <div className="product-img-wrap" style={{ background: colors.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="product-img" />
                  ) : (
                    <span style={{ color: colors.stroke, opacity:0.8, transition:'transform 0.2s' }}>
                      <FlowerTypeIcon type={product.type} size={52} />
                    </span>
                  )}
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                </div>
                <div className="product-body">
                  <p style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color: colors.stroke, marginBottom:3 }}>{product.type}</p>
                  <h3 className="product-name">{product.name}</h3>
                  <p style={{ fontSize:'0.74rem', color:'#9e8c84', lineHeight:1.45, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{product.desc}</p>
                  <div className="product-footer">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    <button
                      className="btn-cart"
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(product) }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 6h18l-2 9H5L3 6z"/><path d="M8 6V5a4 4 0 0 1 8 0v1"/>
                        <circle cx="9" cy="19" r="1.2" fill="currentColor" stroke="none"/>
                        <circle cx="15" cy="19" r="1.2" fill="currentColor" stroke="none"/>
                      </svg>
                      Savatga
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <button className="carousel-btn" onClick={next} disabled={startIdx >= featured.length - visible}>›</button>
      </div>

      {selectedProduct && (
        <HomeProductModal
          product={selectedProduct}
          onClose={closeModal}
          onAdd={onAddToCart}
        />
      )}
    </section>
  )
}

function HowItWorks() {
  const { steps } = data
  return (
    <section className="hiw-section">
      <div className="section-header">
        <h2 className="section-title">Qanday Ishlaydi?</h2>
        <p className="section-sub">Uch oddiy qadam — va gullar eshigingizda</p>
      </div>
      <div className="hiw-steps">
        {steps.map((step, idx) => (
          <div key={step.id} className="hiw-step">
            <div className="hiw-icon-wrap">
              <div className="hiw-icon-bg" />
              <div className="hiw-icon-circle">
                <span className="hiw-icon">{StepIcons[step.id]}</span>
              </div>
              <span className="hiw-num">{step.id}</span>
              {idx < steps.length - 1 && <div className="hiw-line" />}
            </div>
            <h3 className="hiw-title">{step.title}</h3>
            <p className="hiw-desc">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function HomePage({ onAddToCart }) {
  return (
    <main>
      <Hero />
      <Collections />
      <Products onAddToCart={onAddToCart} />
      <HowItWorks />
    </main>
  )
}

// ─── APP ROOT ────────────────────────────────────────────────────
function AppLayout() {
  const { likedIds, toggleLike } = useLiked()
  const { cartItems, addToCart, removeFromCart, updateQty, clearCart, cartCount } = useCart()

  return (
    <div className="app">
      <Navbar likedCount={likedIds.length} cartCount={cartCount} />
      <Routes>
        <Route path="/"        element={<HomePage onAddToCart={addToCart} />} />
        <Route path="/catalog" element={<Catalog likedIds={likedIds} onToggleLike={toggleLike} onAddToCart={addToCart} />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/liked"   element={<Liked likedIds={likedIds} onUnlike={toggleLike} />} />
        <Route path="/cart"     element={<Cart cartItems={cartItems} onRemove={removeFromCart} onUpdateQty={updateQty} onClearCart={clearCart} />} />
        <Route path="/checkout" element={<Checkout cartItems={cartItems} onClearCart={clearCart} />} />
        <Route path="/admin"    element={<Admin />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}