'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const EVENT_DATE = new Date('2026-08-22T21:00:00')
const labels: Record<string, string> = { D: 'Días', H: 'Horas', M: 'Min', S: 'Seg' }

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ D: 0, H: 0, M: 0, S: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const diff = EVENT_DATE.getTime() - now.getTime()
      if (diff > 0) {
        setTimeLeft({
          D: Math.floor(diff / (1000 * 60 * 60 * 24)),
          H: Math.floor((diff / (1000 * 60 * 60)) % 24),
          M: Math.floor((diff / 1000 / 60) % 60),
          S: Math.floor((diff / 1000) % 60),
        })
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="detalles" className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-24 text-center relative overflow-hidden"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 opacity-30"
          style={{ background: 'linear-gradient(90deg, transparent, #b8860b, #d4af37, #b8860b, transparent)' }} />

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-gold/60 text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.6em] font-bold mb-3 sm:mb-4">
            La cuenta regresiva
          </p>
          <h2 className="font-serif italic text-2xl sm:text-3xl md:text-6xl text-bordeaux mb-2 sm:mb-3">
            El tiempo vuela...
          </h2>
          <div className="w-10 sm:w-14 h-px mx-auto mb-8 sm:mb-12 md:mb-16"
            style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />
        </motion.div>

        {/* Countdown grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-6">
          {Object.entries(timeLeft).map(([label, val], idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative p-2.5 sm:p-3 md:p-6 rounded-xl sm:rounded-[1.5rem] md:rounded-[2.5rem] border overflow-hidden min-w-0"
              style={{
                background: 'linear-gradient(180deg, rgba(253,252,251,0.9) 0%, rgba(253,252,251,0.7) 100%)',
                borderColor: 'rgba(184, 134, 11, 0.08)',
              }}
            >
              {/* Subtle gold top accent on each card */}
              <div className="absolute top-0 left-0 w-full h-0.5 opacity-40"
                style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />

              <div
                style={{ fontSize: 'clamp(1.1rem, 4.5vw, 4.5rem)' }}
                className="font-light text-bordeaux tracking-tight tabular-nums leading-none"
              >
                {String(val).padStart(2, '0')}
              </div>
              <div className="text-[7px] sm:text-[9px] md:text-xs uppercase text-gold tracking-[0.15em] sm:tracking-[0.3em] md:tracking-[0.4em] font-bold mt-1.5 sm:mt-2 md:mt-4">
                {labels[label]}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
