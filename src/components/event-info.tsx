'use client'

import { motion } from 'framer-motion'
import { Calendar, MapPin, Shirt } from 'lucide-react'

export default function EventInfo() {
  return (
    <section id="ubicacion" className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-24 text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(184, 134, 11, 0.15)',
        }}
      >
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-20 items-center">
          <div className="text-left space-y-6 sm:space-y-10 md:space-y-14">
            {/* Date */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-start gap-3 sm:gap-4 md:gap-6"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-gold shrink-0"
                style={{ background: 'rgba(184, 134, 11, 0.1)' }}
              >
                <Calendar size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl md:text-3xl text-bordeaux italic">La Gran Noche</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs mt-1">
                  22 de Agosto • 21:00 hs
                </p>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-start gap-3 sm:gap-4 md:gap-6"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-gold shrink-0"
                style={{ background: 'rgba(184, 134, 11, 0.1)' }}
              >
                <MapPin size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl md:text-3xl text-bordeaux italic">Salón My Father</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs mt-1">
                  Granaderos 3875, Montevideo
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <button
                onClick={() => window.open('https://maps.app.goo.gl/uXq5HCuF54u8DqJj8', '_blank')}
                className="w-full py-3 sm:py-4 md:py-6 rounded-xl sm:rounded-xl md:rounded-2xl mt-4 text-white font-semibold uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] text-[11px] sm:text-xs md:text-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #8a6b0d 0%, #b8860b 50%, #d4af37 100%)',
                  boxShadow: '0 10px 20px rgba(138, 107, 13, 0.3)',
                }}
              >
                Cómo llegar
              </button>
            </motion.div>

            {/* Dress Code */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center gap-3 sm:gap-4 md:gap-6 p-4 sm:p-5 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border"
              style={{
                background: 'rgba(184, 134, 11, 0.05)',
                borderColor: 'rgba(184, 134, 11, 0.1)',
              }}
            >
              <Shirt size={20} className="sm:w-6 sm:h-6 text-gold shrink-0" strokeWidth={1.5} />
              <div>
                <h4 className="font-bold text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] text-gold mb-1">
                  Código de Vestimenta
                </h4>
                <p className="font-serif italic text-base sm:text-lg md:text-xl text-bordeaux">Gala / Elegante</p>
              </div>
            </motion.div>
          </div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-[280px] sm:h-[350px] md:h-[500px] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3272.775837651817!2d-56.1706!3d-34.8878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81ca99f2b8f3%3A0x6a1f893e3e3e3e3e!2sSal%C3%B3n%20My%20Father!5e0!3m2!1ses!2suy!4v1710000000000!5m2!1ses!2suy"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
