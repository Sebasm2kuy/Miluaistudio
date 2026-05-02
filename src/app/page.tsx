'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
import Rsvp from '@/components/rsvp'
import SpotifyPlayer from '@/components/spotify-player'
import Footer from '@/components/footer'

function Divider() {
  return (
    <div className="flex items-center justify-center py-3 sm:py-4 opacity-40">
      <div className="h-px w-14 sm:w-24 md:w-40" style={{ background: 'linear-gradient(90deg, transparent, #d4af37)' }} />
      <div className="w-1 h-1 rotate-45 bg-goldLight/70 mx-3 sm:mx-4" />
      <div className="h-px w-14 sm:w-24 md:w-40" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
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

export default function Home() {
  const [phase, setPhase] = useState<'envelope' | 'loading' | 'done'>('envelope')
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleOpen = () => setPhase('loading')
  const handleDone = () => setPhase('done')

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="selection:bg-goldLight/30">
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

          <div className="mt-12 sm:mt-16 md:mt-24">
            <Countdown />
          </div>
          <Divider />
          <div className="mt-10 sm:mt-14 md:mt-20">
            <Dedicatoria />
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
    </div>
  )
}
