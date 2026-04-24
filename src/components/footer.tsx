'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="text-center py-24 md:py-40 flex flex-col items-center relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="w-px h-20 md:h-24 mx-auto mb-10 md:mb-12"
          style={{
            background: 'linear-gradient(180deg, transparent, #b8860b, transparent)',
          }}
        />
        <p className="font-cursive text-5xl md:text-7xl text-goldLight mb-4 md:mb-6">Milu</p>
        <p className="text-[9px] md:text-[11px] uppercase tracking-[0.6em] md:tracking-[0.8em] text-gold font-bold">
          Montevideo • Uruguay • 2026
        </p>
      </motion.div>
    </footer>
  )
}
