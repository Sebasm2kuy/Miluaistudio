'use client'
import { useState } from 'react'
import { Copy, Check, Send, Loader2, MessageCircle, UserPlus, Users, Minus, Plus } from 'lucide-react'
import { useConfig } from '@/hooks/useConfig'


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

const MAX_INVITADOS = 10

export default function Rsvp() {
  const cfg = useConfig()
  const hostPhone = cfg.rsvp.hostPhone

  // --- Estado del formulario ---
  const [confirmo, setConfirmo] = useState(false)
  const [cantidad, setCantidad] = useState(1)
  const [invitados, setInvitados] = useState<string[]>([''])
  const [telefono, setTelefono] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [codigo, setCodigo] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedMiDinero, setCopiedMiDinero] = useState(false)

  // --- Handlers ---
  const toggleConfirmo = () => {
    const next = !confirmo
    setConfirmo(next)
    if (!next) {
      // Al desactivar, resetear cantidad e invitados
      setCantidad(1)
      setInvitados([''])
    }
  }

  const cambiarCantidad = (delta: number) => {
    const next = Math.max(1, Math.min(MAX_INVITADOS, cantidad + delta))
    setCantidad(next)
    // Ajustar el array de invitados conservando los valores ya cargados
    setInvitados(prev => {
      const arr = [...prev]
      while (arr.length < next) arr.push('')
      while (arr.length > next) arr.pop()
      return arr
    })
  }

  const actualizarInvitado = (idx: number, value: string) => {
    setInvitados(prev => {
      const arr = [...prev]
      arr[idx] = value
      return arr
    })
  }

  // Validación: confirmo activo + al menos el primer invitado con nombre + teléfono
  const nombresValidos = invitados.filter(n => n.trim().length >= 2)
  const formularioValido = confirmo && nombresValidos.length === cantidad && cantidad >= 1 && telefono.trim().length >= 6

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formularioValido) return

    setStatus('sending')
    const nuevoCodigo = generarCodigo()
    setCodigo(nuevoCodigo)

    // Pequeña demora para que el spinner sea visible y se sienta natural.
    await new Promise((r) => setTimeout(r, 500))

    // Intentar registrar en el backend (Google Sheet) si está disponible.
    // Si falla, no bloquear al usuario — el flujo sigue por WhatsApp.
    try {
      await fetch(cfg.rsvp.googleSheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          tipo: 'rsvp_grupo',
          codigo: nuevoCodigo,
          cantidad: cantidad,
          invitados: invitados.map(n => n.trim()),
          telefono: telefono.trim(),
          fecha: new Date().toISOString(),
        }),
      })
    } catch {
      // Backend caído — no afecta el flujo del usuario
    }

    setStatus('ok')
  }

  const enviarConfirmacion = () => {
    const listaNombres = invitados
      .map((n, i) => `   ${i + 1}. ${n.trim()}`)
      .join('\n')
    const msg = encodeURIComponent(
      `✅ Confirmación de asistencia\n\n` +
      `🎀 ${cfg.countdown.calendarioTitulo}\n` +
      `👥 Cantidad: ${cantidad} persona(s)\n` +
      `👤 Invitados:\n${listaNombres}\n` +
      `📱 ${telefono.trim()}\n` +
      `🎫 ${codigo}`
    )
    window.open(`https://wa.me/${hostPhone}?text=${msg}`, '_blank')
  }

  const guardarComprobante = () => {
    const telefonoLimpio = limpiarTelefono(telefono)
    const listaNombres = invitados
      .map((n, i) => `   ${i + 1}. ${n.trim()}`)
      .join('\n')
    const msg = encodeURIComponent(
      `✅ Mi asistencia a los ${cfg.evento.tipo} de ${cfg.evento.nombre} quedó registrada.\n\n` +
      `🎫 Código: ${codigo}\n` +
      `👥 Cantidad: ${cantidad} persona(s)\n` +
      `👤 Invitados:\n${listaNombres}\n` +
      `📅 ${cfg.evento.fechaEvento}\n` +
      `📍 ${cfg.evento.lugar}, ${cfg.evento.ubicacion}\n\n` +
      `¡Nos vemos! 💛`
    )
    window.open(`https://wa.me/${telefonoLimpio}?text=${msg}`, '_blank')
  }

  const copyNumber = () => {
    navigator.clipboard.writeText(cfg.rsvp.regalos.abitab.numero)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyMiDinero = () => {
    navigator.clipboard.writeText(cfg.rsvp.regalos.miDinero.numero)
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
                className="text-gold font-bold text-sm sm:text-base mb-1"
                style={{ animation: 'rsvpFadeUp 0.6s ease 0.5s both' }}
              >
                {cantidad} {cantidad === 1 ? 'persona' : 'personas'}
              </p>

              {/* Lista de invitados confirmados */}
              <div
                className="mb-4 sm:mb-5 mt-3 sm:mt-4 space-y-1.5"
                style={{ animation: 'rsvpFadeUp 0.6s ease 0.55s both' }}
              >
                {invitados.filter(n => n.trim()).map((n, i) => (
                  <p key={i} className="text-bordeaux text-sm sm:text-base italic">
                    {n.trim()}
                  </p>
                ))}
              </div>

              {/* Codigo de confirmacion */}
              <div
                className="inline-block px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl mb-5 sm:mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(184,134,11,0.08), rgba(212,175,55,0.08))',
                  border: '1px solid rgba(184,134,11,0.2)',
                  animation: 'rsvpFadeUp 0.6s ease 0.6s both',
                }}
              >
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-gold/60 mb-0.5">Tu código</p>
                <p className="text-2xl sm:text-2xl font-bold text-gold tracking-widest tabular-nums">{codigo}</p>
              </div>

              {/* Botones post-confirmacion */}
              <div
                className="space-y-2.5 sm:space-y-3"
                style={{ animation: 'rsvpFadeUp 0.6s ease 0.8s both' }}
              >
                <button
                  onClick={enviarConfirmacion}
                  className="gold-button w-full py-3 sm:py-3.5 rounded-full flex items-center justify-center gap-2 text-white font-semibold tracking-[0.1em] text-xs sm:text-xs transition-transform duration-300 hover:scale-[1.02]"
                >
                  <Send size={14} strokeWidth={1.5} />
                  Enviar confirmación
                </button>

                <button
                  onClick={guardarComprobante}
                  className="w-full py-3 sm:py-3.5 rounded-full flex items-center justify-center gap-2 text-white font-semibold tracking-[0.1em] text-xs sm:text-xs transition-transform duration-300 hover:scale-[1.02]"
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
                className="text-[11px] sm:text-xs text-gray-400 mt-4 italic"
                style={{ animation: 'rsvpFadeUp 0.6s ease 1.2s both' }}
              >
                Guardá tu código como comprobante
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-3xl sm:text-3xl md:text-5xl text-bordeaux italic mb-2 sm:mb-3">{cfg.rsvp.titulo}</h2>
              <p className="text-gray-400 mb-6 sm:mb-8 md:mb-12 italic leading-relaxed text-sm sm:text-sm md:text-base">
                {cfg.rsvp.subtitulo}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-left">

                {/* === Paso 1: Checkbox confirmo asistencia === */}
                <button
                  type="button"
                  onClick={toggleConfirmo}
                  className={`w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 sm:py-5 rounded-xl border-2 transition-all duration-300 ${confirmo ? 'scale-[1.01]' : 'hover:bg-gold/[0.03]'}`}
                  style={{
                    borderColor: confirmo ? '#d4af37' : 'rgba(184, 134, 11, 0.2)',
                    background: confirmo ? 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(184,134,11,0.04))' : 'transparent',
                    boxShadow: confirmo ? '0 4px 20px rgba(184,134,11,0.12)' : 'none',
                  }}
                >
                  {/* Checkbox custom */}
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: confirmo ? 'linear-gradient(135deg, #d4af37, #b8860b)' : 'rgba(255,255,255,0.6)',
                      border: confirmo ? 'none' : '2px solid rgba(184,134,11,0.3)',
                    }}
                  >
                    {confirmo && <Check size={18} strokeWidth={3} className="text-white" />}
                  </div>
                  <div className="text-left flex-1">
                    <p className={`font-bold text-sm sm:text-base transition-colors ${confirmo ? 'text-bordeaux' : 'text-gray-600'}`}>
                      Confirmo asistencia
                    </p>
                    <p className="text-xs text-gray-400 italic mt-0.5">
                      {confirmo ? '¡Gracias! Contanos cuántos van a ir' : 'Tocá acá para confirmar tu asistencia'}
                    </p>
                  </div>
                </button>

                {/* === Paso 2: Cantidad de personas (se desbloquea al confirmar) === */}
                <div
                  className="transition-all duration-500 overflow-hidden"
                  style={{
                    maxHeight: confirmo ? '500px' : '0',
                    opacity: confirmo ? 1 : 0,
                    marginTop: confirmo ? undefined : 0,
                  }}
                >
                  <div className="pt-2">
                    <label className="block text-sm sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gold font-bold mb-2 sm:mb-3">
                      <span className="inline-flex items-center gap-2">
                        <Users size={14} strokeWidth={2} />
                        ¿Cuántas personas?
                      </span>
                    </label>
                    <div className="flex items-center justify-center gap-4 sm:gap-6">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(-1)}
                        disabled={cantidad <= 1}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ borderColor: 'rgba(184,134,11,0.3)', color: '#b8860b', background: 'rgba(184,134,11,0.04)' }}
                        aria-label="Restar persona"
                      >
                        <Minus size={20} strokeWidth={2.5} />
                      </button>
                      <div className="text-center min-w-[80px]">
                        <p className="text-5xl sm:text-6xl font-light text-bordeaux tabular-nums leading-none">
                          {cantidad}
                        </p>
                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gold/60 mt-1">
                          {cantidad === 1 ? 'persona' : 'personas'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(1)}
                        disabled={cantidad >= MAX_INVITADOS}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ borderColor: 'rgba(184,134,11,0.3)', color: '#b8860b', background: 'rgba(184,134,11,0.04)' }}
                        aria-label="Sumar persona"
                      >
                        <Plus size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                    {cantidad >= MAX_INVITADOS && (
                      <p className="text-center text-[10px] text-gold/50 italic mt-2">
                        Máximo {MAX_INVITADOS} personas por confirmación
                      </p>
                    )}
                  </div>
                </div>

                {/* === Paso 3: N cuadros de nombre y apellido (se desbloquea al confirmar) === */}
                <div
                  className="transition-all duration-500 overflow-hidden space-y-3"
                  style={{
                    maxHeight: confirmo ? '1200px' : '0',
                    opacity: confirmo ? 1 : 0,
                  }}
                >
                  <div className="pt-2 space-y-3">
                    <label className="block text-sm sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gold font-bold mb-1.5 sm:mb-2">
                      <span className="inline-flex items-center gap-2">
                        <UserPlus size={14} strokeWidth={2} />
                        Nombres y apellidos
                      </span>
                    </label>
                    {invitados.map((nombre, i) => (
                      <input
                        key={i}
                        type="text"
                        value={nombre}
                        onChange={(e) => actualizarInvitado(i, e.target.value)}
                        className="elegant-input w-full px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-xl border text-base text-bordeaux bg-gray-50 focus:outline-none placeholder:text-gray-300 transition-all duration-300"
                        style={{ borderColor: nombre.trim() ? 'rgba(184, 134, 11, 0.35)' : 'rgba(184, 134, 11, 0.15)' }}
                        placeholder={`Invitado ${i + 1} — Nombre y apellido`}
                      />
                    ))}
                  </div>
                </div>

                {/* === Paso 4: Teléfono de contacto (se desbloquea al confirmar) === */}
                <div
                  className="transition-all duration-500 overflow-hidden"
                  style={{
                    maxHeight: confirmo ? '200px' : '0',
                    opacity: confirmo ? 1 : 0,
                  }}
                >
                  <div className="pt-2">
                    <label className="block text-sm sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gold font-bold mb-1.5 sm:mb-2">
                      Teléfono de contacto *
                    </label>
                    <input
                      type="tel"
                      required={confirmo}
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="elegant-input w-full px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-xl border text-base text-bordeaux bg-gray-50 focus:outline-none placeholder:text-gray-300"
                      style={{ borderColor: 'rgba(184, 134, 11, 0.15)' }}
                      placeholder="Ej: 099 123 456"
                    />
                  </div>
                </div>

                {/* === Botón confirmar (se desbloquea al validar) === */}
                <button
                  type="submit"
                  disabled={status === 'sending' || !formularioValido}
                  className="gold-button w-full py-4 sm:py-5 md:py-7 rounded-full flex items-center justify-center gap-2 sm:gap-3 text-white font-semibold tracking-[0.1em] sm:tracking-[0.15em] text-sm sm:text-xs md:text-sm mt-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    boxShadow: formularioValido ? '0 10px 30px rgba(138, 107, 13, 0.35)' : 'none',
                    transform: formularioValido ? 'scale(1)' : 'scale(0.98)',
                  }}
                >
                  {status === 'sending' ? (
                    <><Loader2 size={14} className="animate-spin" /> Enviando...</>
                  ) : (
                    <><Send size={14} className="sm:w-4 sm:h-4" strokeWidth={1.5} /> Confirmar {cantidad} {cantidad === 1 ? 'asistencia' : 'asistencias'}</>
                  )}
                </button>

                {!formularioValido && confirmo && (
                  <p className="text-xs text-gold/60 text-center italic">
                    Completá todos los nombres y el teléfono para confirmar
                  </p>
                )}

                {status === 'error' && (
                  <p className="text-red-500 text-xs sm:text-xs text-center italic">
                    Hubo un error, intentá de nuevo
                  </p>
                )}
              </form>

              <p className="text-xs sm:text-xs md:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold text-gold/40 italic mt-4 sm:mt-5">
                {cfg.rsvp.fechaLimite}
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
          <h2 className="font-serif text-3xl sm:text-3xl md:text-4xl text-bordeaux italic mb-4 sm:mb-6">
            {cfg.rsvp.regalos.titulo}
          </h2>
          <p className="text-gray-400 mb-6 sm:mb-10 italic text-sm sm:text-xs md:text-sm px-2 sm:px-4 leading-relaxed">
            &ldquo;{cfg.rsvp.regalos.subtitulo}&rdquo;
          </p>

          {/* Abitab */}
          <div
            className="bg-white p-5 sm:p-8 md:p-12 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3.5rem] border relative overflow-hidden mb-3 sm:mb-4"
            style={{
              borderColor: 'rgba(184, 134, 11, 0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <p className="text-gold font-bold uppercase text-sm sm:text-[11px] md:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] mb-2 sm:mb-3 md:mb-4 italic">
              {cfg.rsvp.regalos.abitab.titulo}
            </p>

            <p className="text-4xl sm:text-5xl md:text-6xl font-light text-bordeaux tracking-tight mb-5 sm:mb-8 md:mb-12 tabular-nums">
              {cfg.rsvp.regalos.abitab.numero}
            </p>

            <button
              onClick={copyNumber}
              className="inline-flex items-center gap-2 text-gold font-bold text-sm sm:text-[11px] md:text-xs uppercase tracking-widest border-2 px-5 sm:px-7 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full hover:bg-gold/5 transition-colors duration-300 hover:border-gold/50"
              style={{ borderColor: 'rgba(184, 134, 11, 0.25)' }}
            >
              {copied ? (
                <><Check size={14} strokeWidth={2} /> ¡Copiado!</>
              ) : (
                <><Copy size={14} strokeWidth={2} /> Copiar número</>
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
            <p className="text-gold font-bold uppercase text-sm sm:text-[11px] md:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] mb-2 sm:mb-3 md:mb-4 italic">
              {cfg.rsvp.regalos.miDinero.titulo}
            </p>

            <p className="text-4xl sm:text-5xl md:text-6xl font-light text-bordeaux tracking-tight mb-5 sm:mb-8 md:mb-12 tabular-nums">
              {cfg.rsvp.regalos.miDinero.numero}
            </p>

            <button
              onClick={copyMiDinero}
              className="inline-flex items-center gap-2 text-gold font-bold text-sm sm:text-[11px] md:text-xs uppercase tracking-widest border-2 px-5 sm:px-7 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full hover:bg-gold/5 transition-colors duration-300 hover:border-gold/50"
              style={{ borderColor: 'rgba(184, 134, 11, 0.25)' }}
            >
              {copiedMiDinero ? (
                <><Check size={14} strokeWidth={2} /> ¡Copiado!</>
              ) : (
                <><Copy size={14} strokeWidth={2} /> Copiar número</>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
