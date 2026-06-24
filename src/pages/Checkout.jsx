import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import './Checkout.css'

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
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    )
  }
  return <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{emoji}</span>
}

// ─── INPUT COMPONENT ─────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: '0.7rem', color: '#e05c6a', marginTop: -2 }}>{error}</span>
      )}
    </div>
  )
}

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '11px 14px',
  borderRadius: 12,
  border: `1.5px solid ${hasError ? '#e05c6a' : 'var(--cream-dark)'}`,
  fontSize: '0.88rem',
  color: 'var(--text)',
  background: 'var(--white)',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
})

// ─── SUCCESS SCREEN ──────────────────────────────────────────────
function SuccessScreen({ orderNumber, onNewOrder }) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 2rem',
      animation: 'fadeInUp 0.4s ease'
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Animated checkmark */}
      <div style={{
        width: 90, height: 90, borderRadius: '50%',
        background: 'linear-gradient(135deg, #c4848a, #e8b4b8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem',
        animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both',
        boxShadow: '0 8px 32px rgba(196,132,138,0.35)'
      }}>
        <svg width="40" height="40" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <p style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: 'var(--pink)', fontWeight: 600, marginBottom: '0.5rem' }}>
        BUYURTMA QABUL QILINDI
      </p>
      <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.6rem' }}>
        Rahmat! 🌸
      </h2>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.4rem', maxWidth: 340, lineHeight: 1.6 }}>
        Buyurtmangiz muvaffaqiyatli qabul qilindi. Tez orada operatorimiz siz bilan bog'lanadi.
      </p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Buyurtma raqami: <strong style={{ color: 'var(--pink)' }}>#{orderNumber}</strong>
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/catalog" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '12px 28px', borderRadius: 14,
            background: 'var(--pink)', color: '#fff',
            border: 'none', fontSize: '0.88rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Xaridni davom ettirish
          </button>
        </Link>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '12px 28px', borderRadius: 14,
            background: 'transparent', color: 'var(--text-muted)',
            border: '1.5px solid var(--cream-dark)', fontSize: '0.88rem',
            fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Bosh sahifa
          </button>
        </Link>
      </div>
    </div>
  )
}

// ─── CHECKOUT PAGE ───────────────────────────────────────────────
export default function Checkout({ cartItems, onClearCart }) {
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0)
  const orderNumber = Math.floor(100000 + Math.random() * 900000)

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    delivery: '',         // 'yes' | 'no' | ''
    address: '',
    payment: '',          // 'cash' | 'card' | ''
    note: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  // Validation
  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Ism kiritilmagan'
    if (!form.lastName.trim())  e.lastName  = 'Familya kiritilmagan'
    const rawPhone = form.phone.replace(/\D/g, '')
    if (rawPhone.length < 9)    e.phone     = 'Telefon raqam to\'liq emas'
    if (!form.payment)          e.payment   = 'To\'lov usulini tanlang'
    if (form.delivery === 'yes' && !form.address.trim()) e.address = 'Manzil kiritilmagan'
    return e
  }

  // ── Telegram sozlamalari ──────────────────────────────────────
  const TELEGRAM_BOT_TOKEN = '8607230995:AAGpf3a4_5xiiT0E64tui0QuvmYmalY0Mm8'
  const TELEGRAM_CHAT_ID   = 'CHAT_ID_NI_SHU_YERGA_QO\'YING'

  const sendTelegramMessage = async (orderNum) => {
    const deliveryText =
      form.delivery === 'yes' ? `🚚 Yetkazib berish\n📍 Manzil: ${form.address}` :
      form.delivery === 'no'  ? '🏪 Olib ketadi'  : '❓ Tanlanmagan'

    const paymentText =
      form.payment === 'cash' ? '💵 Naqd pul' :
      form.payment === 'card' ? '💳 Plastik karta' : '❓ Tanlanmagan'

    const itemsText = cartItems
      .map(i => `  • ${i.name} × ${i.qty} = ${formatPrice(i.price * i.qty)}`)
      .join('\n')

    const message = [
      `🌸 *YANGI BUYURTMA #${orderNum}*`,
      ``,
      `👤 *Mijoz:* ${form.firstName} ${form.lastName}`,
      `📞 *Telefon:* +998${form.phone}`,
      ``,
      `🛒 *Mahsulotlar:*`,
      itemsText,
      ``,
      `💰 *Jami:* ${formatPrice(cartItems.reduce((s, i) => s + i.price * i.qty, 0))}`,
      ``,
      deliveryText,
      `💳 *To'lov:* ${paymentText}`,
      form.note ? `\n📝 *Izoh:* ${form.note}` : '',
    ].filter(Boolean).join('\n')

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      })
    } catch (err) {
      console.error('Telegram xabar yuborishda xato:', err)
    }
  }

  const saveOrderToSupabase = async (orderNum) => {
    const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0)
    const totalQty = cartItems.reduce((s, i) => s + i.qty, 0)
    try {
      await supabase.from('orders').insert({
        order_number: orderNum,
        customer_name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone.replace(/\D/g, ''),
        items: cartItems.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          emoji: i.emoji || '🌸',
        })),
        total_price: total,
        total_qty: totalQty,
        delivery: form.delivery,
        address: form.address || null,
        payment: form.payment,
        note: form.note || null,
        status: 'new',
      })
    } catch (err) {
      console.error('Supabase order save error:', err)
    }
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    await sendTelegramMessage(orderNumber)
    await saveOrderToSupabase(orderNumber)
    setSubmitted(true)
    onClearCart()
  }

  // Phone formatter
  const handlePhone = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 9)
    let formatted = digits
    if (digits.length > 2)  formatted = digits.slice(0,2) + ' ' + digits.slice(2)
    if (digits.length > 5)  formatted = digits.slice(0,2) + ' ' + digits.slice(2,5) + ' ' + digits.slice(5)
    if (digits.length > 7)  formatted = digits.slice(0,2) + ' ' + digits.slice(2,5) + ' ' + digits.slice(5,7) + ' ' + digits.slice(7)
    set('phone', formatted)
  }

  if (submitted) {
    return <SuccessScreen orderNumber={orderNumber} />
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
        <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>Savat bo'sh</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Avval katalogdan gul tanlang</p>
        <Link to="/catalog" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '11px 26px', borderRadius: 12, background: 'var(--pink)', color: '#fff', border: 'none', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Katalogga o'tish
          </button>
        </Link>
      </div>
    )
  }

  const sectionCard = { background: 'var(--white)', borderRadius: 18, padding: '1.5rem', boxShadow: '0 2px 14px rgba(0,0,0,0.05)', marginBottom: '1rem' }
  const sectionTitle = { fontFamily: 'Montserrat, sans-serif', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }

  const radioCard = (active, hasError) => ({
    flex: 1, padding: '12px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
    border: `1.5px solid ${hasError ? '#e05c6a' : active ? 'var(--pink)' : 'var(--cream-dark)'}`,
    background: active ? 'var(--pink-pale)' : 'var(--white)',
    display: 'flex', alignItems: 'center', gap: 8
  })

  return (
    <main className="checkout-page-main">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', color: 'var(--pink)', fontWeight: 600, marginBottom: '0.4rem' }}>
          RASMIYLASHTIRISH
        </p>
        <h1 className="checkout-header-title" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem', fontWeight: 600, color: 'var(--text)' }}>
          Buyurtma berish
        </h1>
      </div>

      <div className="checkout-layout">

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* 1. Shaxsiy ma'lumotlar */}
          <div style={sectionCard}>
            <p style={sectionTitle}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--pink-pale)', color: 'var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1</span>
              Shaxsiy ma'lumotlar
            </p>
            <div className="checkout-name-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '0.9rem' }}>
              <Field label="ISM *" error={errors.firstName}>
                <input
                  className="checkout-input"
                  style={inputStyle(errors.firstName)}
                  placeholder="Asilbek"
                  value={form.firstName}
                  onChange={e => set('firstName', e.target.value)}
                />
              </Field>
              <Field label="FAMILYA *" error={errors.lastName}>
                <input
                  className="checkout-input"
                  style={inputStyle(errors.lastName)}
                  placeholder="Karimov"
                  value={form.lastName}
                  onChange={e => set('lastName', e.target.value)}
                />
              </Field>
            </div>
            <Field label="TELEFON RAQAM *" error={errors.phone}>
              <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${errors.phone ? '#e05c6a' : 'var(--cream-dark)'}`, borderRadius: 12, overflow: 'hidden', background: 'var(--white)', transition: 'border-color 0.15s' }}
                onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--pink)'}
                onBlurCapture={e => e.currentTarget.style.borderColor = errors.phone ? '#e05c6a' : 'var(--cream-dark)'}
              >
                <span style={{ padding: '11px 12px 11px 14px', fontSize: '0.88rem', color: 'var(--text)', fontWeight: 600, background: 'var(--cream)', borderRight: '1.5px solid var(--cream-dark)', whiteSpace: 'nowrap', userSelect: 'none' }}>
                  🇺🇿 +998
                </span>
                <input
                  className="checkout-input"
                  style={{ border: 'none', outline: 'none', padding: '11px 14px', fontSize: '0.88rem', color: 'var(--text)', background: 'transparent', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
                  placeholder="90 123 45 67"
                  value={form.phone}
                  onChange={e => handlePhone(e.target.value)}
                  inputMode="numeric"
                />
              </div>
            </Field>
          </div>

          {/* 2. Yetkazib berish */}
          <div style={sectionCard}>
            <p style={sectionTitle}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--pink-pale)', color: 'var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</span>
              Yetkazib berish
            </p>

            <div className="checkout-radio-row" style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.9rem' }}>
              {[
                { val: 'yes', icon: '🚚', label: 'Yetkazib berish', sub: 'Manzilingizga' },
                { val: 'no',  icon: '🏪', label: 'Olib ketaman',    sub: 'Do\'kondan' },
              ].map(opt => (
                <div
                  key={opt.val}
                  style={radioCard(form.delivery === opt.val, false)}
                  onClick={() => set('delivery', opt.val)}
                >
                  <span style={{ fontSize: '1.2rem' }}>{opt.icon}</span>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{opt.label}</p>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: 0 }}>{opt.sub}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', border: `2px solid ${form.delivery === opt.val ? 'var(--pink)' : 'var(--cream-dark)'}`, background: form.delivery === opt.val ? 'var(--pink)' : 'transparent', transition: 'all 0.15s', flexShrink: 0 }} />
                </div>
              ))}
            </div>

            {/* Manzil — faqat yetkazib berish tanlanganda */}
            {form.delivery === 'yes' && (
              <Field label="MANZIL *" error={errors.address}>
                <input
                  className="checkout-input"
                  style={inputStyle(errors.address)}
                  placeholder="Toshkent sh., Yunusobod tumani, ..."
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                />
              </Field>
            )}

            {form.delivery === '' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                Ixtiyoriy — tanlasangiz ham bo'ladi
              </p>
            )}
          </div>

          {/* 3. To'lov usuli */}
          <div style={sectionCard}>
            <p style={sectionTitle}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--pink-pale)', color: 'var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>3</span>
              To'lov usuli *
            </p>
            <div className="checkout-radio-row" style={{ display: 'flex', gap: '0.6rem', marginBottom: errors.payment ? '0.4rem' : 0 }}>
              {[
                { val: 'cash', icon: '💵', label: 'Naqd pul', sub: 'Yetkazib berishda' },
                { val: 'card', icon: '💳', label: 'Plastik karta', sub: 'Uzcard / Humo' },
              ].map(opt => (
                <div
                  key={opt.val}
                  style={radioCard(form.payment === opt.val, !!errors.payment)}
                  onClick={() => set('payment', opt.val)}
                >
                  <span style={{ fontSize: '1.2rem' }}>{opt.icon}</span>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{opt.label}</p>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: 0 }}>{opt.sub}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', border: `2px solid ${form.payment === opt.val ? 'var(--pink)' : errors.payment ? '#e05c6a' : 'var(--cream-dark)'}`, background: form.payment === opt.val ? 'var(--pink)' : 'transparent', transition: 'all 0.15s', flexShrink: 0 }} />
                </div>
              ))}
            </div>
            {errors.payment && <p style={{ fontSize: '0.7rem', color: '#e05c6a', margin: '4px 0 0' }}>{errors.payment}</p>}
          </div>

          {/* 4. Izoh */}
          <div style={sectionCard}>
            <p style={sectionTitle}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--pink-pale)', color: 'var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>4</span>
              Qo'shimcha izoh
            </p>
            <textarea
              className="checkout-textarea"
              style={{ ...inputStyle(false), resize: 'vertical', minHeight: 90, lineHeight: 1.6 }}
              placeholder="Masalan: qo'ngiroq qilmang — SMS yuboring, 3-qavatga olib chiqing, atirgullar qizil bo'lsin..."
              value={form.note}
              onChange={e => set('note', e.target.value)}
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN — Order summary ── */}
        <div className="checkout-right">
          <div style={{ background: 'var(--white)', borderRadius: 18, padding: '1.4rem', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', marginBottom: '1rem' }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
              Buyurtma ({cartItems.reduce((s, i) => s + i.qty, 0)} ta)
            </p>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FlowerImg src={item.imageUrl} alt={item.name} emoji={item.emoji} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{item.qty} × {formatPrice(item.price)}</p>
                  </div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', flexShrink: 0, margin: 0 }}>{formatPrice(item.price * item.qty)}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--cream-dark)', paddingTop: '0.9rem', marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                <span>Mahsulotlar</span><span>{formatPrice(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Yetkazib berish</span>
                <span style={{ color: '#6a9e5a', fontWeight: 600 }}>
                  {form.delivery === 'yes' ? 'Bepul' : form.delivery === 'no' ? '—' : 'Bepul'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>Jami</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--pink)' }}>{formatPrice(total)}</span>
            </div>

            <button
              onClick={handleSubmit}
              style={{
                width: '100%', padding: '13px',
                background: 'var(--pink)', color: '#fff',
                border: 'none', borderRadius: 14,
                fontSize: '0.92rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.2s, transform 0.1s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#b07278'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--pink)'}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Buyurtmani tasdiqlash →
            </button>

            <Link to="/cart" style={{ textDecoration: 'none', display: 'block', marginTop: '0.65rem' }}>
              <button style={{
                width: '100%', padding: '10px',
                background: 'transparent', color: 'var(--text-muted)',
                border: '1px solid var(--cream-dark)', borderRadius: 14,
                fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit'
              }}>
                ← Savatga qaytish
              </button>
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { icon: '🔒', text: 'Ma\'lumotlaringiz himoyalangan' },
              { icon: '🌸', text: 'Yangi va sifatli gullar kafolati' },
              { icon: '📞', text: 'Operator 5 daqiqada bog\'lanadi' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.95rem' }}>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}