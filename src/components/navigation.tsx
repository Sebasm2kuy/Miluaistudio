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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] rounded-full px-6 md:px-10 py-4 md:py-5 flex gap-6 md:gap-12 items-center shadow-2xl border border-goldLight/20"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {navItems.map(({ icon: Icon, href, label }) => (
        <a
          key={href}
          href={href}
          className="text-gold hover:text-bordeaux transition-all duration-300 hover:scale-125"
          aria-label={label}
        >
          <Icon size={22} strokeWidth={1.5} />
        </a>
      ))}
    </nav>
  )
}
