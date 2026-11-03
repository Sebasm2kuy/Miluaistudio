'use client';

// ============================================================
// GRÁFICOS SVG DEL PANEL DEL ESTUDIO — iteración 042
// ------------------------------------------------------------
// Barras agrupadas dibujadas a mano en SVG: cero dependencias nuevas,
// control total del estilo (paleta dorado/champagne de la web) y
// accesible (role="img" + <title> nativo por barra).
// Escala Y con líneas guía y máximo honesto: si no hay datos, muestra
// un estado vacío en lugar de un gráfico sin explicación.
// ============================================================

import { useMemo } from 'react';

export interface ParSerie {
  dia: string;
  a: number;
  b: number;
}

/**
 * Gráfico de barras agrupadas (dos series por día).
 * `a` = serie principal (rellena), `b` = serie secundaria (clara con borde).
 */
export function GraficoBarras({
  serie,
  nombres,
  colorPrincipal,
  alto = 180,
  mensajeVacio = 'Sin datos todavía en este período.',
}: {
  serie: ParSerie[];
  nombres: [string, string];
  colorPrincipal: string;
  alto?: number;
  mensajeVacio?: string;
}) {
  const { maximo, hayDatos } = useMemo(() => {
    const max = Math.max(1, ...serie.map((d) => Math.max(d.a, d.b)));
    const total = serie.reduce((acc, d) => acc + d.a + d.b, 0);
    return { maximo: max, hayDatos: total > 0 };
  }, [serie]);

  const ANCHO = 560;
  const PAD_IZQ = 34;
  const PAD_DER = 8;
  const PAD_BASE = 22;
  const altoUtil = alto - PAD_BASE - 8;
  const anchoUtil = ANCHO - PAD_IZQ - PAD_DER;
  const n = Math.max(serie.length, 1);
  const paso = anchoUtil / n;
  const anchoBarra = Math.max(3, Math.min(14, paso / 2.6));
  const etiquetasCada = Math.max(1, Math.ceil(n / 7));

  if (!hayDatos) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-[#e8e0d7] bg-[#faf8f4] px-4 text-center text-xs text-[#716a63]"
        style={{ height: alto }}
      >
        {mensajeVacio}
      </div>
    );
  }

  const yDe = (valor: number) => PAD_BASE + altoUtil - (valor / maximo) * altoUtil;

  return (
    <div>
      {/* Leyenda */}
      <div className="mb-2 flex flex-wrap items-center gap-4 text-[11px] text-[#54483e]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colorPrincipal }} />
          {nombres[0]}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-[#d8ccb8] bg-[#f3ead9]" />
          {nombres[1]}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${ANCHO} ${alto}`}
        className="w-full"
        role="img"
        aria-label={`Gráfico de barras: ${nombres[0]} y ${nombres[1]} por día`}
      >
        {/* Líneas guía */}
        {[0, 0.5, 1].map((fraccion) => {
          const valor = Math.round(maximo * fraccion);
          const y = yDe(valor);
          return (
            <g key={fraccion}>
              <line x1={PAD_IZQ} x2={ANCHO - PAD_DER} y1={y} y2={y} stroke="#e8e0d7" strokeWidth="1" />
              <text x={PAD_IZQ - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#716a63">
                {valor}
              </text>
            </g>
          );
        })}

        {serie.map((d, i) => {
          const centro = PAD_IZQ + paso * i + paso / 2;
          const yA = yDe(d.a);
          const yB = yDe(d.b);
          const mostrarEtiqueta = i % etiquetasCada === 0 || i === serie.length - 1;
          return (
            <g key={d.dia}>
              <rect
                x={centro - anchoBarra - 1}
                y={yA}
                width={anchoBarra}
                height={Math.max(0, PAD_BASE + altoUtil - yA)}
                rx="1.5"
                fill={colorPrincipal}
              >
                <title>{`${d.dia} · ${nombres[0]}: ${d.a}`}</title>
              </rect>
              <rect
                x={centro + 1}
                y={yB}
                width={anchoBarra}
                height={Math.max(0, PAD_BASE + altoUtil - yB)}
                rx="1.5"
                fill="#f3ead9"
                stroke="#d8ccb8"
                strokeWidth="1"
              >
                <title>{`${d.dia} · ${nombres[1]}: ${d.b}`}</title>
              </rect>
              {mostrarEtiqueta && (
                <text x={centro} y={alto - 6} textAnchor="middle" fontSize="9" fill="#716a63">
                  {etiquetaDia(d.dia)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Etiqueta corta del día: "3/11" (día/mes) para no saturar el eje X. */
function etiquetaDia(dia: string): string {
  const partes = dia.split('-');
  if (partes.length !== 3) return dia;
  const diaNum = parseInt(partes[2], 10);
  const mesNum = parseInt(partes[1], 10);
  return `${diaNum}/${mesNum}`;
}
