'use client'
import { Calendar, MapPin, Shirt } from 'lucide-react'

export default function EventInfo() {
  return (
    <section id="ubicacion" className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
      <div className={`css-fade-up glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-24 text-center relative overflow-hidden`}>
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-20 items-start">
          <div className="text-left space-y-6 sm:space-y-10 md:space-y-14">
            {/* Date */}
            <div className={`css-fade-left flex items-start gap-3 sm:gap-4 md:gap-6`}>
              <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-gold shrink-0" style={{ background: 'rgba(184, 134, 11, 0.08)' }}>
                <Calendar size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl md:text-3xl text-bordeaux italic">La Gran Noche</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs sm:text-[11px] md:text-xs mt-1.5">
                  Sábado 22 de Agosto &bull; 21:00 hs
                </p>
              </div>
            </div>

            {/* Location */}
            <div className={`css-fade-left flex items-start gap-3 sm:gap-4 md:gap-6`}>
              <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-gold shrink-0" style={{ background: 'rgba(184, 134, 11, 0.08)' }}>
                <MapPin size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl md:text-3xl text-bordeaux italic">Salón My Father</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs sm:text-[11px] md:text-xs mt-1.5">
                  Granaderos 3875, Montevideo
                </p>
              </div>
            </div>

            {/* Dress Code */}
            <div className={`css-fade-left flex items-start gap-3 sm:gap-4 md:gap-6`}>
              <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-gold shrink-0" style={{ background: 'rgba(184, 134, 11, 0.08)' }}>
                <Shirt size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl md:text-3xl text-bordeaux italic">Gala / Elegante</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs sm:text-[11px] md:text-xs mt-1.5">
                  Código de Vestimenta
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className={`css-fade-up`}>
              <button
                onClick={() => window.open('https://maps.app.goo.gl/uXq5HCuF54u8DqJj8', '_blank')}
                className="gold-button w-full py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-xl md:rounded-2xl mt-2 text-white font-semibold uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] text-xs sm:text-xs md:text-sm"
              >
                Cómo llegar
              </button>
            </div>
          </div>

          {/* Map — static grayscale, NO transition (animated filter on iframe kills scroll perf) */}
          <div className={`css-fade-up h-[280px] sm:h-[350px] md:h-[500px] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] overflow-hidden border shadow-2xl relative group cursor-pointer grayscale`} style={{ borderColor: 'rgba(184, 134, 11, 0.1)' }} onClick={() => window.open('https://maps.app.goo.gl/uXq5HCuF54u8DqJj8', '_blank')}>
            <iframe
              src="https://maps.google.com/maps?q=Salon+My+Father+Granaderos+3875+Montevideo+Uruguay&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
