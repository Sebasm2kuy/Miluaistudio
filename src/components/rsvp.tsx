'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Heart } from 'lucide-react'

export default function Rsvp() {
  const [formData, setFormData] = useState({ name: '', guests: '1', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Por favor ingresá tu nombre')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          guests: parseInt(formData.guests),
          message: formData.message || undefined,
        }),
      })

      if (res.ok) {
        toast.success('¡Confirmación recibida! Gracias por ser parte de esta noche especial.')
        setFormData({ name: '', guests: '1', message: '' })
      } else {
        throw new Error('Error al enviar')
      }
    } catch {
      toast.error('Hubo un error. Intentá de nuevo o confirmá por WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  const copyNumber = () => {
    navigator.clipboard.writeText('145920')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const glassStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(184, 134, 11, 0.15)',
  }

  return (
    <section id="confirmar" className="max-w-5xl mx-auto px-4 relative z-10">
      <div className="grid md:grid-cols-2 gap-6 md:gap-10">
        {/* RSVP Form */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="rounded-[2rem] md:rounded-[4rem] p-8 md:p-16 text-center flex flex-col justify-between min-h-[500px] md:h-auto"
          style={{ ...glassStyle, borderBottomWidth: '6px', borderBottomColor: '#b8860b' }}
        >
          <div>
            <h2 className="font-serif text-3xl md:text-5xl text-bordeaux italic mb-4">
              Confirmar
            </h2>
            <p className="text-gray-500 mb-8 md:mb-12 italic leading-relaxed text-sm md:text-base">
              Espero poder contar contigo para hacer de esta noche algo inolvidable.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-gold font-bold mb-2">
                  Tu nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl border text-sm text-bordeaux bg-ivory/80 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all placeholder:text-gray-300"
                  style={{ borderColor: 'rgba(184, 134, 11, 0.15)' }}
                  placeholder="Ej: María González"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-gold font-bold mb-2">
                  Cantidad de invitados
                </label>
                <select
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl border text-sm text-bordeaux bg-ivory/80 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                  style={{ borderColor: 'rgba(184, 134, 11, 0.15)' }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-gold font-bold mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl border text-sm text-bordeaux bg-ivory/80 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all resize-none placeholder:text-gray-300"
                  style={{ borderColor: 'rgba(184, 134, 11, 0.15)' }}
                  placeholder="Un mensaje especial para Milu..."
                />
              </div>
            </form>
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-5 md:py-8 rounded-full shadow-2xl flex items-center justify-center gap-3 text-white font-semibold uppercase tracking-[0.15em] text-xs md:text-sm transition-all duration-500 hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #8a6b0d 0%, #b8860b 50%, #d4af37 100%)',
                boxShadow: '0 10px 30px rgba(138, 107, 13, 0.4)',
              }}
            >
              <Heart size={16} />
              {submitting ? 'Enviando...' : 'Confirmar Asistencia'}
            </button>

            <a
              href="https://wa.me/59895239386?text=%C2%A1Hola%20Milu!%20Confirmo%20con%20mucha%20alegr%C3%ADa%20mi%20asistencia%20a%20tus%2015."
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-gold font-bold text-[10px] uppercase tracking-[0.3em] hover:text-bordeaux transition-colors"
            >
              O confirmá por WhatsApp
            </a>

            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold text-gold/50 italic">
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
          className="rounded-[2rem] md:rounded-[4rem] p-8 md:p-16 text-center flex flex-col justify-center min-h-[500px] md:h-auto"
          style={{
            ...glassStyle,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(253,252,251,0.98))',
          }}
        >
          <h2 className="font-serif text-3xl md:text-4xl text-bordeaux italic mb-6">
            Colaboración
          </h2>
          <p className="text-gray-400 mb-10 italic text-xs md:text-sm px-4">
            &ldquo;Tu presencia es mi mayor regalo. Si deseas ayudarme con mi viaje de sueños...&rdquo;
          </p>

          <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border shadow-inner relative overflow-hidden"
            style={{ borderColor: 'rgba(184, 134, 11, 0.15)' }}
          >
            <div className="absolute top-2 right-6 text-gold opacity-[0.07] font-serif text-6xl md:text-8xl leading-none select-none">
              A
            </div>
            <p className="text-gold font-bold uppercase text-[9px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] mb-3 md:mb-4 italic">
              Colectivo Abitab
            </p>
            <p className="text-5xl md:text-7xl font-light text-bordeaux tracking-tighter mb-8 md:mb-12 tabular-nums">
              145920
            </p>
            <button
              onClick={copyNumber}
              className="text-gold font-bold text-[10px] md:text-xs uppercase tracking-widest border-2 px-8 md:px-10 py-3 md:py-4 rounded-full hover:bg-gold/5 transition-all"
              style={{ borderColor: 'rgba(184, 134, 11, 0.3)' }}
            >
              {copied ? '¡Copiado!' : 'Copiar número'}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
