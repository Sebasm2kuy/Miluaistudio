'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

const GALLERY_PHOTOS = [
  '/Miluaistudio/gallery/gallery1.webp',
  '/Miluaistudio/gallery/gallery2.webp',
  '/Miluaistudio/gallery/gallery3.webp',
  '/Miluaistudio/gallery/gallery4.webp',
]

const GALLERY_FALLBACK = [
  '/Miluaistudio/gallery/gallery1.jpg',
  '/Miluaistudio/gallery/gallery2.jpg',
  '/Miluaistudio/gallery/gallery3.jpg',
  '/Miluaistudio/gallery/gallery4.jpg',
]

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const openLightbox = (idx: number) => setLightboxIdx(idx)
  const closeLightbox = () => setLightboxIdx(null)
  const prev = () => setLightboxIdx((p) => (p !== null ? (p - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length : null))
  const next = () => setLightboxIdx((p) => (p !== null ? (p + 1) % GALLERY_PHOTOS.length : null))

  const handleTouchStart = (e: React.TouchEvent) => { setTouchStart(e.touches[0].clientX) }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev() }
    setTouchStart(null)
  }

  return (
    <section id="galeria" className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-24 text-center relative overflow-hidden"
      >
        <h2 className="font-serif italic text-2xl sm:text-3xl md:text-5xl text-bordeaux mb-2 sm:mb-3">
          Momentos Especiales
        </h2>
        <p className="text-gray-400 italic mb-6 sm:mb-10 md:mb-16 text-xs sm:text-sm md:text-base px-2">
          Un vistazo a los momentos que hacen esta celebración inolvidable
        </p>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-5">
          {GALLERY_PHOTOS.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              className="relative group cursor-pointer overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl aspect-[3/4]"
              style={{ background: '#f5f0eb' }}
              onClick={() => openLightbox(idx)}
            >
              <picture>
                <source srcSet={src} type="image/webp" />
                <img
                  src={GALLERY_FALLBACK[idx]}
                  alt={`Momento especial ${idx + 1}`}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                  draggable={false}
                />
              </picture>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bordeaux/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

              {/* Border on hover */}
              <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-transparent group-hover:border-goldLight/25 transition-all duration-500" />

              {/* Expand icon */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Maximize2 size={14} className="sm:w-4 sm:h-4 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-2 sm:p-4 md:p-10"
            style={{ background: 'rgba(0, 0, 0, 0.96)' }}
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-8 md:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all z-10"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-1 sm:left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all z-10"
            >
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-1 sm:right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all z-10"
            >
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
            <motion.img
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              src={GALLERY_PHOTOS[lightboxIdx]}
              alt={`Momento especial ${lightboxIdx + 1}`}
              className="max-w-full max-h-[80vh] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Counter + dots */}
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <div className="flex gap-1.5">
                {GALLERY_PHOTOS.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${i === lightboxIdx ? 'w-6 h-1 bg-goldLight' : 'w-1 h-1 bg-white/30'}`}
                  />
                ))}
              </div>
              <span className="text-white/30 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase">
                {lightboxIdx + 1} / {GALLERY_PHOTOS.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
