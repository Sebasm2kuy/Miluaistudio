import type { ReactNode } from 'react';
import { SparkleGlyph } from '@/components/design-ornaments';

/**
 * Piezas visuales compartidas de la tienda (portada + catálogo):
 * encabezados de sección con identidad editorial y divisores ornamentales.
 */

/* Champagne de texto auditado WCAG AA: 5.26:1 sobre blanco y 4.96:1 sobre
   marfil (los anteriores #a8814f y #9a7440 no alcanzaban 4.5:1 para texto
   normal). Mantiene la lectura de dorado cálido de la marca.
   Token y verificación: src/data/store-tokens.ts + tests/contraste-wcag.test.ts */
const GOLD = '#8a6534';
const INK_MUTED = '#6f675e';

/** Encabezado de sección: anticódigo serif itálico dorado + título Playfair + bajada */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = 'center',
  headingId,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  align?: 'center' | 'left';
  headingId?: string;
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p
        className="font-serif text-xl italic sm:text-2xl"
        style={{ color: GOLD }}
      >
        {eyebrow}
      </p>
      <h2
        id={headingId}
        className="mt-2 font-serif text-3xl leading-[1.15] tracking-tight text-[#29241f] sm:text-4xl"
      >
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-sm leading-relaxed sm:text-base" style={{ color: INK_MUTED }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/** Divisor ornamental: línea — destello — línea */
export function OrnamentDivider({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={'flex items-center justify-center gap-3 ' + className}
      style={{ color: GOLD }}
    >
      <span className="h-px w-12 sm:w-20" style={{ background: 'linear-gradient(90deg, transparent, #cbb289)' }} />
      <SparkleGlyph className="h-4 w-4" />
      <span className="h-px w-12 sm:w-20" style={{ background: 'linear-gradient(270deg, transparent, #cbb289)' }} />
    </div>
  );
}

/** Sello/insignia flotante para el hero */
export function HeroBadge({ children }: { children: ReactNode }) {
  return (
    <div className="float-soft inline-flex items-center gap-2 rounded-full border border-[#eadfca] bg-white/95 px-4 py-2.5 text-[11px] font-semibold text-[#4a4239] shadow-[0_10px_30px_rgba(88,63,32,0.14)] sm:text-xs">
      {children}
    </div>
  );
}
