'use client'

import { useState, useCallback } from 'react'
import Envelope from '@/components/envelope'
import LoadingScreen from '@/components/loading-screen'
import ScrollProgress from '@/components/scroll-progress'
import Navigation from '@/components/navigation'
import BackgroundSlideshow from '@/components/background-slideshow'
import Particles from '@/components/particles'
import Hero from '@/components/hero'
import Dedicatoria from '@/components/dedicatoria'
import Countdown from '@/components/countdown'
import EventInfo from '@/components/event-info'
import Timeline from '@/components/timeline'
import Gallery from '@/components/gallery'
import Rsvp from '@/components/rsvp'
import SpotifyPlayer from '@/components/spotify-player'
import Footer from '@/components/footer'

function Divider() {
  return (
    <div className="flex items-center justify-center py-2 opacity-25">
      <div className="h-px w-12 sm:w-20 md:w-32" style={{ background: 'linear-gradient(90deg, transparent, #b8860b)' }} />
      <div className="w-1 h-1 rotate-45 bg-goldLight/60 mx-2.5 sm:mx-3" />
      <div className="h-px w-12 sm:w-20 md:w-32" style={{ background: 'linear-gradient(90deg, #b8860b, transparent)' }} />
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
      <BackgroundSlideshow />

      <div
        className="page-reveal"
        style={{
          opacity: phase === 'done' ? 1 : 0,
          pointerEvents: phase === 'done' ? 'auto' : 'none',
        }}
      >
        <ScrollProgress />
        <Navigation />
        <Hero active={phase === 'done'} />

        <div className="mt-12 sm:mt-16 md:mt-24">
          <Dedicatoria />
        </div>
        <Divider />
        <div className="mt-10 sm:mt-14 md:mt-20">
          <Countdown />
        </div>
        <Divider />
        <div className="mt-10 sm:mt-14 md:mt-20">
          <EventInfo />
        </div>
        <Divider />
        <div className="mt-10 sm:mt-14 md:mt-20">
          <Timeline />
        </div>
        <Divider />
        <div className="mt-10 sm:mt-14 md:mt-20">
          <Gallery />
        </div>
        <Divider />
        <div className="mt-10 sm:mt-14 md:mt-20">
          <SpotifyPlayer />
        </div>
        <Divider />
        <div className="mt-10 sm:mt-14 md:mt-20">
          <Rsvp />
        </div>
        <div className="mt-10 sm:mt-14 md:mt-20">
          <Footer />
        </div>
        <div className="pb-24 sm:pb-32" />
      </div>

      {phase !== 'done' && <Envelope onOpen={handleOpen} />}
      {phase === 'loading' && <LoadingScreen onDone={handleDone} />}
    </div>
  )
}
