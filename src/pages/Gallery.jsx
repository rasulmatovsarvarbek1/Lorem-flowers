import { useState } from 'react'
import galleryData from '../data/gallery.json'
import './Gallery.css'

// ── Bitta cell ──────────────────────────────────────────
function GalleryCell({ photo }) {
  return (
    <div className="g-cell">
      <img src={photo.imageUrl} alt={photo.title} loading="lazy" />
      <div className="g-overlay">
        <div>
          <div className="g-overlay-cat">{photo.category}</div>
          <div className="g-overlay-title">{photo.title}</div>
        </div>
      </div>
    </div>
  )
}

// ── Pattern 1: katta chap + 2 kichik o'ng (3 rasm) ─────
function Pattern1({ photos }) {
  return (
    <div className="g-row p1">
      <GalleryCell photo={photos[0]} />
      <div className="g-col">
        <GalleryCell photo={photos[1]} />
        <GalleryCell photo={photos[2]} />
      </div>
    </div>
  )
}

// ── Pattern 2: 3 teng ustun (3 rasm) ───────────────────
function Pattern2({ photos }) {
  return (
    <div className="g-row p2">
      {photos.map(p => <GalleryCell key={p.id} photo={p} />)}
    </div>
  )
}

// ── Pattern 3: 2 kichik chap + katta o'ng (3 rasm) ─────
function Pattern3({ photos }) {
  return (
    <div className="g-row p3">
      <div className="g-col">
        <GalleryCell photo={photos[0]} />
        <GalleryCell photo={photos[1]} />
      </div>
      <GalleryCell photo={photos[2]} />
    </div>
  )
}

// ── Pattern 4: banner + 4 kichik — wrapper div bilan ───
// Fragment emas, bitta div ichiga olingan
function Pattern4({ photos }) {
  return (
    <div className="g-block-p4">
      <div className="g-row p4-top">
        <GalleryCell photo={photos[0]} />
      </div>
      <div className="g-row p4-bottom">
        {photos.slice(1, 5).map(p => <GalleryCell key={p.id} photo={p} />)}
      </div>
    </div>
  )
}

// ── Pattern 5: 2 katta + 2 kichik o'ngda (4 rasm) ─────
function Pattern5({ photos }) {
  return (
    <div className="g-row p5">
      <GalleryCell photo={photos[0]} />
      <GalleryCell photo={photos[1]} />
      <div className="g-col">
        <GalleryCell photo={photos[2]} />
        <GalleryCell photo={photos[3]} />
      </div>
    </div>
  )
}

// ── Pattern konfiguratsiyasi ────────────────────────────
const PATTERNS = [
  { Component: Pattern1, count: 3 },
  { Component: Pattern2, count: 3 },
  { Component: Pattern3, count: 3 },
  { Component: Pattern4, count: 5 },
  { Component: Pattern5, count: 4 },
]

// ── Rasmlarni patternga bo'lib chiqarish ────────────────
function buildMosaic(photos) {
  const blocks = []
  let i = 0
  let pi = 0

  while (i < photos.length) {
    const { Component, count } = PATTERNS[pi % PATTERNS.length]
    const chunk = photos.slice(i, i + count)
    if (chunk.length === 0) break

    const filled = [...chunk]
    while (filled.length < count) filled.push(filled[filled.length - 1])

    blocks.push({ Component, photos: filled, key: i })
    i += chunk.length
    pi++
  }

  return blocks
}

// ── Gallery sahifasi ────────────────────────────────────
export default function Gallery() {
  const { photos } = galleryData
  const [activeFilter, setActiveFilter] = useState('Barchasi')

  const categories = ['Barchasi', ...new Set(photos.map(p => p.category))]
  const filtered = activeFilter === 'Barchasi'
    ? photos
    : photos.filter(p => p.category === activeFilter)

  const blocks = buildMosaic(filtered)

  return (
    <main className="gallery-page">
      <div className="section-header" style={{ paddingTop: '3rem' }}>
        <h2 className="section-title">Gallereya</h2>
        <p className="section-sub">Bizning tayyor ishlarimizdan namunalar</p>
      </div>

      {/* Kategoriya filterlari */}
      <div className="gallery-filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`gallery-filter-btn${activeFilter === cat ? ' active' : ''}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mozaika grid */}
      <div className="gallery-mosaic">
        {filtered.length === 0 ? (
          <p className="gallery-empty">Bu kategoriyada rasmlar topilmadi.</p>
        ) : (
          blocks.map(({ Component, photos: blockPhotos, key }) => (
            <Component key={key} photos={blockPhotos} />
          ))
        )}
      </div>
    </main>
  )
}