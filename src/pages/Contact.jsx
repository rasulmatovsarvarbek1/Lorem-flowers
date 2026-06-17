import { useState } from 'react'
import './Contact.css'

// ─── ICONS ──────────────────────────────────────────────────────
function Icon({ name }) {
  const c = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none' }
  switch (name) {
    case 'phone':
      return (
        <svg {...c} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.5 2.4.8 3.6.9.6 0 1 .5 1 1v3.4c0 .6-.4 1-1 1C10.5 21.3 2.7 13.5 2.7 4.1c0-.6.4-1 1-1H7c.6 0 1 .4 1 1 .1 1.3.4 2.5.9 3.6.1.4 0 .8-.2 1L6.6 10.8z" />
        </svg>
      )
    case 'telegram':
      return (
        <svg {...c} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 4.5 2.7 11.6c-.7.3-.7 1.3.1 1.5l4.5 1.4 1.7 5.3c.2.7 1.1.9 1.6.3l2.5-2.7 4.6 3.4c.6.5 1.5.1 1.6-.6l2.5-14.4c.1-.8-.7-1.4-1.4-1.3z" />
          <path d="M7.3 14.5l9.4-7.8" />
        </svg>
      )
    case 'email':
      return (
        <svg {...c} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5.5" width="18" height="13" rx="2" />
          <path d="M3.5 6.5 12 13l8.5-6.5" />
        </svg>
      )
    case 'location':
      return (
        <svg {...c} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.3" />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...c} stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...c} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
          <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
          <path d="M10.5 9.5v5l4.3-2.5z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'chevron':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      )
    default:
      return null
  }
}

// ─── DATA ────────────────────────────────────────────────────────
const contactCards = [
  {
    key: 'phone',
    color: 'peach',
    title: 'Telefon',
    lines: ['+998 (90) 123-45-67', '+998 (71) 123-45-67'],
    note: 'Har kuni 09:00 — 19:00',
  },
  {
    key: 'telegram',
    color: 'blue',
    title: 'Telegram',
    lines: ['@Flowers'],
    note: 'Tez javob beramiz',
  },
  {
    key: 'email',
    color: 'pink',
    title: 'Email',
    lines: ['info@Flowers.uz'],
    note: '24 soat ichida javob',
  },
  {
    key: 'location',
    color: 'green',
    title: 'Manzil',
    lines: [" Lorem tumani", "Lorem ipsum ko'chasi, 14-uy"],
    note: 'Showroom mavjud',
  },
]

const socialLinks = [
  { key: 'telegram',  name: 'Telegram',  href: 'https://t.me/saidmurodow' },
  { key: 'instagram', name: 'Instagram', href: 'https://t.me/saidmurodow' },
  { key: 'youtube',   name: 'YouTube',   href: 'https://t.me/saidmurodow' },
]
const faqs = [
  {
    q: 'Gullar qancha vaqt yangi qoladi?',
    a: "Bizning barcha gul kompozitsiyalari yuqori sifatli toza suvda saqlanadi. Kesilgan gullar to'g'ri parvarishda 5–10 kun yangiligini saqlaydi. Har kuni suv almashtiring va poyasini qirqib turing.",
  },
  {
    q: 'Buketni o\'z dizaynimdа buyurtma qila olamanmi?',
    a: "Ha, albatta! Siz rangini, gul turini, buket hajmini va qadoqlash uslubini o'zingiz tanlashingiz mumkin. Telegram yoki telefon orqali mutaxassisimiz bilan maslahatlashing.",
  },
  {
    q: 'Yetkazib berish Toshkent ichida bepulmi?',
    a: "150 000 so'mdan yuqori buyurtmalarda Toshkent shahri bo'ylab yetkazib berish bepul. Undan past buyurtmalarda yetkazib berish narxi 15 000–25 000 so'm.",
  },
  {
    q: 'Qancha vaqt oldindan buyurtma berish kerak?',
    a: "Oddiy buketlar uchun 2–3 soat oldin buyurtma bering. Katta tantanalar yoki maxsus kompozitsiyalar uchun kamida 1 kun oldin xabar bering — sifat kafolatlansin deb.",
  },
  {
    q: 'Gullar so\'lib qolsa nima qilaman?',
    a: "Barcha buyurtmalarimizga 24 soatlik sifat kafolati beriladi. Agar gullar muddatidan oldin so'lib qolsa, bizga fotosurat yuboring — tekin yangi buket yuboramiz.",
  },
  {
    q: "To'lov usullari qanday?",
    a: "Click, Payme, bank kartasi yoki naqd pul bilan to'lashingiz mumkin. Yetkazib berish paytida ham to'lov qabul qilinadi.",
  },
]

// ─── PAGE ────────────────────────────────────────────────────────
export default function Contact() {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <main className="contact-page">

      {/* PAGE INTRO */}
      <div className="contact-intro">
        <div className="contact-intro-left">
          <p className="contact-eyebrow">
            <span />
            Bog'lanish
          </p>
          <h1 className="contact-page-title">
            Biz doim<br />
            <em>yordamga</em> tayyormiz
          </h1>
        </div>
        <p className="contact-intro-sub">
          Savol, buyurtma yoki maxsus taklif bo'lsa — qulay usulda murojaat qiling. Javob berish vaqtimiz: <strong>09:00 – 19:00</strong>.
        </p>
      </div>

      {/* CONTACT CARDS */}
      <section className="contact-info-section">
        <div className="contact-info-grid">
          {contactCards.map(card => (
            <div className="contact-card" key={card.key}>
              <div className={`contact-card-icon icon-${card.color}`}>
                <Icon name={card.key} />
              </div>
              <h3 className="contact-card-title">{card.title}</h3>
              {card.lines.map((line, i) => (
                <p className="contact-card-line" key={i}>{line}</p>
              ))}
              <p className="contact-card-note">{card.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL */}
      <section className="contact-social-section">
        <div className="contact-social">
          <span className="contact-social-label">Ijtimoiy tarmoqlar</span>
          <div className="contact-social-links">
            {socialLinks.map(s => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="contact-social-btn"
              >
                <span className={`contact-social-icon icon-${s.key}`}>
                  <Icon name={s.key} />
                </span>
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="contact-faq-section">
        <div className="contact-faq">

          {/* Sidebar */}
          <div className="contact-faq-sidebar">
            <p className="contact-faq-sidebar-eyebrow">Ko'p so'raladigan savollar</p>
            <h2 className="contact-faq-sidebar-title">
              Savol<br />bo'lsa <em>shu yerda</em>
            </h2>
            <p className="contact-faq-sidebar-desc">
              Eng ko'p beriladigan savollarni to'pladik. Javob topa olmagan bo'lsangiz — to'g'ridan-to'g'ri bog'laning.
            </p>
            <span className="contact-faq-sidebar-flower">🌷</span>
          </div>

          {/* Accordion list */}
          <div className="contact-faq-list">
            {faqs.map((item, idx) => {
              const isOpen = openIdx === idx
              return (
                <div className={`contact-faq-item${isOpen ? ' open' : ''}`} key={idx}>
                  <button
                    className="contact-faq-question"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="contact-faq-question-text">{item.q}</span>
                    <span className="contact-faq-chevron">
                      <Icon name="chevron" />
                    </span>
                  </button>
                  <div className="contact-faq-answer-wrap">
                    <p className="contact-faq-answer">{item.a}</p>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

    </main>
  )
}