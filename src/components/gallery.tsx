'use client'
import { useState, useRef, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Maximize2, Camera, MessageCircle } from 'lucide-react'
import { useConfig } from '@/hooks/useConfig'

// Nota (2026-06-30):
// El backend original basado en Google Apps Script dejó de responder (404 en
// script.googleusercontent.com/macros/echo), por lo que la subida de fotos y
// la carga de fotos subidas por otros invitados se reemplazaron por un flujo
// basado en WhatsApp. Las fotos originales de la galería siguen viniendo
// desde config.ts (estáticas) y se muestran igual que antes.

interface Photo {
  id: string
  src: string
  type: 'original' | 'uploaded'
}

export default function Gallery() {
  const cfg = useConfig()
  const originalPhotos = cfg.galeria.fotos.map(p => ({ src: p.webp, fallback: p.fallback }))
  const [photos] = useState<Photo[]>(
    originalPhotos.map((p, i) => ({ id: `orig-${i}`, src: p.src, type: 'original' as const }))
  )
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const openLightbox = (idx: number) => setLightboxIdx(idx)
  const closeLightbox = () => setLightboxIdx(null)
  const prev = () => setLightboxIdx(p => (p !== null ? (p - 1 + photos.length) % photos.length : null))
  const next = () => setLightboxIdx(p => (p !== null ? (p + 1) % photos.length : null))

  const handleTouchStart = (e: React.TouchEvent) => { setTouchStart(e.touches[0].clientX) }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev() }
    setTouchStart(null)
  }

  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const card = scrollRef.current.querySelector('[data-carousel-card]') as HTMLElement
    if (!card) return
    const scrollAmount = card.offsetWidth + 16
    scrollRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    })
  }, [])

  // Reemplazo del upload por WhatsApp: abre WhatsApp con un mensaje
  // pidiendo al invitado que envíe su foto a la quinceañera / organizador.
  const shareViaWhatsApp = useCallback(() => {
    const hostPhone = cfg.rsvp.hostPhone
    const msg = encodeURIComponent(
      `¡Hola Milu! 🎀\n` +
      `Quiero compartir una foto para la galería de tus XV.\n` +
      `Te la envío por aquí. ¡Gracias!`
    )
    if (hostPhone) {
      window.open(`https://wa.me/${hostPhone}?text=${msg}`, '_blank')
    } else {
      window.open(`https://wa.me/?text=${msg}`, '_blank')
    }
  }, [cfg.rsvp.hostPhone])

  return (
    <section id="galeria" className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
      <div className={`css-fade-up glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-24 text-center relative overflow-hidden`}>
        <h2 className="font-serif italic text-3xl sm:text-3xl md:text-5xl text-bordeaux mb-2 sm:mb-3">{cfg.galeria.titulo}</h2>
        <p className="text-gray-400 italic mb-6 sm:mb-10 md:mb-16 text-sm sm:text-sm md:text-base px-2">
          {cfg.galeria.subtitulo}
        </p>

        {/* ===== Horizontal Carousel ===== */}
        <div className="relative">
          {/* Desktop arrows — delicate gold circles */}
          <button
            onClick={() => scrollCarousel('left')}
            className="hidden md:flex absolute -left-2 xl:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 xl:w-10 xl:h-10 rounded-full items-center justify-center border shadow-lg transition-[color,border-color,background-color] duration-300"
            style={{
              background: 'rgba(253, 252, 251, 0.92)',
              borderColor: 'rgba(184, 134, 11, 0.25)',
              color: 'rgba(184, 134, 11, 0.7)',
            }}
            aria-label="Foto anterior"
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(184, 134, 11, 0.5)'; e.currentTarget.style.color = '#b8860b' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(184, 134, 11, 0.25)'; e.currentTarget.style.color = 'rgba(184, 134, 11, 0.7)' }}
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => scrollCarousel('right')}
            className="hidden md:flex absolute -right-2 xl:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 xl:w-10 xl:h-10 rounded-full items-center justify-center border shadow-lg transition-[color,border-color,background-color] duration-300"
            style={{
              background: 'rgba(253, 252, 251, 0.92)',
              borderColor: 'rgba(184, 134, 11, 0.25)',
              color: 'rgba(184, 134, 11, 0.7)',
            }}
            aria-label="Foto siguiente"
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(184, 134, 11, 0.5)'; e.currentTarget.style.color = '#b8860b' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(184, 134, 11, 0.25)'; e.currentTarget.style.color = 'rgba(184, 134, 11, 0.7)' }}
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-3 sm:gap-4 md:gap-5 pb-1"
          >
            {photos.map((photo, idx) => {
              const isOriginal = photo.type === 'original'
              const origIdx = isOriginal ? parseInt(photo.id.split('-')[1]) : -1
              return (
                <div
                  key={photo.id}
                  data-carousel-card
                  className="flex-shrink-0 w-[42vw] sm:w-[36vw] md:w-[30%] aspect-[3/4] snap-center rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group relative"
                  style={{ background: '#f5f0eb' }}
                  onClick={() => openLightbox(idx)}
                >
                  {isOriginal ? (
                    <picture>
                      <source srcSet={photo.src} type="image/webp" />
                      <img
                        src={originalPhotos[origIdx].fallback}
                        alt={`Momento especial ${origIdx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        style={{ objectPosition: 'center 30%' }}
                        draggable={false}
                      />
                    </picture>
                  ) : (
                    <img
                      src={photo.src}
                      alt="Foto compartida"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      style={{ objectPosition: 'center 30%' }}
                      draggable={false}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bordeaux/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                      <Maximize2 size={14} className="sm:w-4 sm:h-4 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              )
            })}

          </div>
        </div>

        {/* Upload button — ahora abre WhatsApp en lugar del Apps Script roto */}
        <button
          onClick={shareViaWhatsApp}
          className="mt-6 sm:mt-8 md:mt-10 mx-auto flex items-center justify-center gap-3 sm:gap-4 py-4 sm:py-5 px-10 sm:px-16 rounded-full border transition-[color,border-color,background-color,transform] duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            borderColor: 'rgba(37, 211, 102, 0.45)',
            color: '#128C7E',
            background: 'rgba(37, 211, 102, 0.08)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(37, 211, 102, 0.7)'; e.currentTarget.style.color = '#0f6b5e'; e.currentTarget.style.background = 'rgba(37, 211, 102, 0.14)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(37, 211, 102, 0.45)'; e.currentTarget.style.color = '#128C7E'; e.currentTarget.style.background = 'rgba(37, 211, 102, 0.08)' }}
        >
          <MessageCircle size={20} className="sm:w-5 sm:h-5" strokeWidth={1.5} />
          <span className="font-cursive text-xl sm:text-2xl md:text-3xl italic" style={{ color: 'inherit' }}>
            {cfg.galeria.botonSubir}
          </span>
        </button>
        <p className="text-gray-400 text-[10px] sm:text-xs italic mt-3 sm:mt-4 px-4">
          Te abre WhatsApp para enviarnos tu foto directamente
        </p>
      </div>

      {/* ===== Lightbox ===== */}
      <div
        className={`fixed inset-0 z-[300] flex items-center justify-center p-2 sm:p-4 md:p-10 modal-overlay ${lightboxIdx !== null ? 'open' : ''}`}
        style={{ background: 'rgba(0, 0, 0, 0.96)' }}
        onClick={closeLightbox}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button onClick={closeLightbox} className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-8 md:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-[color,background-color] z-10">
          <X size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-1 sm:left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-[color,background-color] z-10">
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-1 sm:right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-[color,background-color] z-10">
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </button>
        {lightboxIdx !== null && (
          <img
            src={photos[lightboxIdx].src}
            alt={`Foto ${lightboxIdx + 1}`}
            className="modal-content max-w-full max-h-[80vh] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {photos.map((_, i) => (
              <div key={i} className={`rounded-full transition-[width,height,background-color] duration-300 ${lightboxIdx === i ? 'w-6 h-1 bg-goldLight' : 'w-1 h-1 bg-white/30'}`} />
            ))}
          </div>
          <span className="text-white/30 text-[10px] sm:text-[10px] tracking-[0.3em] uppercase">
            {lightboxIdx !== null ? `${lightboxIdx + 1} / ${photos.length}` : ''}
          </span>
        </div>
      </div>
    </section>
  )
}
