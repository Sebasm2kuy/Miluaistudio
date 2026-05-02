'use client'

export default function Dedicatoria() {
  return (
    <section className="max-w-3xl mx-auto px-3 sm:px-4 relative z-10">
      <div
        className={`css-fade-up rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-6 sm:p-8 md:p-16 text-center relative overflow-hidden`}
        style={{
          background: 'linear-gradient(180deg, rgba(61,2,2,0.92) 0%, rgba(30,1,1,0.95) 100%)',
          border: '1px solid rgba(212,175,55,0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Corner decorations — brighter gold on dark */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: 'rgba(212,175,55,0.35)' }} />
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: 'rgba(212,175,55,0.35)' }} />
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: 'rgba(212,175,55,0.35)' }} />
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: 'rgba(212,175,55,0.35)' }} />

        {/* Subtle vignette glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at center, rgba(212,175,55,0.04) 0%, transparent 70%)',
          }}
        />

        <p className={`css-fade font-serif italic text-[1.35rem] sm:text-2xl md:text-4xl mb-6 sm:mb-8 leading-relaxed relative z-10`} style={{ color: '#fcf6ba' }}>
          &ldquo;Hay momentos que no se repiten, personas que no se olvidan y recuerdos que se guardan para siempre en el coraz&oacute;n.&rdquo;
        </p>

        <p className={`css-fade text-sm sm:text-sm md:text-base leading-relaxed mb-6 sm:mb-8 px-2 sm:px-4 relative z-10`} style={{ color: 'rgba(232,212,139,0.65)' }}>
          Cada persona que est&aacute; leyendo esto es parte importante de mi historia. Los esperamos con toda la emoci&oacute;n del mundo para compartir juntos esta noche tan especial.
        </p>

        <div className={`css-fade-up flex items-center justify-center gap-3 relative z-10`}>
          <div className="h-px w-10 sm:w-16" style={{ background: 'linear-gradient(90deg, transparent, #d4af37)' }} />
          <p className="font-cursive text-2xl sm:text-3xl md:text-4xl text-shimmer text-shimmer-once">
            Milagros
          </p>
          <div className="h-px w-10 sm:w-16" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
        </div>
      </div>
    </section>
  )
}
