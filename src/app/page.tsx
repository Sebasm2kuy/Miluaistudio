'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Envelope from '@/components/envelope'
import Navigation from '@/components/navigation'
import BackgroundSlideshow from '@/components/background-slideshow'
import Particles from '@/components/particles'
import Hero from '@/components/hero'
import Countdown from '@/components/countdown'
import EventInfo from '@/components/event-info'
import Gallery from '@/components/gallery'
import Rsvp from '@/components/rsvp'
import Footer from '@/components/footer'

export default function Home() {
  const [isOpened, setIsOpened] = useState(false)

  return (
    <div className="min-h-screen selection:bg-goldLight/30">
      {/* Particles Overlay - Always visible */}
      <Particles />

      {/* Background Slideshow */}
      {isOpened && <BackgroundSlideshow />}

      {/* Envelope Opening Screen */}
      <AnimatePresence>
        {!isOpened && <Envelope onOpen={() => setIsOpened(true)} />}
      </AnimatePresence>

      {/* Main Content */}
      {isOpened && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          className="relative z-10"
        >
          {/* Floating Navigation */}
          <Navigation />

          {/* Hero Section */}
          <Hero />

          {/* Countdown */}
          <div className="mt-32 md:mt-48">
            <Countdown />
          </div>

          {/* Event Info */}
          <div className="mt-32 md:mt-48">
            <EventInfo />
          </div>

          {/* Gallery */}
          <div className="mt-32 md:mt-48">
            <Gallery />
          </div>

          {/* RSVP + Gift */}
          <div className="mt-32 md:mt-48">
            <Rsvp />
          </div>

          {/* Footer */}
          <div className="mt-32 md:mt-48">
            <Footer />
          </div>
        </motion.div>
      )}
    </div>
  )
}
