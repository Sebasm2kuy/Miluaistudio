'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
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
    <motion.div
      initial={{ opacity: 0, scaleX: 0.6 }}
      whileInView={{ opacity: 0.3, scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
      className="flex items-center justify-center py-1"
    >
      <div className="h-px w-16 sm:w-28 md:w-44" style={{ background: 'linear-gradient(90deg, transparent, #b8860b)' }} />
      <div className="w-1 h-1 rotate-45 bg-goldLight/60 mx-3 sm:mx-4" />
      <div className="h-px w-16 sm:w-28 md:w-44" style={{ background: 'linear-gradient(90deg, #b8860b, transparent)' }} />
    </motion.div>
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={phase === 'done' ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: phase === 'done' ? 'auto' : 'none' }}
      >
        <ScrollProgress />
        <Navigation />
        <Hero active={phase === 'done'} />

        <div className="mt-24 sm:mt-32 md:mt-40">
          <Dedicatoria />
        </div>
        <Divider />
        <div className="mt-24 sm:mt-32 md:mt-40">
          <Countdown />
        </div>
        <Divider />
        <div className="mt-24 sm:mt-32 md:mt-40">
          <EventInfo />
        </div>
        <Divider />
        <div className="mt-24 sm:mt-32 md:mt-40">
          <Timeline />
        </div>
        <Divider />
        <div className="mt-24 sm:mt-32 md:mt-40">
          <Gallery />
        </div>
        <Divider />
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
      </motion.div>

      {phase !== 'done' && <Envelope onOpen={handleOpen} />}
      {phase === 'loading' && <LoadingScreen onDone={handleDone} />}
    </div>
  )
}
