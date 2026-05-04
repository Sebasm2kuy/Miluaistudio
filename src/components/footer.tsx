'use client'
import config from '@/data/config'

export default function Footer() {
  return (
    <footer className="text-center py-16 sm:py-24 md:py-36 flex flex-col items-center relative z-10">
      {/* Semi-transparent dark background overlay for readability */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.9) 100%)' }}
      />
      <div className={`css-fade-up flex flex-col items-center relative z-10`}>
        <p
          className="font-cursive text-5xl sm:text-7xl md:text-8xl mb-4 sm:mb-6 text-shimmer text-shimmer-once"
          style={{ textShadow: '0 0 30px rgba(0,0,0,0.95)' }}
        >
          {config.footer.apodo}
        </p>

        <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className="h-px w-12 sm:w-16 md:w-20" style={{ background: 'linear-gradient(90deg, transparent, #fcf6ba, #d4af37)' }} />
          <div className="w-1.5 h-1.5 rotate-45 bg-goldLight/70" />
          <div className="h-px w-12 sm:w-16 md:w-20" style={{ background: 'linear-gradient(90deg, #d4af37, #fcf6ba, transparent)' }} />
        </div>

        <p
          className="uppercase tracking-[0.4em] sm:tracking-[0.6em] md:tracking-[0.8em] text-sm sm:text-sm md:text-base font-bold text-shimmer text-shimmer-once"
          style={{ textShadow: '0 0 20px rgba(0,0,0,0.95)' }}
        >
          {config.footer.ubicacion}
        </p>

        <p
          className="mt-5 sm:mt-6 md:mt-8 text-base sm:text-base md:text-lg font-serif italic text-shimmer text-shimmer-once"
          style={{ textShadow: '0 0 20px rgba(0,0,0,0.95)' }}
        >
          {config.footer.frase}
        </p>

        <a
          href={config.evento.hashtagUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 sm:mt-10 md:mt-14 flex items-center gap-2 sm:gap-3 group"
        >
          {/* Elegant Instagram icon */}
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 sm:w-6 sm:h-6 text-goldLight/80 group-hover:text-goldLight transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
          </svg>
          <p className="font-cursive text-xl sm:text-xl md:text-2xl tracking-[0.15em] sm:tracking-[0.25em] text-shimmer text-shimmer-once group-hover:opacity-90 transition-opacity duration-300">
            {config.evento.hashtag}
          </p>
        </a>
      </div>
    </footer>
  )
}
