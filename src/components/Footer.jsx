export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <div className="navbar-logo">
            <span className="logo-icon">✿</span>
            <div className="logo-text">
              <span className="logo-name">Gala Flowers</span>
              <span className="logo-sub">GUL DO'KONI</span>
            </div>
          </div>
          <p className="footer-desc">
            Har bir lahza uchun eng yangi va chiroyli gul kompozitsiyalari.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Katalog</h4>
          <ul className="footer-links">
            <li><a href="#">Buketlar</a></li>
            <li><a href="#">Kompozitsiyalar</a></li>
            <li><a href="#">Sovg'alar</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Kompaniya</h4>
          <ul className="footer-links">
            <li><a href="#">Biz haqimizda</a></li>
            <li><a href="#">Bog'lanish</a></li>
            <li><a href="#">Yetkazib berish</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Bog'lanish</h4>
          <ul className="footer-links">
            <li>+998 90 123 45 67</li>
            <li>info@galaflowers.uz</li>
            <li>Toshkent, O'zbekiston</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Gala Flowers. Barcha huquqlar himoyalangan.</span>
      </div>
    </footer>
  )
}