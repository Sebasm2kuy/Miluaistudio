'use client'
import { useEffect, useState, useRef } from 'react'
import { useConfig } from '@/hooks/useConfig'
import { BACKGROUND_PRESETS } from '@/data/admin-options'


export default function BackgroundSlideshow({ visible = true }: { visible?: boolean }) {
  const cfg = useConfig()
  const photos = cfg.fondo.fotos
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const nextRef = useRef(0)

  // Detect gradient mode
  const isGradient = photos.length > 0 && photos[0]?.startsWith('gradient:')
  const gradientId = isGradient ? photos[0].replace('gradient:', '') : null
  const gradientPreset = gradientId ? BACKGROUND_PRESETS.find(bg => bg.id === gradientId) : null
  const gradientCss = gradientPreset?.css || null
  const isLightGradient = gradientPreset?.light === true

  // Preload all images on mount (only for photo mode)
  useEffect(() => {
    if (!isGradient) {
      photos.forEach(url => {
        const img = new Image()
        img.src = url
      })
    }
  }, [isGradient])

  // Initial reveal
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setFading(true), 300)
      return () => clearTimeout(t)
    }
  }, [visible])

  // Auto-cycle on all devices (only for photo mode)
  useEffect(() => {
    if (!visible || !fading || isGradient) return

    const interval = setInterval(() => {
      // Fade out
      setFading(false)
      setTimeout(() => {
        nextRef.current = (nextRef.current + 1) % photos.length
        setIdx(nextRef.current)
        // Fade in
        setTimeout(() => setFading(true), 50)
      }, 700)
    }, 7000)

    return () => clearInterval(interval)
  }, [visible, fading, isGradient])

  // Gradient / image preset mode: no slideshow, fixed background
  if (isGradient && (gradientCss || gradientPreset?.image)) {
    return (
      <div
        className="fixed inset-0 z-[-10]"
        style={{
          background: gradientCss ?? '#0a0a0a',
          opacity: fading && visible ? 1 : 0,
          transition: 'opacity 800ms ease',
        }}
      >
        {/* Colección «fondos de autor»: imagen fotográfica sobre el css de respaldo */}
        {gradientPreset?.image && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${gradientPreset.image})`,
              backgroundSize: 'cover',
              backgroundPosition: gradientPreset.position || 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
        {/* Velo del fondo: en temas claros con imagen agrega legibilidad tipo
            papel satinado sin apagar la fotografía; en oscuros profundiza bordes. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isLightGradient
              ? gradientPreset?.image
                ? 'linear-gradient(to bottom, rgba(252,247,241,0.55) 0%, rgba(252,247,241,0.34) 32%, rgba(252,247,241,0.38) 68%, rgba(252,247,241,0.58) 100%)'
                : 'linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, transparent 25%, transparent 80%, rgba(255,255,255,0.06) 100%)'
              : `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 15%, transparent 70%, rgba(0,0,0,0.5) 100%), radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)`,
          }}
        />
      </div>
    )
  }

  // Photo slideshow mode
  // Elegir la posición por foto desde config (fondo.posiciones[idx]).
  // En mobile usamos el valor mobile, en desktop el desktop.
  const posicion: { desktop?: string; mobile?: string } = cfg.fondo.posiciones?.[idx] ?? {}
  const posicionDesktop = posicion.desktop || 'center 15%'
  const posicionMobile = posicion.mobile || 'center top'

  return (
    <div
      className="fixed inset-0 z-[-10] bg-slideshow-photo"
      style={{
        backgroundColor: '#000',
        backgroundImage: `url(${photos[idx]})`,
        backgroundSize: 'cover',
        // CSS variables que consume la clase .bg-slideshow-photo en globals.css
        ['--bg-pos-desktop' as string]: posicionDesktop,
        ['--bg-pos-mobile' as string]: posicionMobile,
        backgroundRepeat: 'no-repeat',
        opacity: fading && visible ? 1 : 0,
        transition: 'opacity 800ms ease',
      }}
    >
      {/* Dark overlay — replaces expensive filter: brightness/saturate */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 70%, rgba(0,0,0,0.8) 100%),
            radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)
          `,
        }}
      />
    </div>
  )
}
