'use client'

/**
 * Importación del pedido por WhatsApp, dentro de Ajustes del editor.
 *
 * Flujo: pegar el mensaje que el cliente mandó con «Enviar mi configuración»
 * (personalizador) → «Leer el mensaje» muestra qué se entendió (y qué no,
 * con avisos honestos) → «Cargar en la invitación» reemplaza el borrador
 * del editor con esos datos, sin re-escribirlos a mano.
 *
 * La lectura es pura (no toca nada); solo al aplicar se cambia la config.
 */

import { useState } from 'react'
import type { ResultadoImportacion } from '@/lib/importar-whatsapp'

interface Props {
  /** Lee el mensaje pegado y devuelve campos + avisos (sin aplicar nada). */
  onLeer: (mensaje: string) => ResultadoImportacion
  /** Aplica la importación: reemplaza el borrador vigente del editor. */
  onAplicar: (resultado: ResultadoImportacion) => void
}

export default function PanelImportarWhatsApp({ onLeer, onAplicar }: Props) {
  const [mensaje, setMensaje] = useState('')
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null)

  const leer = () => setResultado(onLeer(mensaje))

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-[#787168]">
        Cuando un cliente toca «Enviar mi configuración» en Personalizar, te llega un mensaje
        con todos sus datos. Pegalo acá completo y el editor carga la invitación lista para
        revisar y publicar: sin re-copiar nada.
      </p>

      <textarea
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        placeholder={'Hola! Personalicé mi invitación en la web de Miluaistudio:\n\n• Diseño: Rosa Romántica\n• Evento: Mis XV años\n• Nombre: Martina\n…'}
        rows={7}
        aria-label="Mensaje de WhatsApp con la configuración del cliente"
        className="w-full rounded-xl border border-[#e8e0d7] bg-white p-3 text-sm leading-relaxed text-[#292522] outline-none transition focus:border-[#8a6534]"
      />

      <button
        type="button"
        onClick={leer}
        disabled={!mensaje.trim()}
        className="min-h-[44px] w-full rounded-xl border border-[#8a6534] px-4 py-2.5 text-sm font-semibold text-[#8a6534] transition hover:bg-[#8a6534]/10 disabled:opacity-40"
      >
        Leer el mensaje
      </button>

      {resultado?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-600" role="alert">
          {resultado.error}
        </p>
      )}

      {resultado?.ok && (
        <div className="space-y-3 rounded-xl border border-[#dfc9a4] bg-[#fdf9f1] p-3">
          <p className="text-xs font-semibold text-[#8a6534]">Esto es lo que entendí del mensaje:</p>
          <ul className="space-y-1">
            {resultado.leidos.map((l) => (
              <li key={l} className="text-xs leading-relaxed text-[#292522]">
                ✓ {l}
              </li>
            ))}
          </ul>

          {resultado.avisos.map((a) => (
            <p key={a} className="rounded-lg border border-[#eadfca] bg-white p-2.5 text-[11px] leading-relaxed text-[#7a6f61]">
              ⚠ {a}
            </p>
          ))}

          <p className="text-[11px] leading-relaxed text-[#7a6f61]">
            «Cargar» reemplaza el borrador actual de este navegador con estos datos (el invitado
            no ve nada hasta que publiques vos con tu token).
          </p>

          <button
            type="button"
            onClick={() => onAplicar(resultado)}
            className="min-h-[48px] w-full rounded-xl bg-[#8a6534] px-4 py-3 text-sm font-bold text-white shadow-[0_6px_18px_rgba(138,101,52,0.35)] transition active:scale-[0.98]"
          >
            Cargar en la invitación
          </button>
        </div>
      )}
    </div>
  )
}
