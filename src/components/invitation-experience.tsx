'use client'

import { useState, useEffect, useRef, useCallback, Fragment, type ReactNode } from 'react'
import { useConfig } from '@/hooks/useConfig'
import type { CSSProperties } from 'react'
import Envelope from '@/components/envelope'
import LoadingScreen from '@/components/loading-screen'
import Navigation from '@/components/navigation'
import BackgroundSlideshow from '@/components/background-slideshow'
import Particles from '@/components/particles'
import Hero from '@/components/hero'
import Dedicatoria from '@/components/dedicatoria'
import Countdown from '@/components/countdown'
import EventInfo from '@/components/event-info'
import Timeline from '@/components/timeline'
import Gallery from '@/components/gallery'
import InstagramSection from '@/components/instagram-section'
import Rsvp from '@/components/rsvp'
import SpotifyPlayer from '@/components/spotify-player'
import Footer from '@/components/footer'

function Divider() {
  return (
    <div className="flex items-center justify-center py-3 sm:py-4 opacity-40">
      <div className="h-px w-14 sm:w-24 md:w-40" style={{ background: 'linear-gradient(90deg, transparent, var(--theme-accent-light, #d4af37))' }} />
      <div className="w-1 h-1 rotate-45 bg-goldLight/70 mx-3 sm:mx-4" />
      <div className="h-px w-14 sm:w-24 md:w-40" style={{ background: 'linear-gradient(90deg, var(--theme-accent-light, #d4af37), transparent)' }} />
    </div>
  )
}

// Separate component for Navigation so it can be memoized independently
function AppNavigation({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const currentY = el.scrollTop
        const diff = currentY - lastScrollY.current

        if (diff > 5 && currentY > 100) {
          setHidden(true)
        } else if (diff < -5) {
          setHidden(false)
        }
        lastScrollY.current = currentY
        ticking = false
      })
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollRef])

  return <Navigation hidden={hidden} scrollContainer={scrollRef} />
}

export default function InvitationExperience() {
  const cfg = useConfig()
  const rootStyle = {
    '--theme-primary': cfg.colores.principal,
    '--theme-accent': cfg.colores.dorado,
    '--theme-accent-light': cfg.colores.doradoClaro,
    '--theme-ivory': cfg.colores.marfil,
    '--theme-background': cfg.colores.fondo,
    '--theme-highlight': cfg.colores.principal === '#3d0202' ? '#fcf6ba' : cfg.colores.doradoClaro,
  } as CSSProperties
  // Secciones prendibles: una config sin `secciones` las muestra todas
  // (invitaciones publicadas y demos siguen igual que siempre).
  const s = cfg.secciones ?? {}
  const on = (flag?: boolean) => flag !== false
  // Sobre animado: ON por defecto en invitaciones reales, OFF en demos.
  // El personalizador lo setea explícitamente según el switch del cliente.
  const mostrarSobre = s.sobre ?? !cfg.modoDemo
  const [phase, setPhase] = useState<'envelope' | 'loading' | 'done'>(
    mostrarSobre ? 'envelope' : 'loading',
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleOpen = () => setPhase('loading')
  const handleDone = () => setPhase('done')

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Bloques activos: se arman en orden y se intercalan divisores entre ellos
  const bloques: { key: string; el: ReactNode }[] = []
  if (on(s.cuentaRegresiva)) bloques.push({ key: 'detalles', el: <Countdown /> })
  bloques.push({ key: 'dedicatoria', el: <Dedicatoria /> })
  bloques.push({ key: 'ubicacion', el: <EventInfo /> })
  if (on(s.cronograma)) bloques.push({ key: 'cronograma', el: <Timeline /> })
  if (on(s.galeria)) bloques.push({ key: 'galeria', el: <Gallery /> })
  if (cfg.instagram?.usuario) bloques.push({ key: 'instagram', el: <InstagramSection /> })
  if (on(s.musica)) bloques.push({ key: 'musica', el: <SpotifyPlayer /> })
  if (on(s.confirmacion)) bloques.push({ key: 'confirmar', el: <Rsvp /> })

  return (
    <div className="invitation-experience selection:bg-goldLight/30" data-invitation-layout={cfg.estilos.modeloComposicion || "classic"} data-card-style={cfg.estilos.estiloTarjetas || "gold-border"} data-button-style={cfg.estilos.estiloBotones || "gold-gradient"} data-title-font={cfg.estilos.fuenteTitulo || "playfair"} data-script-font={cfg.estilos.fuenteCursiva || "alex-brush"} data-theme-mode={cfg.estilos.modoClaro ? "light" : "dark"} data-demo={cfg.modoDemo ? "true" : "false"} style={rootStyle}>
      {/* These stay OUTSIDE the scroll container — truly fixed on iOS */}
      <Particles />
      <BackgroundSlideshow />

      {/* This is the scroll container — prevents iOS fixed-element shift */}
      <div ref={scrollRef} className="scroll-container">

        <div
          className="page-reveal"
          style={{
            opacity: phase === 'done' ? 1 : 0,
            pointerEvents: phase === 'done' ? 'auto' : 'none',
          }}
        >
          {phase === 'done' && <AppNavigation scrollRef={scrollRef} />}
          <Hero active={phase === 'done'} scrollToTop={scrollToTop} />

          {bloques.map((bloque, i) => (
            <Fragment key={bloque.key}>
              {i > 0 && <Divider />}
              <div className={i === 0 ? 'mt-12 sm:mt-16 md:mt-24' : 'mt-10 sm:mt-14 md:mt-20'}>
                {bloque.el}
              </div>
            </Fragment>
          ))}
          <div className="mt-10 sm:mt-14 md:mt-20">
            <Footer />
          </div>
          <div className="pb-24 sm:pb-32" />
        </div>

        {phase !== 'done' && mostrarSobre && <Envelope onOpen={handleOpen} />}
        {phase === 'loading' && <LoadingScreen onDone={handleDone} />}
      </div>
    </div>
  )
}
