'use client'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Shirt } from 'lucide-react'

export default function EventInfo() {
  return (
    <section id="ubicacion" className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-24 text-center relative overflow-hidden"
      >
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-20 items-start">
          {/* Left column */}
          <div className="text-left space-y-6 sm:space-y-10 md:space-y-14">
            {/* Date */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group flex items-start gap-3 sm:gap-4 md:gap-6"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-gold shrink-0 transition-transform duration-500 group-hover:scale-110"
                style={{ background: 'rgba(184, 134, 11, 0.08)' }}>
                <Calendar size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl md:text-3xl text-bordeaux italic">La Gran Noche</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs mt-1.5">
                  Sábado 22 de Agosto &bull; 21:00 hs
                </p>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="group flex items-start gap-3 sm:gap-4 md:gap-6"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-gold shrink-0 transition-transform duration-500 group-hover:scale-110"
                style={{ background: 'rgba(184, 134, 11, 0.08)' }}>
                <MapPin size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl md:text-3xl text-bordeaux italic">Salón My Father</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs mt-1.5">
                  Granaderos 3875, Montevideo
                </p>
              </div>
            </motion.div>

            {/* Dress Code */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="group flex items-center gap-3 sm:gap-4 md:gap-6 p-4 sm:p-5 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border transition-all duration-500 hover:border-goldLight/20"
              style={{ background: 'rgba(184, 134, 11, 0.03)', borderColor: 'rgba(184, 134, 11, 0.08)' }}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110"
                style={{ background: 'rgba(184, 134, 11, 0.08)' }}>
                <Shirt size={18} className="sm:w-5 sm:h-5 text-gold" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-bold text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] text-gold mb-1">
                  Código de Vestimenta
                </h4>
                <p className="font-serif italic text-base sm:text-lg md:text-xl text-bordeaux">Gala / Elegante</p>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <button
                onClick={() => window.open('https://maps.app.goo.gl/uXq5HCuF54u8DqJj8', '_blank')}
                className="gold-button w-full py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-xl md:rounded-2xl mt-2 text-white font-semibold uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] text-[11px] sm:text-xs md:text-sm"
              >
                Cómo llegar
              </button>
            </motion.div>
          </div>

          {/* Right column - Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-[280px] sm:h-[350px] md:h-[500px] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] overflow-hidden border shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 relative group cursor-pointer"
            style={{ borderColor: 'rgba(184, 134, 11, 0.1)' }}
            onClick={() => window.open('https://maps.app.goo.gl/uXq5HCuF54u8DqJj8', '_blank')}
          >
            <iframe
              src="https://maps.google.com/maps?q=Salon+My+Father+Granaderos+3875+Montevideo+Uruguay&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
