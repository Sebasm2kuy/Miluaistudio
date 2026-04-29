'use client'
import { motion } from 'framer-motion'

const TIMELINE = [
  { time: '21:00', title: 'Recepción', desc: 'Ingreso de invitados', icon: '🥂' },
  { time: '22:00', title: 'Mi Ingreso', desc: 'La noche comienza', icon: '👑' },
  { time: '02:00', title: 'Espejo Mágico', desc: 'Las mejores fotos', icon: '📸' },
]

export default function Timeline() {
  return (
    <section id="horarios" className="max-w-3xl mx-auto px-3 sm:px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-20 text-center relative overflow-hidden"
      >
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif italic text-2xl sm:text-3xl md:text-5xl text-bordeaux mb-2 sm:mb-3"
        >
          La Noche
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-gray-400 italic mb-8 sm:mb-12 md:mb-16 text-xs sm:text-sm md:text-base"
        >
          Cada momento cuenta
        </motion.p>

        <div className="relative">
          <div
            className="absolute left-5 sm:left-6 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px"
            style={{ background: 'linear-gradient(to bottom, transparent, #d4af37 15%, #d4af37 85%, transparent)' }}
          />
          <div className="space-y-6 sm:space-y-8 md:space-y-10">
            {TIMELINE.map((item, idx) => (
              <motion.div
                key={item.time}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + idx * 0.15 }}
                className={`relative flex items-start gap-4 sm:gap-5 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className="absolute left-5 sm:left-6 md:left-1/2 -translate-x-1/2 top-1 z-10">
                  <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-goldLight bg-white" style={{ boxShadow: '0 0 10px rgba(212,175,55,0.3)' }} />
                </div>
                <div className={`ml-12 sm:ml-14 md:ml-0 md:w-[45%] ${idx % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left md:ml-auto'}`}>
                  <div className={`inline-block px-4 sm:px-5 py-3 sm:py-4 md:py-5 rounded-2xl sm:rounded-2xl md:rounded-3xl border text-left ${idx % 2 === 0 ? 'md:text-right' : ''}`}
                    style={{ background: 'rgba(253,252,251,0.85)', borderColor: 'rgba(184, 134, 11, 0.1)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                      <motion.span
                        animate={{ y: [0, -5, 0], rotate: [0, 2, -2, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.8 }}
                        className="text-lg sm:text-xl md:text-2xl"
                      >{item.icon}</motion.span>
                      <span className="font-bold text-bordeaux tabular-nums" style={{ fontSize: 'clamp(0.85rem, 3vw, 1.4rem)' }}>{item.time} hs</span>
                    </div>
                    <p className="font-serif italic text-bordeaux text-sm sm:text-base md:text-lg">{item.title}</p>
                    <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm mt-0.5 uppercase tracking-widest">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
