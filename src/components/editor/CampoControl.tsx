'use client'

/**
 * Renderizador genérico de campos del editor móvil.
 * Cada CampoSpec del registro se dibuja con objetivos táctiles grandes
 * (≥44 px) y controles nativos cómodos con el teclado virtual.
 */

import EditorImagen from './EditorImagen'
import type { CampoSpec } from '@/lib/editor-campos'

export type ValorCampo = string | number | boolean

interface Props {
  campo: CampoSpec
  valor: ValorCampo | undefined
  token: string
  onCambio: (nuevoValor: ValorCampo) => void
}

const INPUT_CLS =
  'w-full min-h-[44px] rounded-xl border border-[#e8e0d7] bg-white px-3.5 py-2.5 text-base text-[#292522] placeholder:text-[#b3aa9d] outline-none transition focus:border-[#8a6534] focus:ring-2 focus:ring-[#8a6534]/30'

export default function CampoControl({ campo, valor, token, onCambio }: Props) {
  const valorTexto = valor === undefined || valor === null ? '' : String(valor)

  if (campo.tipo === 'imagen') {
    return <EditorImagen label={campo.label} valor={valorTexto} token={token} onCambio={(v) => onCambio(v)} />
  }

  if (campo.tipo === 'interruptor') {
    const prendido = valor === true || valor === 'true'
    return (
      <button
        type="button"
        role="switch"
        aria-checked={prendido}
        onClick={() => onCambio(!prendido)}
        className={
          'flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left transition ' +
          (prendido ? 'border-[#8a6534] bg-[#faf6ef]' : 'border-[#e8e0d7] bg-white')
        }
      >
        <span className={'text-sm font-medium ' + (prendido ? 'text-[#292522]' : 'text-[#716a63]')}>{campo.label}</span>
        <span
          aria-hidden="true"
          className={'relative h-7 w-12 shrink-0 rounded-full transition ' + (prendido ? 'bg-[#8a6534]' : 'bg-[#ded4c8]')}
        >
          <span
            className={
              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ' + (prendido ? 'left-[22px]' : 'left-0.5')
            }
          />
        </span>
      </button>
    )
  }

  if (campo.tipo === 'opciones') {
    const actual = valorTexto || ''
    return (
      <div>
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8f867c]">{campo.label}</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={campo.label}>
          {(campo.opciones ?? []).map((op) => {
            const activa = actual === op.id
            return (
              <button
                key={op.id}
                type="button"
                role="radio"
                aria-checked={activa}
                onClick={() => onCambio(op.id)}
                className={
                  'min-h-[44px] rounded-xl border px-3.5 py-2 text-sm font-medium transition ' +
                  (activa
                    ? 'border-[#8a6534] bg-[#faf6ef] text-[#292522] shadow-[0_0_0_1px_rgba(181,140,90,0.4)]'
                    : 'border-[#e8e0d7] bg-white text-[#716a63]')
                }
              >
                {op.nombre}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (campo.tipo === 'color') {
    const colorValido = /^#[0-9a-fA-F]{3,8}$/.test(valorTexto) ? valorTexto : '#000000'
    return (
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8f867c]">{campo.label}</span>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={colorValido}
            onChange={(e) => onCambio(e.target.value)}
            className="h-11 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
            aria-label={'Color ' + campo.label}
          />
          <input
            type="text"
            value={valorTexto}
            onChange={(e) => onCambio(e.target.value)}
            className={`${INPUT_CLS} font-mono`}
            maxLength={9}
            placeholder="#8a6534"
          />
        </div>
      </label>
    )
  }

  if (campo.tipo === 'fecha-evento') {
    // El esquema guarda 'YYYY-MM-DD HH:mm'; datetime-local exige 'T'.
    const paraInput = valorTexto ? valorTexto.replace(' ', 'T').slice(0, 16) : ''
    return (
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8f867c]">{campo.label}</span>
        <input
          type="datetime-local"
          value={paraInput}
          onChange={(e) => {
            const v = e.target.value
            onCambio(v ? v.replace('T', ' ') : '')
          }}
          className={INPUT_CLS}
        />
        {campo.ayuda && <span className="mt-1.5 block text-[11px] leading-relaxed text-[#787168]">{campo.ayuda}</span>}
      </label>
    )
  }

  if (campo.tipo === 'texto-largo') {
    return (
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8f867c]">{campo.label}</span>
        <textarea
          rows={campo.filas ?? 3}
          value={valorTexto}
          onChange={(e) => onCambio(e.target.value)}
          placeholder={campo.placeholder}
          className={`${INPUT_CLS} resize-y leading-relaxed`}
        />
        {campo.ayuda && <span className="mt-1.5 block text-[11px] leading-relaxed text-[#787168]">{campo.ayuda}</span>}
      </label>
    )
  }

  const tipoHtml =
    campo.tipo === 'numero'
      ? 'number'
      : campo.tipo === 'url'
        ? 'url'
        : 'text'

  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8f867c]">{campo.label}</span>
      <input
        type={tipoHtml}
        inputMode={campo.tipo === 'numero' ? 'decimal' : undefined}
        value={valorTexto}
        onChange={(e) => onCambio(e.target.value)}
        placeholder={campo.placeholder}
        className={INPUT_CLS}
      />
      {campo.ayuda && <span className="mt-1.5 block text-[11px] leading-relaxed text-[#787168]">{campo.ayuda}</span>}
    </label>
  )
}
