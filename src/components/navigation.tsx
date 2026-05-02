'use client'
import { Calendar, MapPin, CheckCircle, Images, Music, ArrowUp } from 'lucide-react'
import { type RefObject } from 'react'

const navItems = [
  { icon: Calendar, href: '#detalles', label: 'Detalles' },
  { icon: MapPin, href: '#ubicacion', label: 'Ubicación' },
  { icon: Images, href: '#galeria', label: 'Galería' },
  { icon: Music, href: '#musica', label: 'Música' },
  { icon: CheckCircle, href: '#confirmar', label: 'Confirmar' },
]

interface NavigationProps {
  hidden?: boolean
  scrollContainer?: RefObject<HTMLDivElement | null>
}

export default function Navigation({ hidden = false, scrollContainer }: NavigationProps) {
  const getScrollEl = () => scrollContainer?.current ?? window

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = getScrollEl()
    if (el instanceof HTMLElement) {
      el.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const el = getScrollEl()
    const target = document.querySelector(href)
    if (target) {
      const navHeight = 80
      const scrollEl = el instanceof HTMLElement ? el : document.documentElement
      const y = target.getBoundingClientRect().top + scrollEl.scrollTop - navHeight
      scrollEl.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <nav
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] rounded-full px-2 sm:px-5 md:px-7 py-2 sm:py-3 md:py-3.5 flex items-center shadow-2xl border border-goldLight/12"
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        transform: hidden ? 'translateX(-50%) translateY(120px)' : 'translateX(-50%) translateY(0)',
        transition: 'transform 0.3s ease',
      }}
    >
      {navItems.map(({ icon: Icon, href, label }) => (
        <a
          key={href}
          href={href}
          onClick={(e) => handleClick(e, href)}
          className="group flex flex-col items-center gap-0 text-gold/70 hover:text-bordeaux transition-colors duration-200 p-1.5 sm:p-2.5 rounded-full hover:bg-bordeaux/5 active:scale-90"
          aria-label={label}
        >
          <Icon size={17} strokeWidth={1.5} className="sm:w-[18px] sm:h-[18px]" />
          {/* Mobile: always-visible small label */}
          <span className="text-[8px] sm:hidden uppercase tracking-[0.05em] font-semibold leading-none mt-0.5">
            {label}
          </span>
          {/* Desktop: hover label */}
          <span className="hidden sm:hidden md:block text-[9px] uppercase tracking-[0.15em] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap mt-0.5">
            {label}
          </span>
        </a>
      ))}

      <div className="w-px h-5 sm:h-4 bg-goldLight/15 mx-0.5" />

      <button
        onClick={scrollToTop}
        className="text-gold/50 hover:text-bordeaux transition-colors duration-200 p-1.5 sm:p-2.5 rounded-full hover:bg-bordeaux/5 active:scale-90 flex flex-col items-center"
        aria-label="Volver arriba"
      >
        <ArrowUp size={15} strokeWidth={1.5} />
        <span className="text-[7px] sm:hidden uppercase tracking-[0.05em] font-semibold leading-none mt-0.5">Top</span>
      </button>
    </nav>
  )
}
