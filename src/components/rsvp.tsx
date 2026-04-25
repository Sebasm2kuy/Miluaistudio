'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Copy, Check } from 'lucide-react'

export default function Rsvp() {
  const [formData, setFormData] = useState({ name: '', guests: '1', message: '' })
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    const msg = formData.message.trim()
      ? `¡Hola Milu! Confirmo mi asistencia a tus 15. Nombre: ${formData.name.trim()}. Invitados: ${formData.guests}. Mensaje: ${formData.message.trim()}`
      : `¡Hola Milu! Confirmo mi asistencia a tus 15. Nombre: ${formData.name.trim()}. Invitados: ${formData.guests}.`
    const encoded = encodeURIComponent(msg)
    window.open(`https://wa.me/59895239386?text=${encoded}`, '_blank')
    setFormData({ name: '', guests: '1', message: '' })
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
        {/* RSVP Form */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-16 text-center flex flex-col justify-between min-h-[400px] sm:min-h-[450px] md:h-auto md:min-h-0 relative overflow-hidden"
          style={{ ...glassCard, borderBottomWidth: '4px', borderBottomColor: '#b8860b' }}
        >
          {/* Top accent */}
          <div className="absolute top-0 left-0 w-full h-1 opacity-30"
            style={{ background: 'linear-gradient(90deg, transparent, #b8860b, #d4af37, #b8860b, transparent)' }} />

          <div>
            <p className="text-gold/60 text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.6em] font-bold mb-3 sm:mb-4">
              Nos encantaría que estés
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl text-bordeaux italic mb-2 sm:mb-3">Confirmar</h2>
            <p className="text-gray-400 mb-6 sm:mb-8 md:mb-12 italic leading-relaxed text-xs sm:text-sm md:text-base">
              Espero poder contar contigo para hacer de esta noche algo inolvidable.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-left">
              <div>
                <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gold font-bold mb-1.5 sm:mb-2">
                  Tu nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="elegant-input w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 rounded-xl border text-sm text-bordeaux bg-white/80 focus:outline-none placeholder:text-gray-300"
                  style={{ borderColor: 'rgba(184, 134, 11, 0.1)' }}
                  placeholder="Ej: María González"
                />
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gold font-bold mb-1.5 sm:mb-2">
                  Cantidad de invitados
                </label>
                <select
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="elegant-input w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 rounded-xl border text-sm text-bordeaux bg-white/80 focus:outline-none appearance-none"
                  style={{ borderColor: 'rgba(184, 134, 11, 0.1)' }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gold font-bold mb-1.5 sm:mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={2}
                  className="elegant-input w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 rounded-xl border text-sm text-bordeaux bg-white/80 focus:outline-none resize-none placeholder:text-gray-300"
                  style={{ borderColor: 'rgba(184, 134, 11, 0.1)' }}
                  placeholder="Un mensaje especial para Milu..."
                />
              </div>
            </form>
          </div>

          <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            <button
              onClick={handleSubmit}
              type="submit"
              className="gold-button w-full py-4 sm:py-5 md:py-7 rounded-full flex items-center justify-center gap-2 sm:gap-3 text-white font-semibold tracking-[0.1em] sm:tracking-[0.15em] text-[11px] sm:text-xs md:text-sm"
              style={{ boxShadow: '0 10px 30px rgba(138, 107, 13, 0.35)' }}
            >
              <Heart size={14} className="sm:w-4 sm:h-4" strokeWidth={1.5} />
              Confirmar por WhatsApp
            </button>
            <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold text-gold/40 italic">
              Favor confirmar antes del 10/08
            </p>
          </div>
        </motion.div>

        {/* Gift / Collaboration */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-16 text-center flex flex-col justify-center min-h-[400px] sm:min-h-[450px] md:h-auto md:min-h-0 relative overflow-hidden"
          style={{
            ...glassCard,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(253,252,251,0.98))',
          }}
        >
          {/* Top accent */}
          <div className="absolute top-0 left-0 w-full h-1 opacity-30"
            style={{ background: 'linear-gradient(90deg, transparent, #b8860b, #d4af37, #b8860b, transparent)' }} />

          <p className="text-gold/60 text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.6em] font-bold mb-3 sm:mb-4">
            Si deseas hacerme un regalo
          </p>
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
              boxShadow: '0 4px 20px rgba(0,0,0,0.04), 0 0 0 1px rgba(184, 134, 11, 0.05) inset',
            }}
          >
            {/* Decorative corner */}
            <div className="absolute top-3 right-4 sm:right-6 text-gold opacity-[0.05] font-serif text-4xl sm:text-6xl md:text-8xl leading-none select-none">
              A
            </div>

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
                <>
                  <Check size={12} strokeWidth={2} />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy size={12} strokeWidth={2} />
                  Copiar número
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
