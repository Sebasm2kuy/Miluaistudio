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

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 py-2 opacity-40">
      <div className="h-px w-12 sm:w-20 md:w-32" style={{ background: 'linear-gradient(90deg, transparent, #b8860b)' }} />
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-goldLight">
        <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" fill="currentColor" opacity="0.6" />
      </svg>
      <div className="h-px w-12 sm:w-20 md:w-32" style={{ background: 'linear-gradient(90deg, #b8860b, transparent)' }} />
    </div>
  )
}

export default function Home() {
  const [isOpened, setIsOpened] = useState(false)

  return (
    <div className="min-h-screen selection:bg-goldLight/30">
      <Particles />
      {isOpened && <BackgroundSlideshow />}

      <AnimatePresence>
        {!isOpened && <Envelope onOpen={() => setIsOpened(true)} />}
      </AnimatePresence>

      {isOpened && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="relative z-10"
        >
          <Navigation />
          <Hero />

          <OrnamentalDivider />

          <div className="mt-20 sm:mt-28 md:mt-36">
            <Countdown />
          </div>

          <OrnamentalDivider />

          <div className="mt-20 sm:mt-28 md:mt-36">
            <EventInfo />
          </div>

          <OrnamentalDivider />

          <div className="mt-20 sm:mt-28 md:mt-36">
            <Gallery />
          </div>

          <OrnamentalDivider />

          <div className="mt-20 sm:mt-28 md:mt-36">
            <Rsvp />
          </div>

          <OrnamentalDivider />

          <div className="mt-20 sm:mt-28 md:mt-36">
            <Footer />
          </div>

          <div className="pb-24 sm:pb-32 md:pb-40" />
        </motion.div>
      )}
    </div>
  )
}
