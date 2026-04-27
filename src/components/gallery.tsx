'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Maximize2, ImagePlus, Heart, Camera, Check, Loader2, Upload } from 'lucide-react'

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

const PHOTO_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbx6fEZPcwLsAVF8Dj2FkFYdrcnhBz0Y9e_I4qJLf5UOZY6PvWTHo7RTvelBIdqtYIkK/exec'

interface UploadedPhoto {
  url: string
  nombre: string
  mensaje: string
}

function compressImage(file: File, maxWidth = 800, quality = 0.5): Promise<{ base64: string; type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width
        let h = img.height
        if (w > maxWidth) {
          h = (maxWidth / w) * h
          w = maxWidth
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('No canvas context')); return }
        ctx.drawImage(img, 0, 0, w, h)
        const base64 = canvas.toDataURL('image/jpeg', quality)
        resolve({ base64, type: 'image/jpeg' })
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [uploadMsg, setUploadMsg] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'compressing' | 'uploading' | 'ok' | 'error'>('idle')
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Combined photo list for lightbox
  const allPhotos = [...GALLERY_PHOTOS.map((url) => ({ url, type: 'local' as const })), ...uploadedPhotos.map((p) => ({ url: p.url, type: 'drive' as const }))]

  // Fetch uploaded photos on mount
  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch(PHOTO_UPLOAD_URL)
      const text = await res.text()
      try {
        const data = JSON.parse(text)
        if (data.photos && Array.isArray(data.photos)) {
          setUploadedPhotos(data.photos.filter((p: UploadedPhoto) => p.url))
        }
      } catch {
        // Response not JSON, ignore
      }
    } catch {
      // Silent fail
    }
  }, [])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const openLightbox = (idx: number) => setLightboxIdx(idx)
  const closeLightbox = () => setLightboxIdx(null)
  const prev = () => setLightboxIdx((p) => (p !== null ? (p - 1 + allPhotos.length) % allPhotos.length : null))
  const next = () => setLightboxIdx((p) => (p !== null ? (p + 1) % allPhotos.length : null))

  const handleTouchStart = (e: React.TouchEvent) => { setTouchStart(e.touches[0].clientX) }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev() }
    setTouchStart(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 20 * 1024 * 1024) return
    setUploadFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setUploadPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!uploadFile || !uploadName.trim()) return
    setUploadStatus('compressing')

    try {
      const { base64, type } = await compressImage(uploadFile)
      setUploadStatus('uploading')

      const res = await fetch(PHOTO_UPLOAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        redirect: 'follow',
        body: JSON.stringify({
          nombre: uploadName.trim(),
          mensaje: uploadMsg.trim(),
          photo: base64,
          photoType: type,
        }),
      })

      const text = await res.text()
      if (text.includes('"success":true') || text.includes('success') || res.ok) {
        setUploadStatus('ok')
        // Refresh photos after upload
        setTimeout(() => fetchPhotos(), 2000)
      } else {
        setUploadStatus('error')
      }
    } catch {
      setUploadStatus('error')
    }
  }

  const resetUpload = () => {
    setShowUpload(false)
    setUploadName('')
    setUploadMsg('')
    setUploadFile(null)
    setUploadPreview(null)
    setUploadStatus('idle')
    if (fileInputRef.current) fileInputRef.current.value = ''
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
          Galería
        </h2>
        <p className="text-gray-400 italic mb-6 sm:mb-10 md:mb-16 text-xs sm:text-sm md:text-base px-2">
          Un vistazo a los momentos que hacen esta celebración inolvidable
        </p>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-5">
          {allPhotos.map((photo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: Math.min(idx * 0.12, 0.5) }}
              className="relative group cursor-pointer overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl aspect-[3/4]"
              style={{ background: '#f5f0eb' }}
              onClick={() => openLightbox(idx)}
            >
              {photo.type === 'local' ? (
                <picture>
                  <source srcSet={photo.url} type="image/webp" />
                  <img
                    src={GALLERY_FALLBACK[idx] || photo.url}
                    alt={`Galería ${idx + 1}`}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                    draggable={false}
                  />
                </picture>
              ) : (
                <img
                  src={photo.url}
                  alt={`Foto de ${(photo as unknown as UploadedPhoto).nombre || 'invitado'}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  draggable={false}
                  loading="lazy"
                />
              )}

              {/* Name tag for uploaded photos */}
              {photo.type === 'drive' && (photo as unknown as UploadedPhoto).nombre && (
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                  <p className="text-white text-[9px] sm:text-[10px] font-semibold truncate">
                    {(photo as unknown as UploadedPhoto).nombre}
                  </p>
                  {(photo as unknown as UploadedPhoto).mensaje && (
                    <p className="text-white/60 text-[8px] sm:text-[9px] italic truncate mt-0.5">
                      &ldquo;{(photo as unknown as UploadedPhoto).mensaje}&rdquo;
                    </p>
                  )}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-bordeaux/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-transparent group-hover:border-goldLight/25 transition-all duration-500" />
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Maximize2 size={14} className="sm:w-4 sm:h-4 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>
          ))}

          {/* Upload card - always last in grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative group cursor-pointer overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl aspect-[3/4] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-gold/40"
            style={{
              borderColor: 'rgba(184,134,11,0.2)',
              background: 'rgba(184,134,11,0.03)',
            }}
            onClick={() => setShowUpload(true)}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
              style={{ background: 'rgba(184,134,11,0.1)' }}>
              <ImagePlus size={24} className="sm:w-6 sm:h-6 text-gold" strokeWidth={1.5} />
            </div>
            <div className="text-center px-2">
              <p className="text-bordeaux text-[10px] sm:text-xs font-semibold">Tu foto como regalo</p>
              <p className="text-gray-300 text-[8px] sm:text-[9px] mt-1">Toca para subir</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && uploadStatus !== 'ok' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) resetUpload() }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border text-left relative"
              style={{
                background: 'rgba(253,252,251,0.99)',
                borderColor: 'rgba(184, 134, 11, 0.15)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b" style={{ borderColor: 'rgba(184,134,11,0.08)' }}>
                <div className="flex items-center gap-2">
                  <Camera size={18} className="sm:w-5 sm:h-5 text-gold" strokeWidth={1.5} />
                  <h3 className="font-serif italic text-lg sm:text-xl text-bordeaux">
                    Tu foto como regalo
                  </h3>
                </div>
                <button
                  onClick={resetUpload}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-gray-400 text-[10px] sm:text-xs italic mb-4 text-center">
                  Regalale a Milu tu mejor momento con una foto especial
                </p>

                {/* Photo select area */}
                <div
                  className="relative mb-4 rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all duration-300 hover:border-gold/40"
                  style={{ borderColor: uploadPreview ? 'rgba(184,134,11,0.3)' : 'rgba(184,134,11,0.15)' }}
                  onClick={() => !uploadPreview && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {uploadPreview ? (
                    <div className="relative">
                      <img src={uploadPreview} alt="Preview" className="w-full max-h-52 object-contain" style={{ background: '#f5f0eb' }} />
                      <button
                        onClick={(e) => { e.stopPropagation(); setUploadPreview(null); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-10 gap-3">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(184,134,11,0.08)' }}>
                        <Upload size={22} className="text-gold" strokeWidth={1.5} />
                      </div>
                      <div className="text-center">
                        <p className="text-bordeaux text-xs sm:text-sm font-semibold">Toca para seleccionar una foto</p>
                        <p className="text-gray-300 text-[9px] sm:text-[10px] mt-1">o tomá una foto desde tu cámara</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="mb-3">
                  <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gold font-bold mb-1.5">
                    Tu nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="elegant-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-sm text-bordeaux bg-gray-50 focus:outline-none placeholder:text-gray-300"
                    style={{ borderColor: 'rgba(184, 134, 11, 0.15)' }}
                    placeholder="Ej: María González"
                  />
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gold font-bold mb-1.5">
                    Un mensaje para Milu <span className="text-gray-300 font-normal normal-case">(opcional)</span>
                  </label>
                  <textarea
                    value={uploadMsg}
                    onChange={(e) => setUploadMsg(e.target.value)}
                    rows={2}
                    className="elegant-input w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-sm text-bordeaux bg-gray-50 focus:outline-none placeholder:text-gray-300 resize-none"
                    style={{ borderColor: 'rgba(184, 134, 11, 0.15)' }}
                    placeholder="Feliz cumple, Milu..."
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || !uploadName.trim() || uploadStatus === 'compressing' || uploadStatus === 'uploading'}
                  className="gold-button w-full py-3 sm:py-3.5 rounded-full flex items-center justify-center gap-2 text-white font-semibold text-[10px] sm:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadStatus === 'compressing' ? (
                    <><Loader2 size={14} className="animate-spin" /> Comprimiendo...</>
                  ) : uploadStatus === 'uploading' ? (
                    <><Loader2 size={14} className="animate-spin" /> Enviando...</>
                  ) : (
                    <><Heart size={14} fill="currentColor" strokeWidth={0} /> Enviar mi foto</>
                  )}
                </button>

                {uploadStatus === 'error' && (
                  <p className="text-red-500 text-[10px] text-center italic mt-2">
                    Hubo un error, intentá de nuevo
                  </p>
                )}

                <p className="text-[8px] sm:text-[9px] text-gray-300 mt-3 text-center italic">
                  Tu foto se comprime automáticamente
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {uploadStatus === 'ok' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl sm:rounded-3xl border text-center p-6 sm:p-8 md:p-10"
              style={{
                background: 'rgba(253,252,251,0.99)',
                borderColor: 'rgba(184, 134, 11, 0.15)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #d4af37, #b8860b)', boxShadow: '0 8px 32px rgba(184,134,11,0.3)' }}
              >
                <Check size={32} className="sm:w-8 sm:h-8 text-white" strokeWidth={2} />
              </motion.div>
              <h3 className="font-serif italic text-xl sm:text-2xl md:text-3xl text-bordeaux mb-2">
                ¡Gracias!
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm italic mb-5 max-w-sm mx-auto px-4">
                Tu foto fue recibida con amor. Será parte del álbum de recuerdos de Milu
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { resetUpload(); fetchPhotos() }}
                  className="gold-button py-2.5 sm:py-3 rounded-full text-white font-semibold text-[10px] sm:text-xs"
                >
                  Subir otra foto
                </button>
                <button
                  onClick={resetUpload}
                  className="text-gold text-[9px] sm:text-[10px] uppercase tracking-widest font-bold hover:underline transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              src={allPhotos[lightboxIdx]?.url}
              alt={`Galería ${lightboxIdx + 1}`}
              className="max-w-full max-h-[80vh] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <div className="flex gap-1.5">
                {allPhotos.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${i === lightboxIdx ? 'w-6 h-1 bg-goldLight' : 'w-1 h-1 bg-white/30'}`}
                  />
                ))}
              </div>
              <span className="text-white/30 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase">
                {lightboxIdx + 1} / {allPhotos.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
