'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const EVENT_DATE = new Date('2026-08-22T21:00:00')

const labels: Record<string, string> = {
  D: 'Días',
  H: 'Horas',
  M: 'Min',
  S: 'Seg',
}

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
    <section id="detalles" className="max-w-5xl mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="rounded-[2rem] md:rounded-[4rem] p-8 md:p-24 text-center relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(184, 134, 11, 0.15)',
        }}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 opacity-40"
          style={{
            background: 'linear-gradient(90deg, transparent, #b8860b, transparent)',
          }}
        />

        <h2 className="font-serif italic text-3xl md:text-6xl text-bordeaux mb-12 md:mb-16">
          El tiempo vuela...
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
          {Object.entries(timeLeft).map(([label, val], idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border shadow-sm"
              style={{
                background: 'rgba(253, 252, 251, 0.8)',
                borderColor: 'rgba(184, 134, 11, 0.1)',
              }}
            >
              <div className="text-4xl md:text-8xl font-light text-bordeaux tracking-tighter tabular-nums">
                {String(val).padStart(2, '0')}
              </div>
              <div className="text-[9px] md:text-xs uppercase text-gold tracking-[0.3em] md:tracking-[0.4em] font-bold mt-3 md:mt-4 italic">
                {labels[label]}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
