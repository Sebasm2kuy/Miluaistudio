'use client'
import { Instagram } from 'lucide-react'
import { useConfig } from '@/hooks/useConfig'

/**
 * Sección de Instagram: perfil + hashtag para juntar las fotos de los invitados.
 * Solo se renderiza cuando la config trae `instagram.usuario`
 * (el personalizador la arma; las demos y las invitaciones viejas no la tienen).
 */
export default function InstagramSection() {
  const cfg = useConfig()
  const ig = cfg.instagram
  if (!ig || !ig.usuario) return null
  const hashtag = cfg.evento.hashtag
  const esHashtagReal = hashtag && !hashtag.includes('Muestra')
  return (
    <section id="instagram" className="max-w-3xl mx-auto px-3 sm:px-4 relative z-10">
      <div className="css-fade-up glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-6 sm:p-10 md:p-16 text-center relative overflow-hidden">
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-gold mx-auto"
          style={{ background: 'color-mix(in srgb, var(--theme-accent, #b8860b) 8%, transparent)' }}
        >
          <Instagram size={24} strokeWidth={1.5} />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-bordeaux italic mt-4 sm:mt-5">
          Compartí tu noche
        </h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-xs md:text-sm leading-relaxed px-2" style={{ color: 'var(--theme-card-muted)' }}>
          Seguí <span className="text-gold font-semibold">{ig.usuario.startsWith('@') ? ig.usuario : '@' + ig.usuario}</span>
          {esHashtagReal ? (
            <> y etiquetá tus fotos con <span className="text-gold font-semibold">{hashtag}</span> para que queden todas juntas.</>
          ) : (
            ' para ver y revivir todos los momentos de la celebración.'
          )}
        </p>
        <a
          href={ig.url}
          target="_blank"
          rel="noreferrer"
          className="gold-button inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full mt-5 sm:mt-6 text-white font-semibold uppercase tracking-[0.15em] text-xs sm:text-[11px]"
        >
          <Instagram size={15} strokeWidth={1.8} /> Seguir en Instagram
        </a>
      </div>
    </section>
  )
}
