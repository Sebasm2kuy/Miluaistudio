'use client'

/**
 * Campo de imagen del editor móvil.
 *
 * Flujo real (no solo "se abre el selector"):
 *  1. Elegir foto del dispositivo (input accept="image/*").
 *  2. Prevalidación inmediata de formato/tamaño con validarArchivoImagen
 *     (extensión + MIME + tamaño; la firma real la exige uploadToGitHub).
 *  3. Vista previa local mientras se sube, con estados claros
 *     (subiendo / ok / error) y mensaje entendible ante fallos.
 *  4. La URL del campo SOLO cambia si la subida a GitHub terminó OK;
 *     si falla, la imagen anterior queda intacta (nunca "se guardó" un
 *     archivo vacío o incompleto).
 *
 * Reutiliza la MISMA subida y validaciones que el panel de escritorio
 * (src/lib/github-deploy.ts + src/lib/activos-editor.ts): cero
 * mecanismos alternativos.
 */

import { useRef, useState } from 'react'
import { uploadToGitHub } from '@/lib/github-deploy'
import { validarArchivoImagen } from '@/lib/activos-editor'

type EstadoSubida = 'inactivo' | 'subiendo' | 'ok' | 'error'

interface Props {
  label: string
  valor: string
  token: string
  onCambio: (nuevaUrl: string) => void
}

export default function EditorImagen({ label, valor, token, onCambio }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [estado, setEstado] = useState<EstadoSubida>('inactivo')
  const [mensaje, setMensaje] = useState('')
  const [previsualizacion, setPrevisualizacion] = useState<string | null>(null)

  const tieneToken = Boolean(token.trim())

  const elegirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Limpiar el input para poder reelegir el mismo archivo
    e.target.value = ''
    if (!file) return

    // Prevalidación rápida de UI (sin bytes): formato permitido y tamaño
    const prevalidacion = validarArchivoImagen({ name: file.name, type: file.type, size: file.size })
    if (!prevalidacion.ok) {
      setEstado('error')
      setMensaje(prevalidacion.motivo)
      return
    }

    if (!tieneToken) {
      setEstado('error')
      setMensaje('Para subir la foto hace falta el token: pegalo en Ajustes → Conexión con GitHub.')
      return
    }

    // Vista previa local mientras se sube
    const urlLocal = URL.createObjectURL(file)
    setPrevisualizacion(urlLocal)
    setEstado('subiendo')
    setMensaje('')

    try {
      const resultado = await uploadToGitHub(file, token.trim())
      if (resultado.success && resultado.url) {
        onCambio(resultado.url)
        setEstado('ok')
        setMensaje('Foto subida.')
      } else {
        // La URL anterior queda intacta: no se finge ningún guardado
        setEstado('error')
        setMensaje(resultado.message || 'No se pudo subir la foto. Intentá de nuevo.')
      }
    } catch {
      setEstado('error')
      setMensaje('Error de red al subir la foto. Revisá la conexión e intentá de nuevo.')
    } finally {
      URL.revokeObjectURL(urlLocal)
      setPrevisualizacion(null)
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8f867c]">{label}</span>

      {/* Vista previa: la actual, o la local mientras sube */}
      <div className="relative mx-auto aspect-[3/4] w-40 overflow-hidden rounded-2xl border border-[#e8e0d7] bg-[#f0ebe4]">
        {previsualizacion ? (
          <img src={previsualizacion} alt="Vista previa de la foto elegida" className="h-full w-full object-cover" />
        ) : valor ? (
          <img src={valor} alt="Foto actual" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[#a39a8e]">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-[11px]">Sin foto</span>
          </div>
        )}
        {estado === 'subiendo' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-white">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-xs font-semibold">Subiendo…</span>
          </div>
        )}
      </div>

      {/* Acciones: objetivos de 44 px mínimo */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={estado === 'subiendo'}
          className="min-h-[44px] flex-1 rounded-xl bg-[#f0ebe4] px-4 text-sm font-semibold text-[#54483e] transition-colors disabled:opacity-50"
        >
          {valor ? 'Reemplazar foto' : 'Elegir foto del dispositivo'}
        </button>
        {valor && (
          <button
            type="button"
            onClick={() => {
              onCambio('')
              setEstado('inactivo')
              setMensaje('')
            }}
            disabled={estado === 'subiendo'}
            className="min-h-[44px] rounded-xl border border-red-300 px-4 text-sm font-semibold text-red-500 transition-colors disabled:opacity-50"
          >
            Quitar
          </button>
        )}
      </div>

      {/* Alternativa manual: pegar URL directa */}
      <input
        type="url"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        placeholder="…o pegá una URL de imagen"
        className="w-full rounded-xl border border-[#e8e0d7] bg-white px-3.5 py-3 text-sm text-[#292522] placeholder:text-[#b3aa9d] outline-none focus:border-[#8a6534]"
        aria-label={label + ' (URL directa)'}
      />

      {/* Estado honesto: solo «ok» cuando la subida terminó realmente */}
      {estado === 'ok' && mensaje && <p className="text-xs font-medium text-green-600">{mensaje}</p>}
      {estado === 'error' && mensaje && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium leading-relaxed text-red-600">
          {mensaje}
        </p>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={elegirArchivo} />
    </div>
  )
}
