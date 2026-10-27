'use client'
import { useState } from 'react'
import { Copy, Check, Send, Loader2, MessageCircle, UserPlus, Users, Minus, Plus, AlertCircle } from 'lucide-react'
import { useConfig } from '@/hooks/useConfig'
import type { ResultadoRsvp } from '@/lib/contrato-backend'
import { enviarRsvpPost } from '@/lib/rsvp-client'


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
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'pendiente' | 'error'>('idle')
  const [codigo, setCodigo] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedMiDinero, setCopiedMiDinero] = useState(false)
  const [copiedInterbancario, setCopiedInterbancario] = useState(false)

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

  /**
   * Registra el grupo en el backend (Google Sheets vía Apps Script).
   * Envío por POST con los datos SOLO en el cuerpo: los nombres y el teléfono
   * nunca viajan en la query string. Devuelve SOLO estados verificables
   * (ver src/lib/contrato-backend.ts y src/lib/rsvp-client.ts):
   *  - 'guardado':  el backend respondió { success: true }
   *  - 'pendiente': el navegador bloqueó la lectura (CORS/red), hubo timeout,
   *                 la respuesta fue ilegible o el backend desplegado todavía
   *                 no acepta el contrato POST. No se puede afirmar el guardado.
   *  - 'error':     el backend respondió con error explícito.
   * Si queda 'pendiente', la interfaz ofrece la confirmación por WhatsApp
   * como alternativa visible, elegida por la persona (nunca envíos en silencio).
   */
  const registrarEnSheets = async (nuevoCodigo: string): Promise<ResultadoRsvp> => {
    if (!cfg.rsvp.googleSheetUrl) return 'pendiente'

    return enviarRsvpPost({
      url: cfg.rsvp.googleSheetUrl,
      payload: {
        codigo: nuevoCodigo,
        cantidad,
        invitados: invitados.map((n) => n.trim()).filter(Boolean),
        telefono: telefono.trim(),
        fecha: new Date().toISOString(),
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formularioValido) return

    setStatus('sending')
    const nuevoCodigo = generarCodigo()
    setCodigo(nuevoCodigo)

    // Pequeña demora para que el spinner sea visible y se sienta natural.
    await new Promise((r) => setTimeout(r, 400))

    // Las muestras públicas simulan el flujo, pero nunca envían datos de invitados.
    if (cfg.modoDemo) {
      setStatus('ok')
      return
    }

    const resultado = await registrarEnSheets(nuevoCodigo)
    if (resultado === 'guardado') setStatus('ok')
    else if (resultado === 'error') setStatus('error')
    else setStatus('pendiente')
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
      `📍 ${[cfg.evento.lugar, cfg.evento.ubicacion].filter(Boolean).join(', ')}\n\n` +
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

  const copyInterbancario = () => {
    if (cfg.rsvp.regalos.miDinero.numeroInterbancario) {
      navigator.clipboard.writeText(cfg.rsvp.regalos.miDinero.numeroInterbancario)
      setCopiedInterbancario(true)
      setTimeout(() => setCopiedInterbancario(false), 2000)
    }
  }

  return (
    <section id="confirmar" className="max-w-5xl mx-auto px-3 sm:px-4 relative z-10">
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-10">

        {/* Confirmar Asistencia */}
        <div
          className="glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-16 text-center flex flex-col justify-center relative overflow-hidden"
          style={{ borderBottomWidth: '3px', borderBottomColor: 'var(--theme-accent, #b8860b)' }}
        >
          {status === 'ok' || status === 'pendiente' || status === 'error' ? (
            <div className="py-4 sm:py-8">
              {/* Check animado (amarillo en pendiente, rojo en error) */}
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-5 rounded-full flex items-center justify-center"
                style={{
                  background:
                    status === 'error'
                      ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                      : status === 'pendiente'
                        ? 'linear-gradient(135deg, #f59e0b, #b45309)'
                        : 'linear-gradient(135deg, var(--theme-accent-light, #d4af37), var(--theme-accent, #b8860b))',
                  boxShadow:
                    status === 'ok'
                      ? '0 8px 32px color-mix(in srgb, var(--theme-accent, #b8860b) 30%, transparent)'
                      : '0 8px 32px rgba(0,0,0,0.18)',
                  animation: 'springIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
                }}
              >
                {status === 'ok' ? (
                  <Check size={36} className="sm:w-10 sm:h-10 text-white" strokeWidth={2} />
                ) : (
                  <AlertCircle size={36} className="sm:w-10 sm:h-10 text-white" strokeWidth={2} />
                )}
              </div>

              <p
                className="font-serif text-2xl sm:text-3xl text-bordeaux italic mb-1"
                style={{ animation: 'rsvpFadeUp 0.6s ease 0.4s both' }}
              >
{cfg.modoDemo ? 'Prueba completada' : status === 'ok' ? '¡Confirmado!' : status === 'pendiente' ? 'Casi listo' : 'No se pudo registrar'}
              </p>
              {status !== 'ok' && !cfg.modoDemo && (
                <p className="mx-auto max-w-sm text-xs sm:text-sm leading-relaxed mb-1" style={{ animation: 'rsvpFadeUp 0.6s ease 0.45s both', color: 'var(--theme-card-muted)' }}>
                  {status === 'pendiente'
                    ? 'No pudimos verificar el registro automático. Para asegurar tu lugar, confirmá también por WhatsApp.'
                    : 'Hubo un problema al registrar la asistencia. Podés reintentar o confirmar directamente por WhatsApp.'}
                </p>
              )}
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
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-accent, #b8860b) 8%, transparent), color-mix(in srgb, var(--theme-accent-light, #d4af37) 8%, transparent))',
                  border: '1px solid color-mix(in srgb, var(--theme-accent, #b8860b) 20%, transparent)',
                  animation: 'rsvpFadeUp 0.6s ease 0.6s both',
                }}
              >
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-gold/60 mb-0.5">{cfg.modoDemo ? 'Código de muestra' : 'Tu código'}</p>
                {cfg.modoDemo && <p className="mx-auto mb-3 max-w-sm text-xs leading-relaxed" style={{ color: 'var(--theme-card-muted)' }}>Esta interacción es solo una prueba visual. No se registró ninguna asistencia ni se enviaron datos.</p>}
                <p className="text-2xl sm:text-2xl font-bold text-gold tracking-widest tabular-nums">{codigo}</p>
              </div>

              {/* Botones post-confirmacion */}
{!cfg.modoDemo && (
              <div
                className="space-y-2.5 sm:space-y-3"
                style={{ animation: 'rsvpFadeUp 0.6s ease 0.8s both' }}
              >
                {status !== 'error' ? (
                <button
                  onClick={enviarConfirmacion}
                  className="gold-button w-full py-3 sm:py-3.5 rounded-full flex items-center justify-center gap-2 text-white font-semibold tracking-[0.1em] text-xs sm:text-xs transition-transform duration-300 hover:scale-[1.02]"
                >
                  <Send size={14} strokeWidth={1.5} />
                  {status === 'pendiente' ? 'Confirmar también por WhatsApp' : 'Enviar confirmación'}
                </button>
                ) : (
                <button
                  onClick={() => setStatus('idle')}
                  className="gold-button w-full py-3 sm:py-3.5 rounded-full flex items-center justify-center gap-2 text-white font-semibold tracking-[0.1em] text-xs sm:text-xs transition-transform duration-300 hover:scale-[1.02]"
                >
                  <Send size={14} strokeWidth={1.5} />
                  Reintentar el registro
                </button>
                )}

                <button
                  onClick={status === 'error' ? enviarConfirmacion : guardarComprobante}
                  className="w-full py-3 sm:py-3.5 rounded-full flex items-center justify-center gap-2 text-white font-semibold tracking-[0.1em] text-xs sm:text-xs transition-transform duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    boxShadow: '0 6px 20px rgba(37,211,102,0.3)',
                  }}
                >
                  <MessageCircle size={14} strokeWidth={1.5} />
                  {status === 'error' ? 'Confirmar por WhatsApp' : 'Guardar mi comprobante'}
                </button>
              </div>

)}
              {cfg.modoDemo && <p className="mt-4 rounded-xl border border-dashed p-3 text-xs italic" style={{ borderColor: 'color-mix(in srgb, var(--theme-accent, var(--theme-accent, #b8860b)) 35%, transparent)', color: 'var(--theme-card-muted)' }}>Esta es una demostración: los datos no se enviaron ni se guardaron.</p>}

              <p
                className="text-[11px] sm:text-xs mt-4 italic"
                style={{ animation: 'rsvpFadeUp 0.6s ease 1.2s both', color: 'var(--theme-card-muted)' }}
              >
                Guardá tu código como comprobante
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-3xl sm:text-3xl md:text-5xl text-bordeaux italic mb-2 sm:mb-3">{cfg.rsvp.titulo}</h2>
              <p className="mb-6 sm:mb-8 md:mb-12 italic leading-relaxed text-sm sm:text-sm md:text-base" style={{ color: 'var(--theme-card-muted)' }}>
                {cfg.rsvp.subtitulo}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 text-left">

                {/* === Paso 1: Checkbox confirmo asistencia === */}
                <button
                  type="button"
                  onClick={toggleConfirmo}
                  className={`w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 sm:py-5 rounded-xl border-2 transition-all duration-300 ${confirmo ? 'scale-[1.01]' : 'hover:bg-gold/[0.03]'}`}
                  style={{
                    borderColor: confirmo ? 'var(--theme-accent-light, #d4af37)' : 'color-mix(in srgb, var(--theme-accent, #b8860b) 20%, transparent)',
                    background: confirmo ? 'linear-gradient(135deg, color-mix(in srgb, var(--theme-accent-light, #d4af37) 8%, transparent), rgba(184,134,11,0.04))' : 'transparent',
                    boxShadow: confirmo ? '0 4px 20px rgba(184,134,11,0.12)' : 'none',
                  }}
                >
                  {/* Checkbox custom */}
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: confirmo ? 'linear-gradient(135deg, var(--theme-accent-light, #d4af37), var(--theme-accent, #b8860b))' : 'var(--theme-input-bg)',
                      border: confirmo ? 'none' : '2px solid color-mix(in srgb, var(--theme-accent, #b8860b) 30%, transparent)',
                    }}
                  >
                    {confirmo && <Check size={18} strokeWidth={3} className="text-white" />}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-sm sm:text-base transition-colors" style={{ color: confirmo ? 'var(--theme-card-strong)' : 'var(--theme-card-muted)' }}>
                      Confirmo asistencia
                    </p>
                    <p className="text-xs italic mt-0.5" style={{ color: 'var(--theme-card-muted)' }}>
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
                        style={{ borderColor: 'color-mix(in srgb, var(--theme-accent, #b8860b) 30%, transparent)', color: 'var(--theme-accent, #b8860b)', background: 'rgba(184,134,11,0.04)' }}
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
                        style={{ borderColor: 'color-mix(in srgb, var(--theme-accent, #b8860b) 30%, transparent)', color: 'var(--theme-accent, #b8860b)', background: 'rgba(184,134,11,0.04)' }}
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
                        className="elegant-input w-full px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-xl border text-base focus:outline-none transition-all duration-300"
                        style={{ borderColor: nombre.trim() ? 'color-mix(in srgb, var(--theme-accent, #b8860b) 35%, transparent)' : 'color-mix(in srgb, var(--theme-accent, #b8860b) 15%, transparent)' }}
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
                      className="elegant-input w-full px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-xl border text-base focus:outline-none"
                      style={{ borderColor: 'color-mix(in srgb, var(--theme-accent, #b8860b) 15%, transparent)' }}
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
              </form>

              <p className="text-xs sm:text-xs md:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold text-gold/40 italic mt-4 sm:mt-5">
                {cfg.rsvp.fechaLimite}
              </p>
            </>
          )}
        </div>

        {/* Colaboración — regalos y datos bancarios (prendible desde secciones) */}
        {cfg.secciones?.regalos !== false && (
        <div
          className="glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-16 text-center flex flex-col justify-center relative overflow-hidden"
        >
          <h2 className="font-serif text-3xl sm:text-3xl md:text-4xl text-bordeaux italic mb-4 sm:mb-6">
            {cfg.rsvp.regalos.titulo}
          </h2>
          <p className="mb-6 sm:mb-10 italic text-sm sm:text-xs md:text-sm px-2 sm:px-4 leading-relaxed" style={{ color: 'var(--theme-card-muted)' }}>
            &ldquo;{cfg.rsvp.regalos.subtitulo}&rdquo;
          </p>
          {cfg.modoDemo && <p className="mb-6 rounded-xl border border-dashed p-3 text-xs" style={{ borderColor: 'color-mix(in srgb, var(--theme-accent, var(--theme-accent, #b8860b)) 35%, transparent)', color: 'var(--theme-card-muted)' }}>En la invitación personalizada se puede agregar información útil para los invitados.</p>}

          {/* Abitab */}
          {!cfg.modoDemo && <div
            className="p-5 sm:p-8 md:p-12 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3.5rem] border relative overflow-hidden mb-3 sm:mb-4"
            style={{
              background: 'var(--theme-card-bg-solid)',
              borderColor: 'var(--theme-card-border)',
              boxShadow: 'var(--theme-card-shadow)',
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
              style={{ borderColor: 'color-mix(in srgb, var(--theme-accent, #b8860b) 25%, transparent)' }}
            >
              {copied ? (
                <><Check size={14} strokeWidth={2} /> ¡Copiado!</>
              ) : (
                <><Copy size={14} strokeWidth={2} /> Copiar número</>
              )}
            </button>
          </div>}

          {/* Bloque secundario (Santander / Mi Dinero) — solo se renderiza si tiene número configurado */}
          {cfg.rsvp.regalos.miDinero.numero && (
            <div
              className="p-5 sm:p-8 md:p-12 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3.5rem] border relative overflow-hidden"
              style={{
                background: 'var(--theme-card-bg-solid)',
                borderColor: 'var(--theme-card-border)',
                boxShadow: 'var(--theme-card-shadow)',
              }}
            >
              <p className="text-gold font-bold uppercase text-sm sm:text-[11px] md:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] mb-2 sm:mb-3 md:mb-4 italic">
                {cfg.rsvp.regalos.miDinero.titulo}
              </p>

              {cfg.rsvp.regalos.miDinero.numeroInterbancario ? (
                // Layout de dos números (Santander: mismo banco + otros bancos)
                <div className="space-y-5 sm:space-y-6 mb-5 sm:mb-8">
                  {/* Sucursal */}
                  {cfg.rsvp.regalos.miDinero.sucursal && (
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] italic" style={{ color: 'var(--theme-card-muted)' }}>
                      {cfg.rsvp.regalos.miDinero.sucursal}
                    </p>
                  )}

                  {/* Mismo banco */}
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gold/60 font-bold mb-1.5">
                      Mismo banco
                    </p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-light text-bordeaux tracking-tight tabular-nums leading-tight mb-2">
                      {cfg.rsvp.regalos.miDinero.numero}
                    </p>
                    <button
                      onClick={copyMiDinero}
                      className="inline-flex items-center gap-1.5 text-gold font-bold text-[10px] sm:text-xs uppercase tracking-widest border-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-gold/5 transition-colors duration-300 hover:border-gold/50"
                      style={{ borderColor: 'color-mix(in srgb, var(--theme-accent, #b8860b) 25%, transparent)' }}
                    >
                      {copiedMiDinero ? (
                        <><Check size={12} strokeWidth={2} /> ¡Copiado!</>
                      ) : (
                        <><Copy size={12} strokeWidth={2} /> Copiar</>
                      )}
                    </button>
                  </div>

                  {/* Separador */}
                  <div className="border-t pt-4" style={{ borderColor: 'color-mix(in srgb, var(--theme-accent, #b8860b) 10%, transparent)' }} />

                  {/* Otros bancos */}
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gold/60 font-bold mb-1.5">
                      Desde otros bancos
                    </p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-light text-bordeaux tracking-tight tabular-nums leading-tight mb-2 break-all">
                      {cfg.rsvp.regalos.miDinero.numeroInterbancario}
                    </p>
                    <button
                      onClick={copyInterbancario}
                      className="inline-flex items-center gap-1.5 text-gold font-bold text-[10px] sm:text-xs uppercase tracking-widest border-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-gold/5 transition-colors duration-300 hover:border-gold/50"
                      style={{ borderColor: 'color-mix(in srgb, var(--theme-accent, #b8860b) 25%, transparent)' }}
                    >
                      {copiedInterbancario ? (
                        <><Check size={12} strokeWidth={2} /> ¡Copiado!</>
                      ) : (
                        <><Copy size={12} strokeWidth={2} /> Copiar</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Layout de un solo número (compatibilidad hacia atrás)
                <>
                  <p className="text-4xl sm:text-5xl md:text-6xl font-light text-bordeaux tracking-tight mb-5 sm:mb-8 md:mb-12 tabular-nums">
                    {cfg.rsvp.regalos.miDinero.numero}
                  </p>

                  <button
                    onClick={copyMiDinero}
                    className="inline-flex items-center gap-2 text-gold font-bold text-sm sm:text-[11px] md:text-xs uppercase tracking-widest border-2 px-5 sm:px-7 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full hover:bg-gold/5 transition-colors duration-300 hover:border-gold/50"
                    style={{ borderColor: 'color-mix(in srgb, var(--theme-accent, #b8860b) 25%, transparent)' }}
                  >
                    {copiedMiDinero ? (
                      <><Check size={14} strokeWidth={2} /> ¡Copiado!</>
                    ) : (
                      <><Copy size={14} strokeWidth={2} /> Copiar número</>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        )}
      </div>
    </section>
  )
}
