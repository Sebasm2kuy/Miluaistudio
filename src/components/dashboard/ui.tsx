'use client';

// ============================================================
// UI COMPARTIDA DEL PANEL DE CLIENTE (/dashboard)
// ------------------------------------------------------------
// Piezas modulares Tailwind con la línea gráfica de alta gama del
// panel: superficies charcoal cálidas y acentos dorados. Contrastes
// elegidos ≥ 4.5:1 (texto #f0e8da sobre #1d1810 ≈ 13:1; dorado de
// botón #d4b465 con tinta #201a0e ≈ 9:1).
// ============================================================

import { Loader2, type LucideIcon } from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';

/** Botón primario dorado con estado de carga integrado. */
export function BotonPrincipal({
  children,
  onClick,
  disabled,
  ocupado,
  tipo = 'button',
  icono: Icono,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ocupado?: boolean;
  tipo?: 'button' | 'submit';
  icono?: LucideIcon;
}) {
  const bloqueado = disabled || ocupado;
  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={bloqueado}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d4b465] px-4 py-2.5 text-sm font-semibold text-[#201a0e] transition hover:bg-[#e2c67c] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {ocupado ? <Loader2 size={15} className="animate-spin" /> : Icono ? <Icono size={15} /> : null}
      {children}
    </button>
  );
}

/** Botón secundario (borde sutil). */
export function BotonSecundario({
  children,
  onClick,
  disabled,
  ocupado,
  icono: Icono,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ocupado?: boolean;
  icono?: LucideIcon;
}) {
  const bloqueado = disabled || ocupado;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={bloqueado}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3a3226] bg-transparent px-4 py-2.5 text-sm font-medium text-[#d8cbb2] transition hover:border-[#57503f] hover:bg-[#262017] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {ocupado ? <Loader2 size={15} className="animate-spin" /> : Icono ? <Icono size={15} /> : null}
      {children}
    </button>
  );
}

type TonoAviso = 'ok' | 'error' | 'info' | 'alerta';

const TONOS_AVISO: Record<TonoAviso, string> = {
  ok: 'border-[#3f5b3f] bg-[#1c2b1c] text-[#bfe3bf]',
  error: 'border-[#7a4034] bg-[#3a201a] text-[#f2b8ad]',
  info: 'border-[#3a3226] bg-[#262017] text-[#d8cbb2]',
  alerta: 'border-[#7a6434] bg-[#332a16] text-[#ecd9a0]',
};

/** Banner de mensaje (éxito, error, información, advertencia). */
export function Aviso({ tono, children }: { tono: TonoAviso; children: ReactNode }) {
  return (
    <div role={tono === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${TONOS_AVISO[tono]}`}>
      {children}
    </div>
  );
}

/** Bloque esquelético de carga. */
export function Esqueleto({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#262017] ${className}`} aria-hidden="true" />;
}

/** Tarjeta base del panel. */
export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#3a3226] bg-[#1d1810] p-5 sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

/** Título de sección dentro del panel. */
export function TituloSeccion({ children }: { children: ReactNode }) {
  return <h2 className="font-serif text-lg text-[#f0e8da]">{children}</h2>;
}

/** Campo de texto/textarea etiquetado con error de validación. */
export function CampoTexto({
  id,
  etiqueta,
  valor,
  alCambiar,
  error,
  placeholder,
  multilinea,
  filas = 3,
  tipo = 'text',
  maxLength,
  ayuda,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  alCambiar: (valor: string) => void;
  error?: string;
  placeholder?: string;
  multilinea?: boolean;
  filas?: number;
  tipo?: string;
  maxLength?: number;
  ayuda?: string;
}) {
  const clases =
    'w-full rounded-xl border bg-[#262017] px-3 py-2.5 text-sm text-[#f0e8da] placeholder-[#6f6552] outline-none transition focus:border-[#d4b465] ' +
    (error ? 'border-[#7a4034]' : 'border-[#3a3226]');
  const alCambiarEvento = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => alCambiar(e.target.value);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-[#b3a68f]">
        {etiqueta}
      </label>
      {multilinea ? (
        <textarea
          id={id}
          value={valor}
          onChange={alCambiarEvento}
          placeholder={placeholder}
          rows={filas}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          className={`mt-1.5 resize-y ${clases}`}
        />
      ) : (
        <input
          id={id}
          type={tipo}
          value={valor}
          onChange={alCambiarEvento}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          className={`mt-1.5 ${clases}`}
        />
      )}
      {error ? (
        <p className="mt-1 text-[11px] text-[#f2b8ad]">{error}</p>
      ) : ayuda ? (
        <p className="mt-1 text-[11px] text-[#8a7d67]">{ayuda}</p>
      ) : null}
    </div>
  );
}

/** Etiqueta de estado (Publicada / Sin publicar). */
export function Insignia({ tono, children }: { tono: 'ok' | 'alerta'; children: ReactNode }) {
  const clases =
    tono === 'ok'
      ? 'border-[#3f5b3f] bg-[#1c2b1c] text-[#bfe3bf]'
      : 'border-[#7a6434] bg-[#332a16] text-[#ecd9a0]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${clases}`}>
      {children}
    </span>
  );
}

/** Fecha ISO → texto local es-UY (dd/mm/yyyy hh:mm). */
export function fechaCorta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
