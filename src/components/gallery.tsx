'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Maximize2, Camera, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const PHOTO_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbx6fEZPcwLsAVF8Dj2FkFYdrcnhBz0Y9e_I4qJLf5UOZY6PvWTHo7RTvelBIdqtYIkK/exec'

const ORIGINAL_PHOTOS = [
  { src: '/Miluaistudio/gallery/gallery1.webp', fallback: '/Miluaistudio/gallery/gallery1.jpg' },
  { src: '/Miluaistudio/gallery/gallery2.webp', fallback: '/Miluaistudio/gallery/gallery2.jpg' },
  { src: '/Miluaistudio/gallery/gallery3.webp', fallback: '/Miluaistudio/gallery/gallery3.jpg' },
  { src: '/Miluaistudio/gallery/gallery4.webp', fallback: '/Miluaistudio/gallery/gallery4.jpg' },
]

interface Photo {
  id: string
  src: string
  type: 'original' | 'uploaded'
}

type UploadState = 'idle' | 'compressing' | 'uploading' | 'ok' | 'error'

function compressImage(file: File, maxSize = 800, quality = 0.5): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = Math.round((height * maxSize) / width); width = maxSize }
        else { width = Math.round((width * maxSize) / height); height = maxSize }
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('No canvas context'))
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>(
    ORIGINAL_PHOTOS.map((p, i) => ({ id: `orig-${i}`, src: p.src, type: 'original' as const }))
  )
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [uploadModal, setUploadModal] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const parseGasResponse = async (res: Response): Promise<any> => {
    const text = await res.text()
    try { return JSON.parse(text) } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) { try { return JSON.parse(match[0]) } catch { /* ignore */ } }
      return null
    }
  }

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch(`${PHOTO_UPLOAD_URL}?action=getPhotos`)
        if (res.ok) {
          const data = await parseGasResponse(res)
          if (data && Array.isArray(data.photos)) {
            const uploaded: Photo[] = data.photos.map((url: string, i: number) => ({
              id: `srv-${i}`, src: url, type: 'uploaded' as const,
            }))
            setPhotos(prev => [...prev, ...uploaded])
          }
        }
      } catch { /* silently ignore */ }
    }
    fetchPhotos()
  }, [])

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setSelectedFile(file); setPreview(URL.createObjectURL(file)); setUploadState('idle') }
  }

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return
    try {
      setUploadState('compressing')
      const compressed = await compressImage(selectedFile)
      setUploadState('uploading')
      const blob = await (await fetch(compressed)).blob()
      const form = new FormData()
      form.append('file', blob, 'photo.jpg')
      form.append('action', 'upload')
      const res = await fetch(PHOTO_UPLOAD_URL, { method: 'POST', body: form })
      if (res.ok) {
        setPhotos(prev => [...prev, { id: `upload-${Date.now()}`, src: compressed, type: 'uploaded' }])
        setUploadState('ok')
        setTimeout(() => { setUploadModal(false); setSelectedFile(null); setPreview(null); setUploadState('idle') }, 1500)
      } else { setUploadState('error') }
    } catch { setUploadState('error') }
  }, [selectedFile])

  const closeUpload = () => {
    if (uploadState === 'compressing' || uploadState === 'uploading') return
    setUploadModal(false); setSelectedFile(null); setPreview(null); setUploadState('idle')
  }

  const statusConfig = {
    compressing: { icon: Loader2, text: 'Comprimiendo...', color: 'text-gold', spin: true },
    uploading: { icon: Loader2, text: 'Subiendo...', color: 'text-gold', spin: true },
    ok: { icon: CheckCircle, text: '¡Foto subida!', color: 'text-green-600', spin: false },
    error: { icon: AlertCircle, text: 'Error, intentá de nuevo', color: 'text-red-500', spin: false },
  }

  return (
    <section id="galeria" className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
      <div className={`css-fade-up glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-24 text-center relative overflow-hidden`}>
        <h2 className="font-serif italic text-2xl sm:text-3xl md:text-5xl text-bordeaux mb-2 sm:mb-3">Galería</h2>
        <p className="text-gray-400 italic mb-6 sm:mb-10 md:mb-16 text-xs sm:text-sm md:text-base px-2">
          Momentos que hacen esta celebración inolvidable
        </p>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-5">
          {photos.map((photo, idx) => {
            const isOriginal = photo.type === 'original'
            const origIdx = isOriginal ? parseInt(photo.id.split('-')[1]) : -1
            return (
              <div
                key={photo.id}
                className={`css-fade-up relative group cursor-pointer overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl aspect-[3/4]`}
                style={{ background: '#f5f0eb' }}
                onClick={() => openLightbox(idx)}
              >
                {isOriginal ? (
                  <picture>
                    <source srcSet={photo.src} type="image/webp" />
                    <img src={ORIGINAL_PHOTOS[origIdx].fallback} alt={`Momento especial ${origIdx + 1}`} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" draggable={false} />
                  </picture>
                ) : (
                  <img src={photo.src} alt="Foto compartida" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" draggable={false} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bordeaux/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-transparent group-hover:border-goldLight/25 transition-all duration-500" />
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                    <Maximize2 size={14} className="sm:w-4 sm:h-4 text-white" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            )
          })}

          {/* Upload card */}
          <div
            className={`css-fade-up relative group cursor-pointer overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl aspect-[3/4] border-2 border-dashed hover:border-gold/40 transition-all duration-500 flex flex-col items-center justify-center gap-2 sm:gap-3`}
            style={{ borderColor: 'rgba(184, 134, 11, 0.2)', background: 'rgba(184, 134, 11, 0.02)' }}
            onClick={() => setUploadModal(true)}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-gold/60 group-hover:text-gold transition-colors duration-300" style={{ background: 'rgba(184, 134, 11, 0.06)' }}>
              <Camera size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
            </div>
            <p className="text-gold/50 group-hover:text-gold font-bold text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-colors duration-300">
              Subir tu foto
            </p>
          </div>
        </div>
      </div>

      {/* Upload Modal — CSS-only transitions, no framer-motion */}
      <div
        className={`fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 modal-overlay ${uploadModal ? 'open' : ''}`}
        style={{ background: 'rgba(0, 0, 0, 0.9)' }}
        onClick={closeUpload}
      >
        <div
          className="modal-content w-full max-w-md rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            border: '1px solid rgba(184, 134, 11, 0.15)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={closeUpload}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            disabled={uploadState === 'compressing' || uploadState === 'uploading'}
          >
            <X size={16} />
          </button>

          <h3 className="font-serif italic text-xl sm:text-2xl text-bordeaux mb-1">Compartí tu foto</h3>
          <p className="text-gray-400 text-xs sm:text-sm mb-6">Las mejores fotos de la noche</p>

          {!preview ? (
            <div
              className="border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center gap-3 cursor-pointer transition-all duration-300 hover:border-gold/40 hover:bg-gold/[0.02]"
              style={{ borderColor: 'rgba(184, 134, 11, 0.25)' }}
              onClick={() => fileRef.current?.click()}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-gold" style={{ background: 'rgba(184, 134, 11, 0.08)' }}>
                <Upload size={22} strokeWidth={1.5} />
              </div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">Tocá para elegir una foto</p>
              <p className="text-gray-300 text-[10px] sm:text-xs">JPG o PNG</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadState === 'compressing' || uploadState === 'uploading'}
                  className="flex-1 py-3 rounded-xl border text-gray-500 text-xs font-medium hover:bg-gray-50 transition-all disabled:opacity-40"
                  style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                >Cambiar</button>
                <button
                  onClick={handleUpload}
                  disabled={uploadState === 'compressing' || uploadState === 'uploading' || uploadState === 'ok'}
                  className="gold-button flex-1 py-3 rounded-xl text-white text-xs font-semibold disabled:opacity-60"
                >{uploadState === 'ok' ? '¡Subida!' : 'Subir foto'}</button>
              </div>
              {(uploadState === 'compressing' || uploadState === 'uploading' || uploadState === 'ok' || uploadState === 'error') && (
                <div className={`flex items-center justify-center gap-2 text-xs ${statusConfig[uploadState].color}`}>
                  {(() => { const cfg = statusConfig[uploadState]; const Icon = cfg.icon; return <Icon size={14} className={cfg.spin ? 'animate-spin' : ''} /> })()}
                  <span>{statusConfig[uploadState].text}</span>
                </div>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
        </div>
      </div>

      {/* Lightbox — CSS-only transitions */}
      <div
        className={`fixed inset-0 z-[300] flex items-center justify-center p-2 sm:p-4 md:p-10 modal-overlay ${lightboxIdx !== null ? 'open' : ''}`}
        style={{ background: 'rgba(0, 0, 0, 0.96)' }}
        onClick={closeLightbox}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button onClick={closeLightbox} className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-8 md:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all z-10">
          <X size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-1 sm:left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all z-10">
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-1 sm:right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all z-10">
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
              <div key={i} className={`rounded-full transition-all duration-300 ${lightboxIdx === i ? 'w-6 h-1 bg-goldLight' : 'w-1 h-1 bg-white/30'}`} />
            ))}
          </div>
          <span className="text-white/30 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase">
            {lightboxIdx !== null ? `${lightboxIdx + 1} / ${photos.length}` : ''}
          </span>
        </div>
      </div>
    </section>
  )
}
