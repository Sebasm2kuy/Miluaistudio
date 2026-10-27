import type { CSSProperties } from 'react';
import type { DesignAdorno, InvitationDesign, ThemeMode } from '@/data/invitation-designs';
import { DesignAdornoGlyph, CrownGlyph, ButterflyGlyph, SparkleGlyph } from '@/components/design-ornaments';
import type { SiteConfig } from '@/data/config';

export interface MiniInvitationData {
  name: string;
  tipo: string;
  dateLabel: string;
  bg: string;
  text: string;
  accent: string;
  accentSoft: string;
  muted: string;
  adorno: DesignAdorno;
  font: 'script' | 'serif' | 'sans';
  themeMode: ThemeMode;
  layout?: string;
}

const MESES: Record<string, string> = {
  enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
  julio: '07', agosto: '08', septiembre: '09', setiembre: '09', octubre: '10',
  noviembre: '11', diciembre: '12',
};

/** "15 de noviembre" + "2027" → "15 · 11 · 2027" (formato visual de la referencia) */
export function fechaVisual(fecha: string, anio: string): string {
  const m = fecha.match(/(\d{1,2})\s+de\s+([a-zá-úñ]+)/i);
  if (!m) return fecha + ' · ' + anio;
  const mes = MESES[m[2].toLowerCase()] ?? '01';
  return m[1].padStart(2, '0') + ' · ' + mes + ' · ' + anio;
}

export function miniFromDesign(d: InvitationDesign): MiniInvitationData {
  return {
    name: d.mockupName,
    tipo: d.mockupTipo,
    dateLabel: d.mockupDate,
    bg: d.cardBg,
    text: d.cardText,
    accent: d.accent,
    accentSoft: d.accentSoft,
    muted: d.muted,
    adorno: d.adorno,
    font: d.font,
    themeMode: d.themeMode,
    layout: d.layout,
  };
}

export function miniFromConfig(cfg: SiteConfig): MiniInvitationData {
  const fuente = cfg.estilos.fuenteTitulo;
  const font = fuente === 'alex-brush' || fuente === 'dancing-script' ? 'script' : fuente === 'montserrat' ? 'sans' : 'serif';
  return {
    name: cfg.evento.nombre,
    tipo: cfg.evento.tipo,
    dateLabel: fechaVisual(cfg.evento.fecha, cfg.evento.anio),
    bg: cfg.colores.fondo,
    text: cfg.colores.marfil,
    accent: cfg.colores.dorado,
    accentSoft: cfg.colores.principal,
    muted: cfg.colores.principal,
    adorno: (cfg.estilos.adorno as MiniInvitationData['adorno']) || 'rosas',
    font,
    themeMode: cfg.estilos.modoClaro ? 'light' : 'dark',
    layout: cfg.estilos.modeloComposicion,
  };
}

/* Cuenta regresiva ILUSTRATIVA de la maqueta: usa guiones, nunca números que
   puedan leerse como una cuenta real. Cada diseño de muestra tiene una fecha
   ficticia distinta, así que mostrar un valor fijo (120/14/32/05) daba la
   impresión de una cuenta regresiva falsa. El contador REAL vive dentro de
   cada invitación (countdown.tsx) y se prueba aparte. */
const COUNTDOWN: Array<{ value: string; label: string }> = [
  { value: '––', label: 'Días' },
  { value: '––', label: 'Horas' },
  { value: '––', label: 'Min' },
  { value: '––', label: 'Seg' },
];

function nameStyle(data: MiniInvitationData): CSSProperties {
  // Nombres largos ("Valentina & Diego") se reducen para no desbordar
  const scale = data.name.length > 14 ? 0.58 : data.name.length > 10 ? 0.72 : 1;
  if (data.font === 'script') {
    return { fontFamily: 'var(--font-cursive), "Alex Brush", cursive', fontSize: `${15 * scale}cqw`, lineHeight: 1.02 };
  }
  if (data.font === 'sans') {
    return { fontFamily: 'var(--font-sans), Arial, sans-serif', fontSize: `${10.5 * scale}cqw`, letterSpacing: '0.08em', fontWeight: 600 };
  }
  return { fontFamily: 'var(--font-serif), Georgia, serif', fontSize: `${12.5 * scale}cqw`, lineHeight: 1.05 };
}

interface MiniInvitationProps {
  data: MiniInvitationData;
  /** screen = pantalla del celular · card = tarjeta física · cover = portada del sobre */
  variant?: 'screen' | 'card' | 'cover';
  className?: string;
  style?: CSSProperties;
}

/**
 * Representación visual del diseño real (nombre, fecha, cuenta regresiva y
 * adornos temáticos) usada en la maqueta del catálogo y la portada del sobre.
 * Escala con container queries: se ve igual de bien a 90px o a 500px.
 */
export default function MiniInvitation({ data, variant = 'screen', className, style }: MiniInvitationProps) {
  const light = data.themeMode === 'light';
  const bgTop = light
    ? `color-mix(in srgb, ${data.bg} 55%, #ffffff)`
    : `color-mix(in srgb, ${data.bg} 82%, ${data.accentSoft})`;
  const bgBottom = light
    ? `color-mix(in srgb, ${data.bg} 88%, ${data.accentSoft})`
    : `color-mix(in srgb, ${data.bg} 86%, #000000)`;

  const royal = data.adorno === 'hojas-oro';
  const pad = variant === 'cover' ? '16cqw 11cqw' : variant === 'card' ? '13cqw 9cqw' : '15cqw 9cqw';

  return (
    <div
      data-mini-invitation=""
      data-theme={data.themeMode}
      className={'relative h-full w-full overflow-hidden ' + (className || '')}
      style={{
        containerType: 'inline-size',
        background: `linear-gradient(172deg, ${bgTop} 0%, ${data.bg} 55%, ${bgBottom} 100%)`,
        color: data.text,
        ...style,
      }}
    >
      {/* Adornos de esquina */}
      <DesignAdornoGlyph
        adorno={data.adorno}
        className="absolute"
        style={{ width: royal ? '30cqw' : '34cqw', top: royal ? '4cqw' : '2.5cqw', left: royal ? '4cqw' : '2cqw', color: data.accent, opacity: light ? 0.85 : 0.9 }}
      />
      <DesignAdornoGlyph
        adorno={data.adorno}
        flip
        className="absolute"
        style={{ width: royal ? '30cqw' : '34cqw', bottom: royal ? '4cqw' : '2.5cqw', right: royal ? '4cqw' : '2cqw', color: data.accent, opacity: light ? 0.85 : 0.9 }}
      />

      {/* Marco fino (temas reales/gala) */}
      {royal && (
        <div
          className="pointer-events-none absolute rounded-[1.5cqw]"
          style={{ inset: '6cqw', border: `0.5cqw solid color-mix(in srgb, ${data.accent} 70%, transparent)`, boxShadow: `inset 0 0 0 0.9cqw color-mix(in srgb, ${data.accent} 22%, transparent)` }}
        />
      )}

      {/* Contenido */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center" style={{ padding: pad }}>
        {royal && <CrownGlyph style={{ width: '13cqw', color: data.accent, marginBottom: '2.5cqw' }} />}
        {data.adorno === 'mariposas' && <ButterflyGlyph style={{ width: '10cqw', color: data.accent, marginBottom: '2cqw' }} />}
        {data.adorno === 'luna-estrellas' && <SparkleGlyph style={{ width: '6.5cqw', color: data.accent, marginBottom: '2cqw' }} />}

        <p style={{ fontSize: '4.4cqw', letterSpacing: '0.34em', textIndent: '0.34em', color: data.muted, fontFamily: 'var(--font-serif), Georgia, serif', textTransform: 'uppercase' }}>
          {data.tipo}
        </p>

        {/* Nombre decorativo de la maqueta: no es un encabezado del documento,
            solo parte del arte ilustrativo. Se usa div para no romper la
            jerarquía semántica del H1 comercial de cada página. */}
        <div style={{ ...nameStyle(data), color: data.accent, marginTop: '2.2cqw', textShadow: light ? 'none' : `0 0 ${'3cqw'} color-mix(in srgb, ${data.accent} 30%, transparent)` }}>
          {data.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2cqw', margin: '3.4cqw 0' }}>
          <span style={{ width: '14cqw', height: '1px', background: `linear-gradient(90deg, transparent, ${data.accent})` }} />
          <span style={{ width: '1.6cqw', height: '1.6cqw', rotate: '45deg', background: data.accent }} />
          <span style={{ width: '14cqw', height: '1px', background: `linear-gradient(90deg, ${data.accent}, transparent)` }} />
        </div>

        <p style={{ fontSize: '4.6cqw', letterSpacing: '0.26em', textIndent: '0.26em', color: data.text }}>
          {data.dateLabel}
        </p>

        {(
          <div aria-hidden="true" style={{ marginTop: '4.5cqw', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2.4cqw', width: '78%' }}>
          {COUNTDOWN.map((item) => (
            <div
              key={item.label}
              style={{
                padding: '2.2cqw 0.5cqw',
                borderRadius: '2.2cqw',
                background: light ? 'rgba(255,255,255,0.85)' : `color-mix(in srgb, ${data.accent} 16%, transparent)`,
                border: `1px solid color-mix(in srgb, ${data.accent} ${light ? '30%' : '45%'}, transparent)`,
                boxShadow: light ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <div style={{ fontSize: '6.4cqw', lineHeight: 1, color: light ? data.text : data.accent, fontVariantNumeric: 'tabular-nums' }}>{item.value}</div>
              <div style={{ fontSize: '2.7cqw', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '1.2cqw', color: data.muted }}>{item.label}</div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
