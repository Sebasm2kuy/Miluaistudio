'use client'
import { motion } from 'framer-motion'

export default function Dedicatoria() {
  return (
    <section className="max-w-3xl mx-auto px-3 sm:px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-6 sm:p-8 md:p-16 text-center relative overflow-hidden"
      >
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: 'rgba(212,175,55,0.2)' }} />
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: 'rgba(212,175,55,0.2)' }} />
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: 'rgba(212,175,55,0.2)' }} />
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: 'rgba(212,175,55,0.2)' }} />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-serif italic text-xl sm:text-2xl md:text-4xl text-bordeaux mb-6 sm:mb-8 leading-relaxed"
        >
          &ldquo;Hay momentos que no se repiten, personas que no se olvidan y recuerdos que se guardan para siempre en el corazón.&rdquo;
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed mb-6 sm:mb-8 px-2 sm:px-4"
        >
          Cada persona que está leyendo esto es parte importante de mi historia. Los esperamos con toda la emoción del mundo para compartir juntos esta noche tan especial.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="h-px w-10 sm:w-16" style={{ background: 'linear-gradient(90deg, transparent, #d4af37)' }} />
          <p
            className="font-cursive text-2xl sm:text-3xl md:text-4xl"
            style={{
              background: 'linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fcf6ba, #bf953f)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 5s ease-in-out infinite',
            }}
          >
            Milagros
          </p>
          <div className="h-px w-10 sm:w-16" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
        </motion.div>
      </motion.div>
    </section>
  )
}
