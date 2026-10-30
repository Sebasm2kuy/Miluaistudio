'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, PenLine } from 'lucide-react';
import MiniInvitation, { miniFromDesign } from '@/components/mini-invitation';
import type { InvitationDesign } from '@/data/invitation-designs';
import {
  INDICE_INICIAL,
  INTERVALO_AUTOPLAY_MS,
  PAUSA_TRAS_INTERACCION_MS,
  indiceVecino,
  posicionSlide,
  UMBRAL_DESLIZAR_PX,
} from '@/lib/carrusel';

/**
 * Carrusel de diseños «como se ve desde un celular»: cada modelo de la
 * colección pasa por el frente dentro de una maqueta de teléfono; se puede
 * deslizar con el dedo (móvil), con flechas y puntos (escritorio) y avanza
 * solo salvo que el visitante esté interactuando. Tocar un borde trae ese
 * diseño al frente; los botones de acción abren la demo del diseño actual.
 */

const ESTILO_POSICION: Record<string, React.CSSProperties> = {
  actual: { transform: 'translateX(0) scale(1)', opacity: 1, zIndex: 30 },
  izquierda: { transform: 'translateX(-62%) scale(0.82) rotate(-3.5deg)', opacity: 0.5, zIndex: 20 },
  derecha: { transform: 'translateX(62%) scale(0.82) rotate(3.5deg)', opacity: 0.5, zIndex: 20 },
  oculta: { transform: 'translateX(0) scale(0.7)', opacity: 0, zIndex: 10, pointerEvents: 'none' },
};

export default function CarruselModelos({ designs }: { designs: InvitationDesign[] }) {
  const total = designs.length;
  const [actual, setActual] = useState(INDICE_INICIAL);
  const ultimaInteraccion = useRef(0);
  const inicioTactil = useRef<{ x: number; y: number } | null>(null);

  /** Va a un índice concreto (pausa el autoplay un rato) */
  const ir = useCallback(
    (i: number) => {
      ultimaInteraccion.current = Date.now();
      setActual(indiceVecino(i, 0, total));
    },
    [total],
  );

  const avanzar = useCallback(() => setActual((a) => indiceVecino(a, 1, total)), [total]);
  const retroceder = useCallback(() => setActual((a) => indiceVecino(a, -1, total)), [total]);

  // Autoplay: se pausa mientras la pestaña está oculta o tras una interacción
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => {
      if (document.hidden) return;
      if (Date.now() - ultimaInteraccion.current < PAUSA_TRAS_INTERACCION_MS) return;
      setActual((a) => indiceVecino(a, 1, total));
    }, INTERVALO_AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [total]);

  const actualDesign = designs[indiceVecino(actual, 0, total)];

  return (
    <div className="mt-2">
      <div
        role="region"
        aria-roledescription="carrusel"
        aria-label={'Carrusel de diseños de invitación, diseño ' + (actual + 1) + ' de ' + total + ': ' + actualDesign.name}
        tabIndex={0}
        className="relative mx-auto flex h-[540px] w-full max-w-[560px] touch-pan-y items-center justify-center overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#f6eee0]/70 via-[#f3e6d3]/50 to-[#ecdcc0]/60 outline-none focus-visible:ring-2 focus-visible:ring-[#cbb289] sm:h-[620px]"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            avanzar();
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            retroceder();
          }
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          inicioTactil.current = { x: t.clientX, y: t.clientY };
          ultimaInteraccion.current = Date.now();
        }}
        onTouchEnd={(e) => {
          const s = inicioTactil.current;
          inicioTactil.current = null;
          if (!s) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - s.x;
          const dy = t.clientY - s.y;
          ultimaInteraccion.current = Date.now();
          if (Math.abs(dx) > UMBRAL_DESLIZAR_PX && Math.abs(dx) > Math.abs(dy)) {
            // Deslizar a la izquierda pasa al siguiente; a la derecha, al anterior
            setActual((a) => indiceVecino(a, dx < 0 ? 1 : -1, total));
          }
        }}
      >
        {designs.map((design, i) => {
          const pos = posicionSlide(i, actual, total);
          const esActual = pos === 'actual';
          const cuerpo = (
            /* Ancho explícito: dentro del slide (flex centrado) un hijo sin
               ancho colapsa a 0 y el aspect-ratio no puede calcular altura */
            <div className="w-[236px] rounded-[2.6rem] bg-[#101012] p-2 shadow-[0_28px_60px_rgba(88,63,32,0.30)] sm:w-[272px]">
              <div className="relative aspect-[9/18.6] w-full overflow-hidden rounded-[2.1rem]">
                <MiniInvitation data={miniFromDesign(design)} variant="screen" />
                {/* Notch */}
                <div aria-hidden="true" className="absolute left-1/2 top-[1.6%] h-[3%] w-[40%] -translate-x-1/2 rounded-full bg-[#101012]" />
                {/* Reflejo de vidrio */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.14) 0%, transparent 26%, transparent 72%, rgba(255,255,255,0.05) 100%)' }} />
              </div>
            </div>
          );
          return (
            <div
              key={design.id}
              data-slide={design.id}
              data-posicion={pos}
              className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out"
              style={{ ...ESTILO_POSICION[pos], pointerEvents: esActual ? 'auto' : pos === 'oculta' ? 'none' : 'auto' }}
              aria-hidden={!esActual}
            >
              {esActual ? (
                cuerpo
              ) : (
                <button
                  type="button"
                  tabIndex={-1}
                  className="cursor-pointer"
                  aria-label={'Pasar al diseño ' + design.name}
                  onClick={() => ir(i)}
                >
                  {cuerpo}
                </button>
              )}
            </div>
          );
        })}

        {/* Flechas (escritorio y tablet) */}
        <button type="button" onClick={retroceder} aria-label="Diseño anterior" className="absolute left-1 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e0d2b8] bg-white/90 text-[#6d5326] shadow-[0_8px_22px_rgba(88,63,32,0.16)] transition hover:bg-white sm:flex">
          <ChevronLeft size={20} />
        </button>
        <button type="button" onClick={avanzar} aria-label="Diseño siguiente" className="absolute right-1 top-1/2 z-40 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e0d2b8] bg-white/90 text-[#6d5326] shadow-[0_8px_22px_rgba(88,63,32,0.16)] transition hover:bg-white sm:flex">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Nombre del diseño en pantalla + acciones */}
      <div aria-live="polite" className="mt-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a6534]">{actualDesign.category}</p>
        <p className="mt-1 font-serif text-2xl font-semibold text-[#292522]">{actualDesign.name}</p>
        <div className="mt-4 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <a href={'/Miluaistudio/catalogo/' + actualDesign.id + '/'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#26221d] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3d3830]">
            Ver demostración <ArrowRight size={14} />
          </a>
          <a href="/Miluaistudio/personalizar/" className="inline-flex items-center gap-2 rounded-full border border-[#e0d2b8] bg-white px-5 py-2.5 text-xs font-semibold text-[#3d3830] transition hover:border-[#dfc9a4]">
            Personalizar el mío <PenLine size={14} />
          </a>
        </div>
      </div>

      {/* Contador (siempre) + puntos solo en pantallas anchas: con 29
          diseños los puntos saturarían una fila móvil */}
      <p className="mt-3 text-center text-xs tabular-nums text-[#787168]" aria-hidden="true">
        {actual + 1} / {total}
      </p>
      <div className="mt-4 hidden flex-wrap items-center justify-center gap-2 sm:flex" role="group" aria-label="Ir a un diseño concreto">
        {designs.map((design, i) => (
          <button
            key={design.id}
            type="button"
            onClick={() => ir(i)}
            aria-label={'Ir al diseño ' + design.name}
            aria-current={i === actual}
            className={
              'h-2 rounded-full transition-all duration-300 ' +
              (i === actual ? 'w-6 bg-[#8a6534]' : 'w-2 bg-[#d9c9ad] hover:bg-[#c4a877]')
            }
          />
        ))}
      </div>
    </div>
  );
}
