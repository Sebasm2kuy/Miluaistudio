import type { InvitationDesign } from '@/data/invitation-designs';
import MiniInvitation, { miniFromDesign } from '@/components/mini-invitation';

/**
 * Maqueta comercial de la tarjeta del catálogo: escena fotográfica temática
 * compuesta con el celular y la tarjeta física que representan el diseño real
 * (mismo nombre, fecha, paleta y adornos que la invitación completa).
 */
export default function CatalogScene({ design, className }: { design: InvitationDesign; className?: string }) {
  const data = miniFromDesign(design);

  return (
    <div
      role="img"
      aria-label={'Maqueta del diseño ' + design.name + ' con celular y tarjeta de invitación'}
      className={'relative isolate h-full w-full overflow-hidden ' + (className || '')}
    >
      {/* Escena fotográfica */}
      <img
        src={design.scene}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Profundidad suave */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.16) 100%)' }} />

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
          style={{ boxShadow: '0 18px 38px rgba(0,0,0,0.32), 0 4px 10px rgba(0,0,0,0.18)' }}
        >
          <MiniInvitation data={data} variant="card" />
          {/* Brillo de papel */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(255,255,255,0.10) 0%, transparent 30%)' }} />
        </div>
      </div>
    </div>
  );
}
