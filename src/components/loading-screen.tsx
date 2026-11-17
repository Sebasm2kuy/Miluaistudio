'use client'
import { useEffect, useState, useRef } from 'react'
import { useConfig } from '@/hooks/useConfig'

interface LoadingScreenProps { onDone: () => void }

// Static must-have asset (the invitation cover).
// Background photos are pulled dynamically from cfg.fondo.fotos below,
// so the loader only waits for assets that will actually be displayed.
const STATIC_ASSETS = [
  '/invitacion-vertical.webp',
]

// Tope absoluto de espera: aunque un activo se cuelgue (red intermitente,
// CDN lento), la bienvenida siempre termina y la invitación siempre arranca.
// (Antes la barra topaba en 82% mientras las imágenes cargaban y podía
// quedarse ahí para siempre.)
const TOPE_ACTIVOS_MS = 9000

// La bienvenida respira un instante antes de desvanecerse (nunca un flash).
const MOSTRADO_MINIMO_MS = 1100

function preloadImages(urls: string[]): Promise<void> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.src = url
        }),
    ),
  ).then(() => {})
}

function waitForFonts(timeoutMs = 5000): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()
  const fontsReady: Promise<void> = document.fonts?.ready.then(() => {}) ?? Promise.resolve()
  return Promise.race([
    fontsReady,
    new Promise<void>((r) => setTimeout(r, timeoutMs)),
  ])
}

// Resuelve siempre: la promesa original o el tope de tiempo, lo que ocurra primero.
function conTope<T>(promesa: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promesa, new Promise<never>((r) => setTimeout(r, ms))])
}

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const cfg = useConfig()
  const [fading, setFading] = useState(false)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  })

  // Build the asset list from the live config so we only preload
  // photos that will actually be displayed (no removed gallery photos).
  // Skip gradient presets — they're CSS, not images.
  const dynamicAssets = (cfg.fondo.fotos || []).filter(
    (url) => url && !url.startsWith('gradient:')
  )
  const ASSETS = [...STATIC_ASSETS, ...dynamicAssets]

  useEffect(() => {
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const montaje = performance.now()

    conTope(
      Promise.all([preloadImages(ASSETS), waitForFonts(5000)]),
      TOPE_ACTIVOS_MS,
    ).then(() => {
      if (cancelled) return
      const espera = Math.max(
        0,
        MOSTRADO_MINIMO_MS - (performance.now() - montaje),
      )
      timers.push(setTimeout(() => setFading(true), espera))
      timers.push(
        setTimeout(() => {
          if (cancelled || doneRef.current) return
          doneRef.current = true
          onDoneRef.current()
        }, espera + 900),
      )
    })

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [ASSETS.join(',')])

  // Bienvenida de marca (demos publicadas): «Lumen Gala» en vez del nombre
  // del evento. Las invitaciones reales siguen abriendo con los nombres.
  const titulo = cfg.bienvenidaMarca ? 'Lumen Gala' : cfg.evento.nombre

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
      style={{
        background: cfg.estilos.modoClaro ? cfg.colores.fondo : '#000',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.8s ease',
        left: '-5px',
        right: '-5px',
        top: '-5px',
        bottom: '-5px',
        width: 'calc(100% + 10px)',
        height: 'calc(100% + 10px)',
      }}
    >
      <style>{`@keyframes bienvenida-aparecer { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <style>{`@keyframes bienvenida-linea { 0% { transform: translateX(-120%); } 100% { transform: translateX(340%); } }`}</style>
      <p
        className="font-cursive text-7xl sm:text-6xl mb-10 sm:mb-10"
        style={{
          color: cfg.estilos.modoClaro ? cfg.colores.dorado : '#d4af37',
          animation: 'bienvenida-aparecer 1.1s ease both',
        }}
      >
        {titulo}
      </p>
      <div className="w-48 sm:w-64 md:w-72">
        <div
          className="h-[2px] overflow-hidden rounded-full"
          style={{ background: 'rgba(184,134,11,0.15)' }}
        >
          <div
            className="h-full w-[30%] rounded-full"
            style={{
              background: 'linear-gradient(90deg, #b38728, #d4af37, #fcf6ba)',
              animation: 'bienvenida-linea 1.7s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </div>
  )
}
