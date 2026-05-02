'use client'
import { useState } from 'react'
import { Copy, Check, Send, Loader2, MessageCircle } from 'lucide-react'

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxOPx5jE1vcgW4nUfXWDkbKqQU8Ejex9RLI4rv64yZweZLFEiKrCoDj_8b7fryti3Sn/exec'
const HOST_PHONE = '59895239386'

function generarCodigo() {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `MIL-${num}`
}

function limpiarTelefono(tel: string) {
  const solo = tel.replace(/[^0-9]/g, '')
  if (solo.startsWith('0')) return '598' + solo.slice(1)
  if (solo.startsWith('598')) return solo
  if (solo.length === 9) return '598' + solo
  return solo
}

export default function Rsvp() {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [codigo, setCodigo] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedMiDinero, setCopiedMiDinero] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !telefono.trim()) return

    setStatus('sending')
    const nuevoCodigo = generarCodigo()
    setCodigo(nuevoCodigo)

    try {
      const res = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          codigo: nuevoCodigo,
        }),
      })
      if (res.ok) {
        setStatus('ok')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const enviarConfirmacion = () => {
    const msg = encodeURIComponent(
      `✅ Confirmación de asistencia\n\n` +
      `🎀 XV Años de Milagros\n` +
      `👤 ${nombre.trim()}\n` +
      `📱 ${telefono.trim()}\n` +
      `🎫 ${codigo}`
    )
    window.open(`https://wa.me/${HOST_PHONE}?text=${msg}`, '_blank')
  }

  const guardarComprobante = () => {
    const telefonoLimpio = limpiarTelefono(telefono)
    const msg = encodeURIComponent(
      `✅ Mi asistencia a los XV de Milagros quedó registrada.\n\n` +
      `🎫 Código: ${codigo}\n` +
      `📅 22/08/2026\n` +
      `📍 Salón My Father, Montevideo\n\n` +
      `¡Nos vemos! 💛`
    )
    window.open(`https://wa.me/${telefonoLimpio}?text=${msg}`, '_blank')
  }

  const copyNumber = () => {
    navigator.clipboard.writeText('145920')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyMiDinero = () => {
    navigator.clipboard.writeText('2401461')
    setCopiedMiDinero(true)
    setTimeout(() => setCopiedMiDinero(false), 2000)
  }

  return (
    <section id="confirmar" className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-10">

        {/* Confirmar Asistencia */}
        <div
          className="glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-16 text-center flex flex-col justify-center relative overflow-hidden"
          style={{ borderBottomWidth: '3px', borderBottomColor: '#b8860b' }}
        >
          {status === 'ok' ? (
            <div className="py-4 sm:py-8">
              {/* Check animado */}
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-5 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                  boxShadow: '0 8px 32px rgba(184,134,11,0.3)',
                  animation: 'springIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
                }}
              >
                <Check size={36} className="sm:w-10 sm:h-10 text-white" strokeWidth={2} />
              </div>

              <p
                className="font-serif text-2xl sm:text-3xl text-bordeaux italic mb-1"
                style={{ animation: 'rsvpFadeUp 0.6s ease 0.4s both' }}
              >
                ¡Confirmado!
              </p>
              <p
                className="text-gold font-bold text-sm sm:text-base mb-4 sm:mb-5"
                style={{ animation: 'rsvpFadeUp 0.6s ease 0.5s both' }}
              >
                {nombre.trim()}
              </p>

              {/* Codigo de confirmacion */}
              <div
                className="inline-block px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl mb-5 sm:mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(184,134,11,0.08), rgba(212,175,55,0.08))',
                  border: '1px solid rgba(184,134,11,0.2)',
                  animation: 'rsvpFadeUp 0.6s ease 0.6s both',
                }}
              >
                <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-gold/60 mb-0.5">Tu código</p>
                <p className="text-xl sm:text-2xl font-bold text-gold tracking-widest tabular-nums">{codigo}</p>
              </div>

              {/* Botones post-confirmacion */}
              <div
                className="space-y-2.5 sm:space-y-3"
                style={{ animation: 'rsvpFadeUp 0.6s ease 0.8s both' }}
              >
                <button
                  onClick={enviarConfirmacion}
                  className="gold-button w-full py-3 sm:py-3.5 rounded-full flex items-center justify-center gap-2 text-white font-semibold tracking-[0.1em] text-[10px] sm:text-xs transition-transform duration-300 hover:scale-[1.02]"
                >
                  <Send size={14} strokeWidth={1.5} />
                  Enviar confirmación
                </button>

                <button
                  onClick={guardarComprobante}
                  className="w-full py-3 sm:py-3.5 rounded-full flex items-center justify-center gap-2 text-white font-semibold tracking-[0.1em] text-[10px] sm:text-xs transition-transform duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    boxShadow: '0 6px 20px rgba(37,211,102,0.3)',
                  }}
                >
                  <MessageCircle size={14} strokeWidth={1.5} />
                  Guardar mi comprobante
                </button>
              </div>

              <p
                className="text-[8px] sm:text-[9px] text-gray-400 mt-4 italic"
                style={{ animation: 'rsvpFadeUp 0.6s ease 1.2s both' }}
              >
                Guardá tu código como comprobante
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl text-bordeaux italic mb-2 sm:mb-3">Confirmar</h2>
              <p className="text-gray-400 mb-6 sm:mb-8 md:mb-12 italic leading-relaxed text-xs sm:text-sm md:text-base">
                Espero poder contar contigo para hacer de esta noche algo inolvidable.
              </p>

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

              <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold text-gold/40 italic mt-4 sm:mt-5">
                Favor confirmar antes del 10/08
              </p>
            </>
          )}
        </div>

        {/* Colaboración */}
        <div
          className="glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-16 text-center flex flex-col justify-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(253,252,251,0.98))',
          }}
        >
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-bordeaux italic mb-4 sm:mb-6">
            Regalo
          </h2>
          <p className="text-gray-400 mb-6 sm:mb-10 italic text-[11px] sm:text-xs md:text-sm px-2 sm:px-4 leading-relaxed">
            &ldquo;Si deseas tener un detalle conmigo, te dejo las opciones donde podés hacerlo.&rdquo;
          </p>

          {/* Abitab */}
          <div
            className="bg-white p-5 sm:p-8 md:p-12 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3.5rem] border relative overflow-hidden mb-3 sm:mb-4"
            style={{
              borderColor: 'rgba(184, 134, 11, 0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <p className="text-gold font-bold uppercase text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] mb-2 sm:mb-3 md:mb-4 italic">
              Cuenta Abitab
            </p>

            <p className="text-4xl sm:text-5xl md:text-7xl font-light text-bordeaux tracking-tighter mb-5 sm:mb-8 md:mb-12 tabular-nums">
              145920
            </p>

            <button
              onClick={copyNumber}
              className="inline-flex items-center gap-2 text-gold font-bold text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest border-2 px-5 sm:px-7 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full hover:bg-gold/5 transition-colors duration-300 hover:border-gold/50"
              style={{ borderColor: 'rgba(184, 134, 11, 0.25)' }}
            >
              {copied ? (
                <><Check size={12} strokeWidth={2} /> ¡Copiado!</>
              ) : (
                <><Copy size={12} strokeWidth={2} /> Copiar número</>
              )}
            </button>
          </div>

          {/* Mi Dinero */}
          <div
            className="bg-white p-5 sm:p-8 md:p-12 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3.5rem] border relative overflow-hidden"
            style={{
              borderColor: 'rgba(184, 134, 11, 0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <p className="text-gold font-bold uppercase text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] mb-2 sm:mb-3 md:mb-4 italic">
              Cuenta Mi Dinero
            </p>

            <p className="text-4xl sm:text-5xl md:text-7xl font-light text-bordeaux tracking-tighter mb-5 sm:mb-8 md:mb-12 tabular-nums">
              2401461
            </p>

            <button
              onClick={copyMiDinero}
              className="inline-flex items-center gap-2 text-gold font-bold text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest border-2 px-5 sm:px-7 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full hover:bg-gold/5 transition-colors duration-300 hover:border-gold/50"
              style={{ borderColor: 'rgba(184, 134, 11, 0.25)' }}
            >
              {copiedMiDinero ? (
                <><Check size={12} strokeWidth={2} /> ¡Copiado!</>
              ) : (
                <><Copy size={12} strokeWidth={2} /> Copiar número</>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
