'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Copy, Check, Send, Loader2 } from 'lucide-react'

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxOPx5jE1vcgW4nUfXWDkbKqQU8Ejex9RLI4rv64yZweZLFEiKrCoDj_8b7fryti3Sn/exec'

export default function Rsvp() {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !telefono.trim()) return

    setStatus('sending')
    try {
      const res = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
        }),
      })
      if (res.ok) {
        setStatus('ok')
        setNombre('')
        setTelefono('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 4000)
  }

  const copyNumber = () => {
    navigator.clipboard.writeText('145920')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const glassCard: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.96)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(184, 134, 11, 0.12)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5) inset',
  }

  return (
    <section id="confirmar" className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-10">

        {/* Confirmar Asistencia */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-16 text-center flex flex-col justify-center relative overflow-hidden"
          style={{ ...glassCard, borderBottomWidth: '3px', borderBottomColor: '#b8860b' }}
        >
          <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl text-bordeaux italic mb-2 sm:mb-3">Confirmar</h2>
          <p className="text-gray-400 mb-6 sm:mb-8 md:mb-12 italic leading-relaxed text-xs sm:text-sm md:text-base">
            Espero poder contar contigo para hacer de esta noche algo inolvidable.
          </p>

          {status === 'ok' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 sm:py-16"
            >
              <div className="text-5xl sm:text-6xl mb-4">
                <Heart className="inline text-bordeaux" fill="currentColor" size={48} strokeWidth={1} />
              </div>
              <p className="text-bordeaux font-serif text-xl sm:text-2xl italic mb-2">
                ¡Gracias, {nombre}!
              </p>
              <p className="text-gray-400 text-xs sm:text-sm italic">
                Tu confirmación quedó registrada
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-left">
              <div>
                <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gold font-bold mb-1.5 sm:mb-2">
                  Tu nombre *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="elegant-input w-full px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-xl border text-sm text-bordeaux bg-gray-50 focus:outline-none placeholder:text-gray-300"
                  style={{ borderColor: 'rgba(184, 134, 11, 0.15)' }}
                  placeholder="Ej: María González"
                />
              </div>

              <div>
                <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gold font-bold mb-1.5 sm:mb-2">
                  Tu teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="elegant-input w-full px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-xl border text-sm text-bordeaux bg-gray-50 focus:outline-none placeholder:text-gray-300"
                  style={{ borderColor: 'rgba(184, 134, 11, 0.15)' }}
                  placeholder="Ej: 099 123 456"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="gold-button w-full py-4 sm:py-5 md:py-7 rounded-full flex items-center justify-center gap-2 sm:gap-3 text-white font-semibold tracking-[0.1em] sm:tracking-[0.15em] text-[11px] sm:text-xs md:text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 10px 30px rgba(138, 107, 13, 0.35)' }}
              >
                {status === 'sending' ? (
                  <><Loader2 size={14} className="animate-spin" /> Enviando...</>
                ) : (
                  <><Send size={14} className="sm:w-4 sm:h-4" strokeWidth={1.5} /> Confirmar asistencia</>
                )}
              </button>

              {status === 'error' && (
                <p className="text-red-500 text-[10px] sm:text-xs text-center italic">
                  Hubo un error, intentá de nuevo
                </p>
              )}
            </form>
          )}

          <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold text-gold/40 italic mt-4 sm:mt-5">
            Favor confirmar antes del 10/08
          </p>
        </motion.div>

        {/* Colaboración */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-16 text-center flex flex-col justify-center relative overflow-hidden"
          style={{
            ...glassCard,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(253,252,251,0.98))',
          }}
        >
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-bordeaux italic mb-4 sm:mb-6">
            Colaboración
          </h2>
          <p className="text-gray-400 mb-6 sm:mb-10 italic text-[11px] sm:text-xs md:text-sm px-2 sm:px-4 leading-relaxed">
            &ldquo;Tu presencia es mi mayor regalo. Si deseas ayudarme con mi viaje de sueños...&rdquo;
          </p>

          <div
            className="bg-white p-5 sm:p-8 md:p-12 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3.5rem] border relative overflow-hidden"
            style={{
              borderColor: 'rgba(184, 134, 11, 0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <p className="text-gold font-bold uppercase text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] mb-2 sm:mb-3 md:mb-4 italic">
              Colectivo Abitab
            </p>

            <p className="text-4xl sm:text-5xl md:text-7xl font-light text-bordeaux tracking-tighter mb-5 sm:mb-8 md:mb-12 tabular-nums">
              145920
            </p>

            <button
              onClick={copyNumber}
              className="inline-flex items-center gap-2 text-gold font-bold text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest border-2 px-5 sm:px-7 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full hover:bg-gold/5 transition-all duration-300 hover:border-gold/50"
              style={{ borderColor: 'rgba(184, 134, 11, 0.25)' }}
            >
              {copied ? (
                <><Check size={12} strokeWidth={2} /> ¡Copiado!</>
              ) : (
                <><Copy size={12} strokeWidth={2} /> Copiar número</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
