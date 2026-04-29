'use client'
import { useState, useEffect, useCallback } from 'react'
import { CalendarPlus } from 'lucide-react'

// Fecha del evento: 22 de Agosto 2026, 21:00 hs (hora de Uruguay, GMT-3)
const EVENT_MS = Date.UTC(2026, 7, 23, 0, 0, 0)
const labels: Record<string, string> = { D: 'Días', H: 'Horas', M: 'Min', S: 'Seg' }

function calcTimeLeft() {
  const diff = EVENT_MS - Date.now()
  if (diff <= 0) return { D: 0, H: 0, M: 0, S: 0 }
  return {
    D: Math.floor(diff / 86400000),
    H: Math.floor((diff / 3600000) % 24),
    M: Math.floor((diff / 60000) % 60),
    S: Math.floor((diff / 1000) % 60),
  }
}

function FlipUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0')
  const [key, setKey] = useState(0)
  const prevDisplay = useRef(display)

  useEffect(() => {
    if (prevDisplay.current !== display) {
      prevDisplay.current = display
      setKey(k => k + 1)
    }
  }, [display])

  return (
    <div className="flex flex-col items-center">
      <div
        className="p-2.5 sm:p-3 md:p-6 rounded-xl sm:rounded-[1.5rem] md:rounded-[2.5rem] border min-w-0 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(253,252,251,0.95) 49.5%, rgba(245,244,243,0.95) 50.5%, rgba(240,239,238,0.95) 100%)',
          borderColor: 'rgba(184, 134, 11, 0.08)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      >
        <div className="absolute left-1 sm:left-2 right-1 sm:right-2 top-1/2 h-px z-10" style={{ background: 'rgba(0,0,0,0.06)', boxShadow: '0 1px 0 rgba(255,255,255,0.5)' }} />
        <div className="flip-digit" style={{ perspective: '400px' }}>
          <div
            key={key}
            className="flip-digit-value"
            style={{ fontSize: 'clamp(1.1rem, 4.5vw, 4.5rem)' }}
          >
            <span className="font-light text-bordeaux tracking-tight tabular-nums leading-none select-none">
              {display}
            </span>
          </div>
        </div>
      </div>
      <div className="text-[7px] sm:text-[9px] md:text-xs uppercase text-gold tracking-[0.15em] sm:tracking-[0.3em] md:tracking-[0.4em] font-bold mt-1.5 sm:mt-2 md:mt-4">
        {label}
      </div>
    </div>
  )
}

// Need useRef for FlipUnit
import { useRef } from 'react'

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft)

  useEffect(() => {
    setTimeLeft(calcTimeLeft())
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  const addToCalendar = useCallback(() => {
    const url = new URL('https://www.google.com/calendar/render')
    url.searchParams.set('action', 'TEMPLATE')
    url.searchParams.set('text', 'XV Años de Milagros')
    url.searchParams.set('dates', '20260822T210000/20260823T060000')
    url.searchParams.set('location', 'Salón My Father, Granaderos 3875, Montevideo, Uruguay')
    url.searchParams.set('details', 'XV Años de Milagros Cabrera\nSalón My Father - Granaderos 3875, Montevideo\n21:00 hs\n\n¡Nos vemos!')
    window.open(url.toString(), '_blank')
  }, [])

  return (
    <section id="detalles" className="max-w-4xl mx-auto px-3 sm:px-4 relative z-10">
      <div className={`css-fade-up glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-24 text-center relative overflow-hidden`}>
        <h2 className="font-serif italic text-2xl sm:text-3xl md:text-5xl text-bordeaux mb-8 sm:mb-12 md:mb-16">
          El tiempo vuela...
        </h2>
        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-6 stagger">
          {Object.entries(timeLeft).map(([label, val]) => (
            <div key={label} className="css-fade-up">
              <FlipUnit value={val} label={labels[label]} />
            </div>
          ))}
        </div>
        <div className={`css-fade-up mt-8 sm:mt-12 md:mt-16`}>
          <button
            onClick={addToCalendar}
            className="inline-flex items-center gap-2 sm:gap-3 text-gold font-bold text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest border-2 px-5 sm:px-7 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full hover:bg-gold/5 active:scale-95 transition-all duration-200"
            style={{ borderColor: 'rgba(184, 134, 11, 0.25)' }}
          >
            <CalendarPlus size={14} strokeWidth={1.5} />
            Agregar al calendario
          </button>
        </div>
      </div>
    </section>
  )
}
