'use client'
import { Calendar, MapPin, CheckCircle, Images } from 'lucide-react'

const navItems = [
  { icon: Calendar, href: '#detalles', label: 'Detalles' },
  { icon: MapPin, href: '#ubicacion', label: 'Ubicación' },
  { icon: Images, href: '#galeria', label: 'Galería' },
  { icon: CheckCircle, href: '#confirmar', label: 'Confirmar' },
]

export default function Navigation() {
  return (
    <nav
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] rounded-full px-5 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 flex gap-3 sm:gap-5 md:gap-6 items-center shadow-2xl border border-goldLight/15"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset',
      }}
    >
      {navItems.map(({ icon: Icon, href, label }) => (
        <a
          key={href}
          href={href}
          className="group flex items-center gap-2 text-gold/70 hover:text-bordeaux transition-all duration-300 p-1.5 sm:p-2 rounded-full hover:bg-bordeaux/5"
          aria-label={label}
        >
          <Icon
            size={18}
            strokeWidth={1.5}
            className="sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110"
          />
          <span className="hidden md:block text-[10px] uppercase tracking-[0.15em] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {label}
          </span>
        </a>
      ))}
    </nav>
  )
}
