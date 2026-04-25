'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const GALLERY_PHOTOS = [
  '/Miluaistudio/gallery/gallery1.jpg',
  '/Miluaistudio/gallery/gallery2.jpg',
  '/Miluaistudio/gallery/gallery3.jpg',
  '/Miluaistudio/gallery/gallery4.jpg',
]

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const openLightbox = (idx: number) => setLightboxIdx(idx)
  const closeLightbox = () => setLightboxIdx(null)
  const prev = () =>
    setLightboxIdx((prev) => (prev !== null ? (prev - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length : null))
  const next = () =>
    setLightboxIdx((prev) => (prev !== null ? (prev + 1) % GALLERY_PHOTOS.length : null))

  return (
    <section id="galeria" className="max-w-5xl mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="rounded-[2rem] md:rounded-[4rem] p-8 md:p-24 text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(184, 134, 11, 0.15)',
        }}
      >
        <h2 className="font-serif italic text-3xl md:text-6xl text-bordeaux mb-4">
          Momentos Especiales
        </h2>
        <p className="text-gray-400 italic mb-10 md:mb-16 text-sm md:text-base">
          Un vistazo a los momentos que hacen esta celebración inolvidable
        </p>

        <div className="grid grid-cols-2 gap-3 md:gap-6">
          {GALLERY_PHOTOS.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="relative group cursor-pointer overflow-hidden rounded-xl md:rounded-2xl aspect-[3/4]"
              onClick={() => openLightbox(idx)}
            >
              <img
                src={src}
                alt={`Momento especial ${idx + 1}`}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-bordeaux/0 group-hover:bg-bordeaux/20 transition-all duration-500" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
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
            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 md:p-10"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10"
            >
              <X size={24} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-2 md:left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-2 md:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10"
            >
              <ChevronRight size={28} />
            </button>

            <motion.img
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              src={GALLERY_PHOTOS[lightboxIdx]}
              alt={`Momento especial ${lightboxIdx + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-bold tracking-widest">
              {lightboxIdx + 1} / {GALLERY_PHOTOS.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
