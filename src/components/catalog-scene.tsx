import type { CSSProperties } from 'react';
import type { InvitationDesign } from '@/data/invitation-designs';
import { BACKGROUND_PRESETS } from '@/data/admin-options';
import MiniInvitation, { miniFromDesign } from '@/components/mini-invitation';
import { DesignAdornoGlyph } from '@/components/design-ornaments';

/**
 * Maqueta comercial del diseño: el MISMO fondo que la demo real (gradiente del
 * preset backgroundPreset + overlays idénticos a BackgroundSlideshow) compuesto
 * con el celular y la tarjeta física que muestran la invitación (mismo nombre,
 * fecha, paleta y adornos). Así lo que se ve en las galerías es exactamente lo
 * que se encuentra al abrir la demostración.
 */
export default function CatalogScene({ design, className }: { design: InvitationDesign; className?: string }) {
  const data = miniFromDesign(design);
  const preset = BACKGROUND_PRESETS.find((bg) => bg.id === design.backgroundPreset);
  const light = design.themeMode === 'light';

  // Fondo real de la demo: gradiente del preset (mismo que BackgroundSlideshow)
  const demoBackground = preset?.css || design.background;
  // Overlays de profundidad idénticos a los que aplica BackgroundSlideshow en la demo
  const demoOverlay = light
    ? 'linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, transparent 25%, transparent 80%, rgba(255,255,255,0.06) 100%)'
    : 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 15%, transparent 70%, rgba(0,0,0,0.5) 100%), radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)';

  const cardShadow: CSSProperties['boxShadow'] = light
    ? '0 18px 38px rgba(0,0,0,0.32), 0 4px 10px rgba(0,0,0,0.18)'
    : '0 0 0 1px rgba(255,255,255,0.09), 0 0 54px color-mix(in srgb, ' + design.accent + ' 20%, transparent), 0 24px 46px rgba(0,0,0,0.55)';

  return (
    <div
      role="img"
      aria-label={'Maqueta del diseño ' + design.name + ' con celular y tarjeta de invitación'}
      className={'relative isolate h-full w-full overflow-hidden ' + (className || '')}
    >
      {/* Fondo = el mismo gradiente que ve el invitado al abrir la demo */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: demoBackground }} />

      {/* Adornos temáticos tenues (eco de las partículas/adornos de la demo) */}
      <DesignAdornoGlyph
        adorno={design.adorno}
        className="absolute -left-[7%] -top-[5%] h-[40%] w-[40%]"
        style={{ color: design.accent, opacity: light ? 0.16 : 0.2 }}
      />
      <DesignAdornoGlyph
        adorno={design.adorno}
        flip
        className="absolute -bottom-[6%] -right-[7%] h-[44%] w-[44%]"
        style={{ color: design.accent, opacity: light ? 0.14 : 0.18 }}
      />

      {/* Overlay de profundidad (idéntico al de la demo) */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: demoOverlay }} />

      {/* Resplandor suave detrás de las maquetas en temas oscuros (separa el negro del negro) */}
      {!light && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 64% 54% at 50% 46%, color-mix(in srgb, ' + design.accent + ' 13%, transparent) 0%, transparent 72%)' }}
        />
      )}

      {/* Celular con la invitación en pantalla */}
      <div className="absolute" style={{ left: '6.5%', top: '12%', width: '43%', transform: 'rotate(-5deg)', containerType: 'inline-size' }}>
        <div
          className="rounded-[10.5cqw] bg-[#101012] p-[2.6%]"
          style={{ boxShadow: '0 20px 44px rgba(0,0,0,0.38), inset 0 0 0 1px rgba(255,255,255,0.10)' }}
        >
          <div className="relative aspect-[9/18.6] w-full overflow-hidden rounded-[8.5cqw]">
            <MiniInvitation data={data} variant="screen" />
            {/* Notch */}
            <div className="absolute left-1/2 top-[1.6%] h-[3%] w-[40%] -translate-x-1/2 rounded-full bg-[#101012]" />
            {/* Reflejo */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.14) 0%, transparent 26%, transparent 72%, rgba(255,255,255,0.05) 100%)' }} />
          </div>
        </div>
      </div>

      {/* Tarjeta física inclinada */}
      <div className="absolute" style={{ right: '5.5%', top: '16%', width: '44%', transform: 'rotate(6deg)' }}>
        <div
          className="relative aspect-[10/16.8] w-full overflow-hidden rounded-[4px]"
          style={{ boxShadow: cardShadow }}
        >
          <MiniInvitation data={data} variant="card" />
          {/* Brillo de papel */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(255,255,255,0.10) 0%, transparent 30%)' }} />
        </div>
      </div>
    </div>
  );
}
