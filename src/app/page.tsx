'use client'

import { useState, useCallback } from 'react'
import Envelope from '@/components/envelope'
import LoadingScreen from '@/components/loading-screen'
import ScrollProgress from '@/components/scroll-progress'
import Navigation from '@/components/navigation'
import BackgroundSlideshow from '@/components/background-slideshow'
import Particles from '@/components/particles'
import Hero from '@/components/hero'
import Countdown from '@/components/countdown'
import EventInfo from '@/components/event-info'
import Gallery from '@/components/gallery'
import Rsvp from '@/components/rsvp'
import SpotifyPlayer from '@/components/spotify-player'
import Footer from '@/components/footer'

function Divider() {
  return (
    <div className="flex items-center justify-center py-1 opacity-30">
      <div className="h-px w-16 sm:w-28 md:w-44" style={{ background: 'linear-gradient(90deg, transparent, #b8860b)' }} />
      <div className="w-1 h-1 rotate-45 bg-goldLight/60 mx-3 sm:mx-4" />
      <div className="h-px w-16 sm:w-28 md:w-44" style={{ background: 'linear-gradient(90deg, #b8860b, transparent)' }} />
    </div>
  )
}

export default function Home() {
  const [phase, setPhase] = useState<'envelope' | 'loading' | 'done'>('envelope')

  const handleOpen = useCallback(() => setPhase('loading'), [])
  const handleDone = useCallback(() => setPhase('done'), [])

  return (
    <div className="min-h-screen selection:bg-goldLight/30">
      <Particles />

      {/* Slideshow SIEMPRE renderizado - el loader (z-300) lo tapa */}
      <BackgroundSlideshow />

      {/* Contenido SIEMPRE en el DOM - invisible detras del loader */}
      <div
        style={{
          opacity: phase === 'done' ? 1 : 0,
          transition: 'opacity 1.2s ease',
          pointerEvents: phase === 'done' ? 'auto' : 'none',
        }}
      >
        <ScrollProgress />
        <Navigation />
        <Hero />

        <div className="mt-24 sm:mt-32 md:mt-40">
          <Countdown />
        </div>
        <Divider />
        <div className="mt-24 sm:mt-32 md:mt-40">
          <EventInfo />
        </div>
        <Divider />
        <div className="mt-24 sm:mt-32 md:mt-40">
          <Gallery />
        </div>
        <div className="mt-24 sm:mt-32 md:mt-40">
          <SpotifyPlayer />
        </div>
        <Divider />
        <div className="mt-24 sm:mt-32 md:mt-40">
          <Rsvp />
        </div>
        <div className="mt-24 sm:mt-32 md:mt-40">
          <Footer />
        </div>
        <div className="pb-28 sm:pb-36 md:pb-44" />
      </div>

      {/* Capas superiores */}
      {/* Envelope se queda renderizado durante 'loading' pero atras del loader (z-200 < z-300) */}
      {phase !== 'done' && <Envelope onOpen={handleOpen} />}
      {phase === 'loading' && <LoadingScreen onDone={handleDone} />}
    </div>
  )
}
