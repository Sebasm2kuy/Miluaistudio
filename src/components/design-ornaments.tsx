import type { CSSProperties } from 'react';
import type { DesignAdorno } from '@/data/invitation-designs';

/**
 * Adornos SVG temáticos por diseño. Todos dibujan con `currentColor`
 * para heredar el color de acento del tema contenedor.
 */

interface GlyphProps {
  adorno: DesignAdorno;
  className?: string;
  style?: CSSProperties;
  /** Espeja horizontalmente (para esquinas opuestas) */
  flip?: boolean;
  /** Opacidad global del adorno */
  opacity?: number;
}

function Glyph({ adorno, className, style, flip, opacity = 1 }: GlyphProps & { adorno: DesignAdorno }) {
  const svgProps = {
    className,
    style: { ...style, transform: flip ? 'scaleX(-1)' : undefined, opacity },
    'aria-hidden': true as const,
    focusable: false as const,
  };

  if (adorno === 'rosas' || adorno === 'rosas-coral') {
    const coral = adorno === 'rosas-coral';
    return (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
        {/* Rosa principal */}
        <circle cx="86" cy="88" r="26" stroke="currentColor" strokeWidth="3" />
        <path d="M86 66c10 1 18 9 19 19 1 11-7 21-18 22-9 1-18-6-19-15-1-8 5-16 13-17 7-1 13 4 14 11 1 6-3 11-9 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        {/* Pétalos exteriores */}
        <path d="M60 74c-6-8-5-19 2-26 7-6 17-7 25-2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity=".75" />
        <path d="M112 74c8-5 18-3 24 4 5 7 5 16 0 23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity=".75" />
        <path d="M92 116c3 8 1 17-5 23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity=".75" />
        {/* Hoja izquierda */}
        <path d="M46 118C34 112 26 100 27 87c12 1 23 9 27 21 1 4 0 8-2 10-2 1-4 1-6 0Z" fill="currentColor" opacity=".5" />
        <path d="M31 92c8 6 17 14 24 22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
        {/* Hoja derecha */}
        <path d="M126 112c4-13 14-22 27-24 1 12-5 24-16 30-4 2-8 2-10 0-2-1-2-4-1-6Z" fill="currentColor" opacity=".5" />
        {/* Capullo */}
        <path d="M142 148c-1-9 4-17 12-20 6 7 6 17 0 24-4 4-9 3-12-4Z" stroke="currentColor" strokeWidth="2.2" />
        <path d="M148 146c2-6 6-11 11-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
        {/* Tallo */}
        <path d="M92 118c-2 18-6 34-14 48" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        {coral && <circle cx="60" cy="146" r="5" fill="currentColor" opacity=".65" />}
        {coral && <circle cx="150" cy="96" r="3.5" fill="currentColor" opacity=".5" />}
        {/* Puntitos */}
        <circle cx="44" cy="60" r="2.6" fill="currentColor" opacity=".55" />
        <circle cx="150" cy="60" r="2.2" fill="currentColor" opacity=".45" />
      </svg>
    );
  }

  if (adorno === 'hojas-oro') {
    return (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
        {/* Rama principal */}
        <path d="M28 176C52 138 84 104 128 82c18-9 36-15 50-18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M62 138c20 2 38 12 49 28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity=".8" />
        {/* Hojas superiores */}
        <path d="M96 108c-4-14 1-28 12-37 8 11 8 26-1 37-3 4-8 4-11 0Z" fill="currentColor" opacity=".85" />
        <path d="M124 92c-2-13 4-26 15-33 6 11 4 25-5 34-3 3-8 3-10-1Z" fill="currentColor" opacity=".7" />
        <path d="M150 76c0-12 8-23 20-27 4 11 0 24-9 31-4 3-9 2-11-4Z" fill="currentColor" opacity=".6" />
        {/* Hojas inferiores */}
        <path d="M86 124c-13-5-21-17-21-30 12 3 22 13 25 26 1 3-1 5-4 4Z" fill="currentColor" opacity=".75" />
        <path d="M64 146c-14-3-24-14-26-27 13 1 24 10 29 22 1 3-1 6-3 5Z" fill="currentColor" opacity=".65" />
        {/* Destellos */}
        <path d="M158 130l2.4 6.8 6.8 2.4-6.8 2.4-2.4 6.8-2.4-6.8-6.8-2.4 6.8-2.4 2.4-6.8Z" fill="currentColor" opacity=".8" />
        <path d="M52 76l1.6 4.6 4.6 1.6-4.6 1.6-1.6 4.6-1.6-4.6-4.6-1.6 4.6-1.6 1.6-4.6Z" fill="currentColor" opacity=".6" />
        <circle cx="172" cy="56" r="2.6" fill="currentColor" opacity=".6" />
      </svg>
    );
  }

  if (adorno === 'flores-silvestres') {
    return (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
        {/* Tallo alto con margarita */}
        <path d="M64 176c-4-40-2-78 8-112" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse key={deg} cx="72" cy="48" rx="6.5" ry="12" fill="currentColor" opacity=".8" transform={`rotate(${deg} 72 60)`} />
        ))}
        <circle cx="72" cy="60" r="7" stroke="currentColor" strokeWidth="2.2" />
        {/* Hojas del tallo */}
        <path d="M66 128c-12-2-21-10-24-21 11-1 21 5 26 15 1 3-1 6-2 6Z" fill="currentColor" opacity=".55" />
        <path d="M70 96c11-4 22-2 30 5-8 7-20 9-29 4-2-2-3-6-1-9Z" fill="currentColor" opacity=".5" />
        {/* Flor secundaria */}
        <path d="M124 176c2-26 6-48 16-66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".85" />
        <circle cx="140" cy="104" r="5.5" fill="currentColor" opacity=".85" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <circle key={deg} cx={140 + 11 * Math.cos((deg * Math.PI) / 180)} cy={98 + 11 * Math.sin((deg * Math.PI) / 180)} r="3.4" fill="currentColor" opacity=".6" />
        ))}
        {/* Brotes */}
        <path d="M156 168c8-4 13-12 13-21-8 2-15 9-17 17 0 2 2 4 4 4Z" stroke="currentColor" strokeWidth="2" opacity=".8" />
        <circle cx="44" cy="60" r="3" fill="currentColor" opacity=".5" />
        <circle cx="36" cy="84" r="2.2" fill="currentColor" opacity=".4" />
      </svg>
    );
  }

  if (adorno === 'luna-estrellas') {
    return (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
        {/* Luna creciente */}
        <path d="M118 34a52 52 0 1 0 30 94 44 44 0 0 1-30-94Z" fill="currentColor" opacity=".9" />
        <path d="M126 44a44 44 0 1 0 22 78 38 38 0 0 1-22-78Z" fill="currentColor" opacity=".35" />
        {/* Estrellas de 4 puntas */}
        <path d="M52 60l3 9.4L64.4 72l-9.4 3-3 9.4-3-9.4-9.4-3 9.4-3 3-9.4Z" fill="currentColor" opacity=".95" />
        <path d="M60 132l2.2 6.8 6.8 2.2-6.8 2.2-2.2 6.8-2.2-6.8-6.8-2.2 6.8-2.2 2.2-6.8Z" fill="currentColor" opacity=".8" />
        <path d="M148 148l1.8 5.6 5.6 1.8-5.6 1.8-1.8 5.6-1.8-5.6-5.6-1.8 5.6-1.8 1.8-5.6Z" fill="currentColor" opacity=".7" />
        {/* Estrellitas y polvo */}
        <circle cx="150" cy="52" r="3" fill="currentColor" opacity=".8" />
        <circle cx="170" cy="96" r="2.2" fill="currentColor" opacity=".6" />
        <circle cx="96" cy="164" r="2.6" fill="currentColor" opacity=".55" />
        <circle cx="36" cy="96" r="1.8" fill="currentColor" opacity=".45" />
        <circle cx="130" cy="128" r="1.8" fill="currentColor" opacity=".4" />
      </svg>
    );
  }

  if (adorno === 'eucalipto') {
    return (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
        <path d="M44 178C62 140 88 104 128 76c12-8 24-15 34-19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        {/* Hojas redondas alternadas */}
        <circle cx="62" cy="148" r="13" fill="currentColor" opacity=".55" />
        <circle cx="88" cy="122" r="12" fill="currentColor" opacity=".7" />
        <circle cx="112" cy="102" r="11" fill="currentColor" opacity=".55" />
        <circle cx="136" cy="84" r="10" fill="currentColor" opacity=".7" />
        <circle cx="158" cy="66" r="9" fill="currentColor" opacity=".55" />
        <circle cx="76" cy="164" r="8" fill="currentColor" opacity=".45" />
        {/* Ramita secundaria */}
        <path d="M96 122c10 6 16 16 17 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".8" />
        <circle cx="116" cy="152" r="7.5" fill="currentColor" opacity=".5" />
        <circle cx="108" cy="168" r="5.5" fill="currentColor" opacity=".4" />
      </svg>
    );
  }

  if (adorno === 'mariposas') {
    return (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
        {/* Mariposa grande */}
        <g transform="rotate(-12 96 92)">
          <path d="M96 92C86 72 66 60 50 66c-10 4-12 18-4 26 6 6 16 8 26 6-10 6-14 16-10 25 4 8 15 10 22 4 7-6 10-18 12-35Z" fill="currentColor" opacity=".85" />
          <path d="M96 92c10-20 30-32 46-26 10 4 12 18 4 26-6 6-16 8-26 6 10 6 14 16 10 25-4 8-15 10-22 4-7-6-10-18-12-35Z" fill="currentColor" opacity=".6" />
          <ellipse cx="96" cy="98" rx="3.4" ry="12" fill="currentColor" />
          <path d="M94 86c-4-8-10-13-17-15M98 86c4-8 10-13 17-15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </g>
        {/* Mariposa chica */}
        <g transform="rotate(14 148 148) scale(.55) translate(120 90)">
          <path d="M96 92C86 72 66 60 50 66c-10 4-12 18-4 26 6 6 16 8 26 6-10 6-14 16-10 25 4 8 15 10 22 4 7-6 10-18 12-35Z" fill="currentColor" opacity=".7" />
          <path d="M96 92c10-20 30-32 46-26 10 4 12 18 4 26-6 6-16 8-26 6 10 6 14 16 10 25-4 8-15 10-22 4-7-6-10-18-12-35Z" fill="currentColor" opacity=".5" />
          <ellipse cx="96" cy="98" rx="3.4" ry="12" fill="currentColor" />
        </g>
        {/* Trayectoria punteada */}
        <path d="M40 160c24 6 46 2 62-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 9" opacity=".7" />
        <circle cx="34" cy="52" r="2.6" fill="currentColor" opacity=".6" />
        <circle cx="164" cy="96" r="2.2" fill="currentColor" opacity=".5" />
      </svg>
    );
  }

  if (adorno === 'hojas-tropicales') {
    return (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
        {/* Hoja tipo monstera */}
        <path d="M78 168c-22-8-38-28-40-52-2-26 12-50 34-60 4 8 4 18 0 26 10-4 22-2 30 6-8 6-12 16-10 26 8-6 19-7 28-2-6 9-8 20-4 30-8-2-17 0-23 6 5 6 7 14 5 22-7 2-14 1-20-2Z" fill="currentColor" opacity=".8" />
        {/* Slices de monstera */}
        <path d="M56 118c10 4 20 12 26 22M62 92c10 2 20 8 27 16M84 70c8 5 15 13 19 22" stroke="var(--ornament-slit, #f4f1e6)" strokeWidth="5" strokeLinecap="round" opacity=".9" />
        {/* Tallo */}
        <path d="M78 168c8-14 20-24 34-30" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        {/* Hoja de palmera */}
        <path d="M148 44c14 8 24 22 26 38-16-2-30-12-37-26-2-5 3-12 11-12Z" fill="currentColor" opacity=".55" />
        <path d="M156 92c14 2 26 11 32 24-15 3-31-3-40-15-3-4 1-9 8-9Z" fill="currentColor" opacity=".4" />
        <circle cx="48" cy="52" r="3" fill="currentColor" opacity=".5" />
        <circle cx="170" cy="150" r="2.6" fill="currentColor" opacity=".45" />
      </svg>
    );
  }

  // geometrico
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...svgProps}>
      {/* Arco */}
      <path d="M56 168V96a34 34 0 0 1 68 0v72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Círculo relleno */}
      <circle cx="146" cy="80" r="22" fill="currentColor" opacity=".75" />
      {/* Semicírculo */}
      <path d="M96 52a24 24 0 0 1 48 0" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" opacity=".8" />
      {/* Cuarto de círculo punteado */}
      <path d="M150 128a26 26 0 0 1 26 26" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="2 8" opacity=".8" />
      {/* Rectángulo chico */}
      <rect x="40" y="40" width="16" height="16" rx="3" fill="currentColor" opacity=".5" />
      <circle cx="118" cy="140" r="4" fill="currentColor" opacity=".6" />
    </svg>
  );
}

export function DesignAdornoGlyph(props: GlyphProps) {
  return <Glyph {...props} adorno={props.adorno} />;
}

/** Corona pequeña (usada en temas tipo "Oro Real") */
export function CrownGlyph({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden focusable={false}>
      <path d="M8 30 6 12l10 8 16-14 16 14 10-8-2 18c-12 4-36 4-48 0Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" fill="none" />
      <path d="M8 34h48" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="6" cy="9" r="2.4" fill="currentColor" />
      <circle cx="32" cy="4" r="2.4" fill="currentColor" />
      <circle cx="58" cy="9" r="2.4" fill="currentColor" />
    </svg>
  );
}

/** Mariposa pequeña individual (para tarjetas mini) */
export function ButterflyGlyph({ className, style, flip }: { className?: string; style?: CSSProperties; flip?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ ...style, transform: flip ? 'scaleX(-1)' : undefined }} aria-hidden focusable={false}>
      <path d="M32 34C26 22 16 16 9 19c-5 2-6 9-2 13 3 3 8 4 13 3-5 3-7 8-5 13 2 4 8 5 11 2 3-3 5-9 6-16Z" fill="currentColor" opacity=".8" />
      <path d="M32 34c6-12 16-18 23-15 5 2 6 9 2 13-3 3-8 4-13 3 5 3 7 8 5 13-2 4-8 5-11 2-3-3-5-9-6-16Z" fill="currentColor" opacity=".55" />
      <ellipse cx="32" cy="37" rx="1.8" ry="6.5" fill="currentColor" />
      <path d="M31 30c-2-4-5-7-9-8M33 30c2-4 5-7 9-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Estrella de 4 puntas (destello) */
export function SparkleGlyph({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden focusable={false}>
      <path d="M16 2l3 10.4L29.4 16 19 19.6 16 30l-3-10.4L2.6 16 13 12.4 16 2Z" fill="currentColor" />
    </svg>
  );
}
