'use client';

// ============================================================
// MÉTRICAS DEL PANEL DEL ESTUDIO — tarjetas, selector de período y
// gráficos (iteración 042). Presentación pura: los cálculos llegan
// hechos desde src/lib/admin-metricas.ts (probados en la suite).
// Estados honestos: sin backend activo la sección de tráfico se
// muestra como «no disponible», nunca con ceros inventados.
// ============================================================

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CalendarRange, Eye, RefreshCw, UserPlus, Users } from 'lucide-react';
import type { PeriodoMetricas, RangoDias } from '@/lib/admin-metricas';
import { GraficoBarras, type ParSerie } from './graficos';

export type EstadoBackendMetricas =
  | { estado: 'cargando' }
  | { estado: 'ok' }
  | { estado: 'error'; motivo: string; mensaje: string };

const ETIQUETAS_PERIODO: Array<{ valor: PeriodoMetricas; etiqueta: string }> = [
  { valor: 'hoy', etiqueta: 'Hoy' },
  { valor: '7d', etiqueta: 'Últimos 7 días' },
  { valor: '30d', etiqueta: 'Último mes' },
  { valor: 'personalizado', etiqueta: 'Personalizado' },
];

/** Tarjeta numérica del panel. */
export function TarjetaMetrica({
  etiqueta,
  valor,
  detalle,
  icono: Icono,
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
  icono: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e0d7] bg-white p-4 shadow-[0_4px_16px_rgba(34,26,19,0.04)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#716a63]">{etiqueta}</p>
        <Icono size={15} className="shrink-0 text-[#8a6534]" />
      </div>
      <p className="mt-2 font-serif text-3xl leading-none text-[#292522]">{valor}</p>
      {detalle && <p className="mt-2 text-[11px] leading-relaxed text-[#716a63]">{detalle}</p>}
    </div>
  );
}

/** Selector del período + rango personalizado (inputs date). */
export function SelectorPeriodo({
  periodo,
  alCambiarPeriodo,
  desde,
  hasta,
  alCambiarDesde,
  alCambiarHasta,
  hoyIso,
}: {
  periodo: PeriodoMetricas;
  alCambiarPeriodo: (p: PeriodoMetricas) => void;
  desde: string;
  hasta: string;
  alCambiarDesde: (v: string) => void;
  alCambiarHasta: (v: string) => void;
  hoyIso: string;
}) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div role="tablist" aria-label="Período de las métricas" className="flex flex-wrap gap-1.5">
        {ETIQUETAS_PERIODO.map(({ valor, etiqueta }) => (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={periodo === valor}
            onClick={() => alCambiarPeriodo(valor)}
            className={`rounded-full px-3.5 py-2 text-xs font-medium transition ${
              periodo === valor
                ? 'bg-[#26221d] text-white'
                : 'border border-[#e8e0d7] bg-white text-[#54483e] hover:border-[#dfc9a4] hover:bg-[#f6efe2]'
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {periodo === 'personalizado' && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-[11px] text-[#716a63]">
            Desde
            <input
              type="date"
              value={desde}
              max={hoyIso}
              onChange={(e) => alCambiarDesde(e.target.value)}
              className="mt-1 block rounded-xl border border-[#e8e0d7] bg-white px-3 py-2 text-xs text-[#292522] outline-none transition focus:border-[#8a6534]"
            />
          </label>
          <label className="text-[11px] text-[#716a63]">
            Hasta
            <input
              type="date"
              value={hasta}
              max={hoyIso}
              onChange={(e) => alCambiarHasta(e.target.value)}
              className="mt-1 block rounded-xl border border-[#e8e0d7] bg-white px-3 py-2 text-xs text-[#292522] outline-none transition focus:border-[#8a6534]"
            />
          </label>
        </div>
      )}
    </div>
  );
}

export interface DatosSeccionMetricas {
  estadoBackend: EstadoBackendMetricas;
  /** true si hay filas de tráfico (backend activo y respondió). */
  conTrafico: boolean;
  rangoValido: boolean;
  rango: RangoDias | null;
  visitas: number;
  unicas: number;
  nuevas: number;
  online: number;
  serieTrafico: ParSerie[];
  serieRegistros: ParSerie[];
  registrosPeriodo: number;
  confirmacionesPeriodo: number;
  totalCuentas: number;
  totalPersonasAsisten: number;
  conversionRegistros: number | null;
  conversionConfirmaciones: number | null;
  etiquetaRango: string;
  actualizando: boolean;
  alActualizar: () => void;
  /** Selector de período (renderiza dentro de la sección, junto al título). */
  selector: ReactNode;
  /** Aviso de rango personalizado inválido (si aplica). */
  avisoRango?: ReactNode;
}

/** Sección completa de métricas (tarjetas + gráficos). */
export function SeccionMetricas(datos: DatosSeccionMetricas) {
  const {
    estadoBackend,
    conTrafico,
    rangoValido,
    visitas,
    unicas,
    nuevas,
    online,
    serieTrafico,
    serieRegistros,
    registrosPeriodo,
    confirmacionesPeriodo,
    totalCuentas,
    totalPersonasAsisten,
    conversionRegistros,
    conversionConfirmaciones,
    etiquetaRango,
    actualizando,
    alActualizar,
    selector,
    avisoRango,
  } = datos;

  const porcentaje = (v: number | null) => (v === null ? '—' : `${String(v).replace('.', ',')}%`);

  return (
    <section className="space-y-4" aria-label="Métricas del sitio">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg text-[#292522]">Métricas del sitio</h2>
          <p className="mt-0.5 text-xs text-[#716a63]">{etiquetaRango}</p>
        </div>
        <button
          type="button"
          onClick={alActualizar}
          disabled={actualizando}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e0d7] bg-white px-3.5 py-2 text-xs font-medium text-[#54483e] transition hover:border-[#dfc9a4] hover:bg-[#f6efe2] disabled:opacity-60"
        >
          <RefreshCw size={13} className={actualizando ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Selector de período compartido por todas las cifras */}
      <div className="rounded-2xl border border-[#e8e0d7] bg-white p-3.5 shadow-[0_4px_16px_rgba(34,26,19,0.04)]">
        {selector}
        {avisoRango}
      </div>

      {estadoBackend.estado === 'error' && (
        <div role="alert" className="rounded-xl border border-[#e7d3a2] bg-[#faf3e0] px-4 py-3 text-xs leading-relaxed text-[#6b4e16]">
          {estadoBackend.mensaje}
        </div>
      )}

      {/* Tráfico — solo con backend activo (fail-closed: nunca ceros inventados) */}
      {conTrafico && rangoValido ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TarjetaMetrica
              etiqueta="Visitas"
              valor={String(visitas)}
              detalle={`${unicas} sesiones únicas · ${nuevas} nuevos visitantes`}
              icono={Eye}
            />
            <TarjetaMetrica
              etiqueta="Online ahora"
              valor={String(online)}
              detalle="Personas con la web abierta (últimos 5 min)"
              icono={Users}
            />
            <TarjetaMetrica
              etiqueta="Nuevas cuentas"
              valor={String(registrosPeriodo)}
              detalle={`${totalCuentas} clientes registrados en total`}
              icono={UserPlus}
            />
            <TarjetaMetrica
              etiqueta="Confirmaciones"
              valor={String(confirmacionesPeriodo)}
              detalle={`${totalPersonasAsisten} personas asisten en total`}
              icono={CalendarRange}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#e8e0d7] bg-white p-4 shadow-[0_4px_16px_rgba(34,26,19,0.04)]">
              <p className="mb-3 font-serif text-sm text-[#292522]">Tendencia de tráfico por día</p>
              <GraficoBarras
                serie={serieTrafico}
                nombres={['Visitas', 'Únicas']}
                colorPrincipal="#dfc9a4"
                mensajeVacio="Sin visitas registradas en este período todavía."
              />
            </div>
            <div className="rounded-2xl border border-[#e8e0d7] bg-white p-4 shadow-[0_4px_16px_rgba(34,26,19,0.04)]">
              <p className="mb-3 font-serif text-sm text-[#292522]">Registros y confirmaciones por día</p>
              <GraficoBarras
                serie={serieRegistros}
                nombres={['Nuevas cuentas', 'Confirmaciones']}
                colorPrincipal="#8a6534"
                mensajeVacio="Sin registros ni confirmaciones en este período todavía."
              />
            </div>
          </div>

          {/* Conversión */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#e8e0d7] bg-white p-4 shadow-[0_4px_16px_rgba(34,26,19,0.04)]">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#716a63]">Conversión a cuenta</p>
              <p className="mt-2 font-serif text-2xl text-[#292522]">{porcentaje(conversionRegistros)}</p>
              <p className="mt-1 text-[11px] text-[#716a63]">
                {registrosPeriodo} nuevas cuentas sobre {visitas} visitas del período
              </p>
            </div>
            <div className="rounded-2xl border border-[#e8e0d7] bg-white p-4 shadow-[0_4px_16px_rgba(34,26,19,0.04)]">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#716a63]">Conversión a confirmación</p>
              <p className="mt-2 font-serif text-2xl text-[#292522]">{porcentaje(conversionConfirmaciones)}</p>
              <p className="mt-1 text-[11px] text-[#716a63]">
                {confirmacionesPeriodo} confirmaciones sobre {visitas} visitas del período
              </p>
            </div>
          </div>
        </>
      ) : (
        estadoBackend.estado !== 'error' && (
          <div className="rounded-xl border border-dashed border-[#e8e0d7] bg-[#faf8f4] px-4 py-6 text-center text-xs leading-relaxed text-[#716a63]">
            {estadoBackend.estado === 'cargando'
              ? 'Consultando las métricas al backend del estudio…'
              : 'Las métricas de tráfico se muestran cuando el backend del estudio responde con datos.'}
          </div>
        )
      )}
    </section>
  );
}
