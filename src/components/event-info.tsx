'use client'
import { Calendar, MapPin, Shirt } from 'lucide-react'
import { useConfig } from '@/hooks/useConfig'
import Editable from '@/components/editor/Editable'

export default function EventInfo() {
  const cfg = useConfig()
  const mapQuery = encodeURIComponent(`${cfg.evento.direccion}, ${cfg.evento.ubicacion}`)
  const mapEmbedUrl = cfg.evento.mapsEmbedUrl || `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`
  return (
    <section id="ubicacion" className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
      <div className={`css-fade-up glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-24 text-center relative overflow-hidden`}>
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-20 items-start">
          <div className="text-left space-y-6 sm:space-y-10 md:space-y-14">
            {/* Date */}
            <Editable id="ubicacion.fecha">
              <div className={`css-fade-left flex items-start gap-3 sm:gap-4 md:gap-6`}>
                <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-gold shrink-0" style={{ background: 'color-mix(in srgb, var(--theme-accent, #b8860b) 8%, transparent)' }}>
                  <Calendar size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-xl md:text-3xl text-bordeaux italic">La Gran Noche</h3>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-sm sm:text-[11px] md:text-xs mt-2">
                    {cfg.evento.fecha} &bull; {cfg.evento.fechaEvento.split(' ')[1]} hs
                  </p>
                </div>
              </div>
            </Editable>

            {/* Location */}
            <Editable id="ubicacion.lugar">
              <div className={`css-fade-left flex items-start gap-3 sm:gap-4 md:gap-6`}>
                <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-gold shrink-0" style={{ background: 'color-mix(in srgb, var(--theme-accent, #b8860b) 8%, transparent)' }}>
                  <MapPin size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-xl md:text-3xl text-bordeaux italic">{cfg.evento.lugar}</h3>
                  {cfg.evento.direccion && cfg.evento.direccion !== cfg.evento.lugar && (
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm sm:text-[11px] md:text-xs mt-2">
                      {cfg.evento.direccion}
                    </p>
                  )}
                </div>
              </div>
            </Editable>

            {/* Dress Code */}
            <Editable id="ubicacion.dresscode">
              <div className={`css-fade-left flex items-start gap-3 sm:gap-4 md:gap-6`}>
                <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-gold shrink-0" style={{ background: 'color-mix(in srgb, var(--theme-accent, #b8860b) 8%, transparent)' }}>
                  <Shirt size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-xl md:text-3xl text-bordeaux italic">{cfg.evento.dressCode || 'Gala / Elegante'}</h3>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-sm sm:text-[11px] md:text-xs mt-2">
                    Código de Vestimenta
                  </p>
                </div>
              </div>
            </Editable>

            {/* CTA Button */}
            <Editable id="ubicacion.boton">
              <div className={`css-fade-up`}>
                <button
                  type="button"
                  onClick={() => window.open(cfg.evento.mapsUrl, '_blank')}
                  className="gold-button w-full py-3.5 sm:py-4 md:py-5 rounded-xl sm:rounded-xl md:rounded-2xl mt-2 text-white font-semibold uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] text-sm sm:text-sm md:text-sm"
                >
                  Cómo llegar
                </button>
              </div>
            </Editable>
          </div>

          {/* Map — static grayscale, NO transition (animated filter on iframe kills scroll perf).
              En modo edición el mapa queda inerte: el Editable captura el tap
              (los hijos con pointer-events none) y abre el editor del enlace. */}
          <Editable id="ubicacion.mapa">
            <div className={`css-fade-up h-[280px] sm:h-[350px] md:h-[500px] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] overflow-hidden border shadow-2xl relative group cursor-pointer grayscale`} style={{ borderColor: 'color-mix(in srgb, var(--theme-accent, #b8860b) 10%, transparent)' }} onClick={() => window.open(cfg.evento.mapsUrl, '_blank')}>
              <iframe
                src={mapEmbedUrl}
                title="Mapa del evento"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Editable>
        </div>
      </div>
    </section>
  )
}
