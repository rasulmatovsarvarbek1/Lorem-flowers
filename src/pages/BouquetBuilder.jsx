import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Loader from '../components/Loader'
import './BouquetBuilder.css'

function formatPrice(price) {
  return new Intl.NumberFormat('uz-UZ').format(price) + " so'm"
}

function FlowerImg({ src, alt, emoji }) {
  const [err, setErr] = useState(false)
  if (src && !err) {
    return (
      <img
        src={src} alt={alt}
        onError={() => setErr(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 10 }}
      />
    )
  }
  return <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{emoji || '🌸'}</span>
}

// ─── STEP INDICATOR ─────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Gullar', "O'rash", 'Izoh', 'Tasdiqlash']
  return (
    <div className="bb-steps">
      {steps.map((label, idx) => {
        const num = idx + 1
        const done = step > num
        const active = step === num
        return (
          <div key={label} className="bb-step-wrap">
            <div className={`bb-step-item ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
              <div className="bb-step-num">
                {done ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : num}
              </div>
              <span className="bb-step-label">{label}</span>
            </div>
            {idx < steps.length - 1 && <div className={`bb-step-line ${done ? 'done' : ''}`} />}
          </div>
        )
      })}
    </div>
  )
}

// ─── STEP 1: GUL TANLASH ────────────────────────────────────────
function Step1Flowers({ flowers, selected, onChange }) {
  return (
    <div className="bb-section">
      <p className="bb-section-title">Gullarni tanlang va miqdorini belgilang</p>
      <div className="bb-flowers-grid">
        {flowers.map(flower => {
          const sel = selected.find(s => s.id === flower.id)
          const qty = sel ? sel.qty : 0
          return (
            <div key={flower.id} className={`bb-flower-card ${qty > 0 ? 'selected' : ''}`}>
              <div className="bb-flower-img">
                <FlowerImg src={flower.imageUrl} alt={flower.name} emoji={flower.emoji} />
              </div>
              <div className="bb-flower-body">
                <p className="bb-flower-name">{flower.name}</p>
                <p className="bb-flower-price">{formatPrice(flower.price)} / dona</p>
                {qty === 0 ? (
                  <button
                    className="bb-add-btn"
                    onClick={() => onChange(flower, 1)}
                  >
                    + Qo'shish
                  </button>
                ) : (
                  <div className="bb-qty-row">
                    <button className="bb-qty-btn" onClick={() => onChange(flower, qty - 1)}>−</button>
                    <span className="bb-qty-val">{qty}</span>
                    <button className="bb-qty-btn" onClick={() => onChange(flower, qty + 1)}>+</button>
                    <span className="bb-qty-sum">{formatPrice(flower.price * qty)}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {flowers.length === 0 && (
        <div className="bb-empty">
          <span>🌿</span>
          <p>Gullar yuklanmoqda...</p>
        </div>
      )}
    </div>
  )
}

// ─── STEP 2: O'RASH TURI VA TANLASH ─────────────────────────────
function Step2Wrapping({ wrapType, onWrapTypeChange, papers, baskets, selected, onChange }) {
  const list = wrapType === 'basket' ? baskets : papers

  const handlePick = (item) => {
    onChange(selected?.id === item.id ? null : item)
  }

  const toggleBtnStyle = (active) => ({
    flex: 1,
    padding: '12px 10px',
    borderRadius: 14,
    border: active ? '2px solid var(--pink)' : '1.5px solid var(--cream-dark, #e8d8d8)',
    background: active ? 'var(--pink-pale, #fdeef0)' : '#fff',
    color: active ? 'var(--pink)' : '#7a7a7a',
    fontWeight: 700,
    fontSize: '0.92rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'inherit',
    transition: 'all .15s',
  })

  return (
    <div className="bb-section">
      <p className="bb-section-title">O'rash turini tanlang</p>

      {/* Qog'oz / Savatcha tanlash */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.1rem' }}>
        <button type="button" style={toggleBtnStyle(wrapType === 'paper')} onClick={() => onWrapTypeChange('paper')}>
          <span style={{ fontSize: '1.2rem' }}>📦</span> Qog'oz
        </button>
        <button type="button" style={toggleBtnStyle(wrapType === 'basket')} onClick={() => onWrapTypeChange('basket')}>
          <span style={{ fontSize: '1.2rem' }}>🧺</span> Savatcha
        </button>
      </div>

      <div className="bb-paper-grid">
        {list.map(item => (
          <button
            key={item.id}
            className={`bb-paper-card ${selected?.id === item.id ? 'selected' : ''}`}
            onClick={() => handlePick(item)}
          >
            {/* Rasm yoki rang */}
            {item.imageUrl ? (
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', marginBottom: 6, position: 'relative' }}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.parentNode.style.background = item.color || '#e8c4c4'
                  }}
                />
              </div>
            ) : (
              <div
                className="bb-paper-color"
                style={{ background: item.color || '#e8c4c4' }}
              />
            )}
            <p className="bb-paper-name">{item.name}</p>
            <p className="bb-paper-price">{formatPrice(item.price)}</p>
            {selected?.id === item.id && (
              <span className="bb-paper-check">✓</span>
            )}
          </button>
        ))}
      </div>
      {list.length === 0 && (
        <div className="bb-empty">
          <span>{wrapType === 'basket' ? '🧺' : '📦'}</span>
          <p>{wrapType === 'basket' ? 'Savatchalar topilmadi' : "Qog'ozlar topilmadi"}</p>
        </div>
      )}
      <p className="bb-note-hint" style={{ marginTop: '0.75rem' }}>O'rash ixtiyoriy — xohlasangiz keyingi qadamga o'tib davom etishingiz mumkin</p>
    </div>
  )
}

// ─── STEP 3: IZOH ───────────────────────────────────────────────
function Step3Note({ note, onChange }) {
  return (
    <div className="bb-section">
      <p className="bb-section-title">Qo'shimcha izoh (ixtiyoriy)</p>
      <textarea
        className="bb-textarea"
        rows={4}
        placeholder="Masalan: lentani pushti rangda bog'lang, sovg'a uchun qutiga soling, 8-qavatga olib chiqing..."
        value={note}
        onChange={e => onChange(e.target.value)}
      />
      <p className="bb-note-hint">Admin bu izohni ko'radi va buketni shunga qarab tayyorlaydi</p>
    </div>
  )
}

// ─── STEP 4: TASDIQLASH ─────────────────────────────────────────
function Step4Confirm({ flowers, paper, note }) {
  const flowersTotal = flowers.reduce((s, f) => s + f.price * f.qty, 0)
  const paperPrice = paper ? paper.price : 0
  const total = flowersTotal + paperPrice
  const isBasket = paper?.category === 'savatcha'

  return (
    <div className="bb-section">
      <p className="bb-section-title">Buket tarkibi</p>

      <div className="bb-confirm-list">
        <p className="bb-confirm-subtitle">🌸 Gullar</p>
        {flowers.map(f => (
          <div key={f.id} className="bb-confirm-row">
            <div className="bb-confirm-left">
              <div className="bb-confirm-img">
                <FlowerImg src={f.imageUrl} alt={f.name} emoji={f.emoji} />
              </div>
              <div>
                <p className="bb-confirm-name">{f.name}</p>
                <p className="bb-confirm-sub">{f.qty} × {formatPrice(f.price)}</p>
              </div>
            </div>
            <p className="bb-confirm-price">{formatPrice(f.price * f.qty)}</p>
          </div>
        ))}

        {paper && (
          <>
            <p className="bb-confirm-subtitle" style={{ marginTop: '1rem' }}>{isBasket ? '🧺 Savatcha' : "📦 Qog'oz"}</p>
            <div className="bb-confirm-row">
              <div className="bb-confirm-left">
                <div className="bb-confirm-paper-dot" style={{ background: paper.color || '#e8c4c4' }} />
                <p className="bb-confirm-name">{paper.name}</p>
              </div>
              <p className="bb-confirm-price">{formatPrice(paper.price)}</p>
            </div>
          </>
        )}

        {note && (
          <>
            <p className="bb-confirm-subtitle" style={{ marginTop: '1rem' }}>📝 Izoh</p>
            <p className="bb-confirm-note">{note}</p>
          </>
        )}

        <div className="bb-confirm-total">
          <span>Jami</span>
          <span className="bb-confirm-total-price">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function BouquetBuilder({ onAddToCart }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)

  // Ma'lumotlar
  const [flowers, setFlowers] = useState([])   // donalik mahsulotlar
  const [papers, setPapers] = useState([])     // qog'ozlar (static yoki supabase)
  const [baskets, setBaskets] = useState([])   // savatchalar (static yoki supabase)

  // Tanlangan qiymatlar
  const [selectedFlowers, setSelectedFlowers] = useState([])  // [{...flower, qty}]
  const [wrapType, setWrapType] = useState('paper')  // 'paper' | 'basket'
  const [selectedPaper, setSelectedPaper] = useState(null)    // tanlangan qog'oz YOKI savatcha
  const [note, setNote] = useState('')
  const [added, setAdded] = useState(false)

  // Supabase'dan donali gullarni yuklash
  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'donalik')
        .order('id', { ascending: false })

      if (data && data.length > 0) {
        setFlowers(data)
      } else {
        // Static fallback — donalik mahsulotlar yo'q bo'lsa
        setFlowers([
          { id: 'f1', name: 'Qizil atirgul', emoji: '🌹', price: 12000, imageUrl: '' },
          { id: 'f2', name: 'Pion',           emoji: '🌸', price: 18000, imageUrl: '' },
          { id: 'f3', name: 'Lola',           emoji: '🌷', price: 8000,  imageUrl: '' },
          { id: 'f4', name: 'Nargiz',         emoji: '🌼', price: 9000,  imageUrl: '' },
          { id: 'f5', name: 'Kungaboqar',     emoji: '🌻', price: 9500,  imageUrl: '' },
          { id: 'f6', name: 'Gilos guli',     emoji: '🌺', price: 7000,  imageUrl: '' },
        ])
      }

      // Qog'ozlar — products jadvalidagi 'qogoz' kategoriyasi yoki static
      const { data: paperData } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'qogoz')
        .order('id', { ascending: true })

      if (paperData && paperData.length > 0) {
        setPapers(paperData)
      } else {
        // Static fallback qog'ozlar
        setPapers([
          { id: 'p1', name: 'Atirgul rang', color: '#f4c0c0', price: 8000, category: 'qogoz' },
          { id: 'p2', name: "Ko'k kraft",   color: '#b5c8e8', price: 6000, category: 'qogoz' },
          { id: 'p3', name: 'Kremrang',     color: '#e8e4c0', price: 7000, category: 'qogoz' },
          { id: 'p4', name: 'Yashil kraft', color: '#b5e8b8', price: 6000, category: 'qogoz' },
          { id: 'p5', name: 'Qora kraft',   color: '#3a3a3a', price: 9000, category: 'qogoz' },
          { id: 'p6', name: 'Sariq',        color: '#f5e6a0', price: 6500, category: 'qogoz' },
        ])
      }

      // Savatchalar — products jadvalidagi 'savatcha' kategoriyasi yoki static
      const { data: basketData } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'savatcha')
        .order('id', { ascending: true })

      if (basketData && basketData.length > 0) {
        setBaskets(basketData)
      } else {
        // Static fallback savatchalar
        setBaskets([
          { id: 'b1', name: "Yog'och savatcha",  color: '#c9a876', price: 25000, category: 'savatcha' },
          { id: 'b2', name: 'Pushti savatcha',    color: '#f0c4d0', price: 22000, category: 'savatcha' },
          { id: 'b3', name: 'Oq to\'r savatcha',  color: '#f5f0e8', price: 20000, category: 'savatcha' },
        ])
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  // Gul miqdorini o'zgartirish
  const handleFlowerChange = (flower, qty) => {
    if (qty <= 0) {
      setSelectedFlowers(prev => prev.filter(f => f.id !== flower.id))
    } else {
      setSelectedFlowers(prev => {
        const exists = prev.find(f => f.id === flower.id)
        if (exists) return prev.map(f => f.id === flower.id ? { ...f, qty } : f)
        return [...prev, { ...flower, qty }]
      })
    }
  }

  const totalFlowers = selectedFlowers.reduce((s, f) => s + f.qty, 0)
  const totalPrice =
    selectedFlowers.reduce((s, f) => s + f.price * f.qty, 0) +
    (selectedPaper ? selectedPaper.price : 0)

  // Keyingi step
  const canNext = () => {
    if (step === 1) return selectedFlowers.length > 0
    if (step === 2) return true   // qog'oz ixtiyoriy
    if (step === 3) return true
    return false
  }

  const handleNext = () => {
    if (step < 4) setStep(s => s + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
    else navigate('/catalog')
  }

  // Savatga qo'shish
  const handleAddToCart = () => {
    const flowerLines = selectedFlowers
      .map(f => `${f.name} × ${f.qty}`)
      .join('\n  ')

    // Telegram uchun to'liq ma'lumot name ichida
    let bouquetName = `💐 Buket:\n  ${flowerLines}`
    if (selectedPaper) bouquetName += `\n  📦 Qog'oz: ${selectedPaper.name}`
    if (note) bouquetName += `\n  📝 Izoh: ${note}`

    // Rasmi bor birinchi gulni olish
    const firstWithImg = selectedFlowers.find(f => f.imageUrl)

    const bouquetItem = {
      id: `bouquet_${Date.now()}`,
      name: bouquetName,
      price: totalPrice,
      qty: 1,
      emoji: '💐',
      imageUrl: firstWithImg?.imageUrl || '',
      isBouquet: true,
      // Checkout va Telegram uchun strukturalashgan ma'lumot
      flowers: selectedFlowers.map(f => ({
        id: f.id,
        name: f.name,
        qty: f.qty,
        price: f.price,
        imageUrl: f.imageUrl || '',
        emoji: f.emoji || '🌸',
      })),
      wrapping: selectedPaper ? selectedPaper.name : null,
      note: note || null,
      bouquetDetails: {
        flowers: selectedFlowers.map(f => ({
          id: f.id, name: f.name, qty: f.qty, price: f.price, imageUrl: f.imageUrl,
        })),
        paper: selectedPaper,
        note,
      },
    }

    onAddToCart(bouquetItem, 1)
    setAdded(true)
    setTimeout(() => {
      navigate('/cart')
    }, 900)
  }

    if (loading) return <Loader />

  return (
    <div className="bb-page">
      {/* Header */}
      <div className="bb-header">
        <button className="bb-back-btn" onClick={handleBack}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {step === 1 ? 'Katalog' : 'Orqaga'}
        </button>
        <h1 className="bb-title">Buket yig'ish</h1>
        {totalFlowers > 0 && (
          <span className="bb-badge">{totalFlowers} dona gul</span>
        )}
      </div>

      {/* Steps */}
      <StepBar step={step} />

      {/* Content */}
      <div className="bb-content">
        {step === 1 && (
          <Step1Flowers
            flowers={flowers}
            selected={selectedFlowers}
            onChange={handleFlowerChange}
          />
        )}
        {step === 2 && (
          <Step2Wrapping
            wrapType={wrapType}
            onWrapTypeChange={(t) => { setWrapType(t); setSelectedPaper(null) }}
            papers={papers}
            baskets={baskets}
            selected={selectedPaper}
            onChange={setSelectedPaper}
          />
        )}
        {step === 3 && (
          <Step3Note note={note} onChange={setNote} />
        )}
        {step === 4 && (
          <Step4Confirm
            flowers={selectedFlowers}
            paper={selectedPaper}
            note={note}
          />
        )}
      </div>

      {/* Bottom bar */}
      <div className="bb-bottom">
        {totalPrice > 0 && (
          <div className="bb-bottom-price">
            <span className="bb-bottom-label">Jami</span>
            <span className="bb-bottom-total">{formatPrice(totalPrice)}</span>
          </div>
        )}
        <div className="bb-bottom-btns">
          {step > 1 && (
            <button className="bb-btn-secondary" onClick={handleBack}>
              ← Orqaga
            </button>
          )}
          {step < 4 ? (
            <button
              className="bb-btn-primary"
              onClick={handleNext}
              disabled={!canNext()}
            >
              {step === 3 ? 'Ko\'rib chiqish →' : 'Davom etish →'}
            </button>
          ) : (
            <button
              className={`bb-btn-primary ${added ? 'success' : ''}`}
              onClick={handleAddToCart}
              disabled={added}
            >
              {added ? "✓ Savatga qo'shildi!" : "🛒 Savatga qo'shish"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}