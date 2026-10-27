'use client'
import { useConfig } from '@/hooks/useConfig'
import Editable from '@/components/editor/Editable'

export default function Dedicatoria() {
  const cfg = useConfig()
  const light = cfg.estilos.modoClaro === true
  return (
    <section className="max-w-3xl mx-auto px-3 sm:px-4 relative z-10">
      <div
        className={`css-fade-up rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-6 sm:p-8 md:p-16 text-center relative overflow-hidden`}
        style={{
          background: light
            ? 'linear-gradient(180deg, rgba(255,255,255,0.97) 0%, color-mix(in srgb, var(--theme-background, #f5f2ec) 72%, #ffffff) 100%)'
            : 'linear-gradient(180deg, color-mix(in srgb, var(--theme-primary, #3d0202) 92%, black) 0%, color-mix(in srgb, var(--theme-background, #050505) 75%, var(--theme-primary, #3d0202)) 100%)',
          border: '1px solid color-mix(in srgb, var(--theme-accent, #b8860b) 15%, transparent)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Corner decorations — brighter gold on dark */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: 'color-mix(in srgb, var(--theme-accent-light, var(--theme-accent-light, #d4af37)) 35%, transparent)' }} />
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: 'color-mix(in srgb, var(--theme-accent-light, var(--theme-accent-light, #d4af37)) 35%, transparent)' }} />
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: 'color-mix(in srgb, var(--theme-accent-light, var(--theme-accent-light, #d4af37)) 35%, transparent)' }} />
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: 'color-mix(in srgb, var(--theme-accent-light, var(--theme-accent-light, #d4af37)) 35%, transparent)' }} />

        {/* Subtle vignette glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at center, color-mix(in srgb, var(--theme-accent-light, var(--theme-accent-light, #d4af37)) 4%, transparent) 0%, transparent 70%)',
          }}
        />

        <Editable id="dedicatoria.cita">
          <p className={`css-fade font-serif italic text-[1.75rem] sm:text-2xl md:text-4xl mb-8 sm:mb-8 leading-relaxed relative z-10`} style={{ color: light ? 'var(--theme-primary)' : 'var(--theme-highlight, #fcf6ba)' }}>
            &ldquo;{cfg.dedicatoria.cita}&rdquo;
          </p>
        </Editable>

        <Editable id="dedicatoria.cuerpo">
          <p className={`css-fade text-base sm:text-base md:text-base leading-relaxed mb-8 sm:mb-8 px-2 sm:px-4 relative z-10`} style={{ color: light ? 'color-mix(in srgb, var(--theme-primary) 80%, var(--theme-ivory))' : 'color-mix(in srgb, var(--theme-highlight, #e8d48b) 65%, transparent)' }}>
            {cfg.dedicatoria.cuerpo}
          </p>
        </Editable>

        <Editable id="dedicatoria.firma">
          <div className={`css-fade-up flex items-center justify-center gap-3 relative z-10`}>
            <div className="h-px w-10 sm:w-16" style={{ background: 'linear-gradient(90deg, transparent, var(--theme-accent-light, #d4af37))' }} />
            <p className={`font-cursive text-3xl sm:text-3xl md:text-4xl ${light ? '' : 'text-shimmer text-shimmer-once'}`} style={light ? { color: 'var(--theme-accent)' } : undefined}>
              {cfg.dedicatoria.firma}
            </p>
            <div className="h-px w-10 sm:w-16" style={{ background: 'linear-gradient(90deg, var(--theme-accent-light, #d4af37), transparent)' }} />
          </div>
        </Editable>
      </div>
    </section>
  )
}
