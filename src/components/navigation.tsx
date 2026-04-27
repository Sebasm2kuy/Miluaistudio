'use client'
import { Calendar, MapPin, CheckCircle, Images, Music, ArrowUp } from 'lucide-react'

const navItems = [
  { icon: Calendar, href: '#detalles', label: 'Detalles' },
  { icon: MapPin, href: '#ubicacion', label: 'Ubicación' },
  { icon: Images, href: '#galeria', label: 'Galería' },
  { icon: Music, href: '#musica', label: 'Música' },
  { icon: CheckCircle, href: '#confirmar', label: 'Confirmar' },
]

export default function Navigation() {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) {
      const navHeight = 80
      const y = el.getBoundingClientRect().top + window.scrollY - navHeight
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <nav
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] rounded-full px-3 sm:px-5 md:px-7 py-2.5 sm:py-3 md:py-3.5 flex items-center shadow-2xl border border-goldLight/12"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset',
      }}
    >
      {navItems.map(({ icon: Icon, href, label }) => (
        <a
          key={href}
          href={href}
          onClick={(e) => handleClick(e, href)}
          className="group relative flex items-center gap-1.5 text-gold/70 hover:text-bordeaux transition-all duration-300 p-2 sm:p-2.5 rounded-full hover:bg-bordeaux/5"
          aria-label={label}
        >
          <Icon size={17} strokeWidth={1.5} className="sm:w-[18px] sm:h-[18px] transition-transform duration-300 group-hover:scale-110" />
          {/* Mobile/tablet tooltip */}
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] uppercase tracking-[0.15em] font-semibold text-white/80 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap md:hidden">
            {label}
          </span>
          {/* Desktop label */}
          <span className="hidden md:block text-[9px] uppercase tracking-[0.15em] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {label}
          </span>
        </a>
      ))}

      {/* Separator */}
      <div className="w-px h-4 bg-goldLight/15 mx-0.5" />

      {/* Back to top */}
      <button
        onClick={scrollToTop}
        className="text-gold/50 hover:text-bordeaux transition-all duration-300 p-2 sm:p-2.5 rounded-full hover:bg-bordeaux/5"
        aria-label="Volver arriba"
      >
        <ArrowUp size={15} strokeWidth={1.5} className="transition-transform duration-300 hover:-translate-y-0.5" />
      </button>
    </nav>
  )
}
