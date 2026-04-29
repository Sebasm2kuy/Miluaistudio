'use client'

export default function Footer() {
  return (
    <footer className="text-center py-16 sm:py-24 md:py-36 flex flex-col items-center relative z-10">
      <div className={`css-fade-up flex flex-col items-center`}>
        <p className="font-cursive text-4xl sm:text-6xl md:text-8xl mb-4 sm:mb-6 text-shimmer text-shimmer-once" style={{ filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.95))' }}>
          Milu
        </p>

        <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className="h-px w-12 sm:w-16 md:w-20" style={{ background: 'linear-gradient(90deg, transparent, #fcf6ba, #d4af37)', boxShadow: '0 0 8px rgba(252,246,186,0.3)' }} />
          <div className="w-1.5 h-1.5 rotate-45 bg-goldLight/70" style={{ boxShadow: '0 0 6px rgba(212,175,55,0.4)' }} />
          <div className="h-px w-12 sm:w-16 md:w-20" style={{ background: 'linear-gradient(90deg, #d4af37, #fcf6ba, transparent)', boxShadow: '0 0 8px rgba(252,246,186,0.3)' }} />
        </div>

        <p className="uppercase tracking-[0.4em] sm:tracking-[0.6em] md:tracking-[0.8em] text-xs sm:text-sm md:text-base font-bold text-shimmer text-shimmer-once" style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.95))' }}>
          Montevideo &bull; Uruguay &bull; 2026
        </p>

        <p className="mt-5 sm:mt-6 md:mt-8 text-sm sm:text-base md:text-lg font-serif italic text-shimmer text-shimmer-once" style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.95))' }}>
          Con amor, para un día inolvidable
        </p>

        <div className={`css-fade mt-8 sm:mt-10 md:mt-14`}>
          <p className="font-light tracking-[0.15em] sm:tracking-[0.25em] text-xs sm:text-sm md:text-base text-shimmer text-shimmer-infinite">
            #MilagrosXV2026
          </p>
        </div>
      </div>
    </footer>
  )
}
