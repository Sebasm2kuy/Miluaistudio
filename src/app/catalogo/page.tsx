'use client';

import { useState } from 'react';
import { ArrowDown, ArrowRight, Check, Clock3, ExternalLink, Heart, Sparkles, X } from 'lucide-react';
import { INVITATION_DESIGNS, type InvitationDesign } from '@/data/invitation-designs';

const MERCADO_LIBRE_URL = 'https://www.mercadolibre.com.uy/invitacion-15-anos-bodas-y-mas/up/MLUU5535524605?pdp_filters=item_id:MLU702768047';

function CountdownPreview({ design }: { design: InvitationDesign }) {
  const values = [
    { value: '128', label: 'días' },
    { value: '08', label: 'horas' },
    { value: '42', label: 'min' },
  ];

  return (
    <div className="mt-5 flex items-center justify-center gap-2.5">
      {values.map((item) => {
        const commonText = { color: design.text, fontVariantNumeric: 'tabular-nums' as const };
        if (design.clock === 'minimal') {
          return (
            <div key={item.label} className="min-w-0 text-center">
              <div className="text-lg font-light leading-none sm:text-xl" style={commonText}>{item.value}</div>
              <div className="mt-1 text-[7px] uppercase tracking-[0.15em]" style={{ color: design.muted }}>{item.label}</div>
            </div>
          );
        }
        if (design.clock === 'circles') {
          return (
            <div key={item.label} className="flex h-12 w-12 flex-col items-center justify-center rounded-full border sm:h-14 sm:w-14" style={{ borderColor: design.accent, color: design.text }}>
              <span className="text-xs font-medium">{item.value}</span>
              <span className="text-[6px] uppercase tracking-wide" style={{ color: design.muted }}>{item.label}</span>
            </div>
          );
        }
        if (design.clock === 'outline') {
          return (
            <div key={item.label} className="min-w-0 flex-1 border-y py-2 text-center" style={{ borderColor: design.accentSoft }}>
              <div className="text-lg font-light leading-none sm:text-xl" style={commonText}>{item.value}</div>
              <div className="mt-1 text-[7px] uppercase tracking-[0.15em]" style={{ color: design.muted }}>{item.label}</div>
            </div>
          );
        }
        return (
          <div key={item.label} className={`min-w-0 flex-1 py-2 text-center ${design.clock === 'glass' ? 'rounded-xl border backdrop-blur-sm' : 'rounded-md'}`} style={{ background: design.clock === 'glass' ? `${design.accentSoft}66` : design.accentSoft, borderColor: design.clock === 'glass' ? design.accent : 'transparent' }}>
            <div className="text-lg font-light leading-none sm:text-xl" style={commonText}>{item.value}</div>
            <div className="mt-1 text-[7px] uppercase tracking-[0.15em]" style={{ color: design.muted }}>{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function Ornament({ design }: { design: InvitationDesign }) {
  if (design.ornament === 'none') return null;
  if (design.ornament === 'geometry') {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute right-3 top-3 flex gap-1 opacity-70">
        <span className="h-5 w-5 rotate-45 border" style={{ borderColor: design.accent }} />
        <span className="h-5 w-5 rounded-full border" style={{ borderColor: design.accent }} />
      </div>
    );
  }
  if (design.ornament === 'botanical') {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute right-3 top-3 flex -rotate-12 items-center gap-1 opacity-70" style={{ color: design.accent }}>
        <span className="text-2xl">❧</span>
        <span className="text-lg">✦</span>
      </div>
    );
  }
  if (design.ornament === 'stars') {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ color: design.accent, opacity: 0.8 }}>
        <span className="absolute right-4 top-3 text-lg">✦</span>
        <span className="absolute left-4 top-14 text-xs">✧</span>
        <span className="absolute bottom-14 right-5 text-xs">✧</span>
      </div>
    );
  }
  if (design.ornament === 'petals') {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ color: design.accent, opacity: 0.72 }}>
        <span className="absolute -left-4 top-5 text-5xl">❋</span>
        <span className="absolute -right-3 bottom-10 text-5xl">❋</span>
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ color: design.accent, opacity: 0.7 }}>
      <Sparkles className="absolute right-4 top-4 h-4 w-4" />
      <Sparkles className="absolute bottom-7 left-4 h-3 w-3" />
    </div>
  );
}

function InvitationMockup({ design, large = false }: { design: InvitationDesign; large?: boolean }) {
  const isLight = design.text === '#302821';
  const titleFont = design.font === 'script'
    ? "var(--font-cursive), cursive"
    : design.font === 'serif'
      ? "var(--font-serif), Georgia, serif"
      : "var(--font-sans), Arial, sans-serif";
  const titleStyle = { fontFamily: titleFont, color: design.accent };
  const pad = large ? 'p-8 sm:p-10' : 'p-4 sm:p-5';
  return (
    <div
      className={`relative isolate flex min-h-[340px] flex-col items-center justify-center overflow-hidden text-center transition-transform duration-300 ${pad} ${large ? 'min-h-[520px]' : ''} ${design.layout === 'rounded' ? 'rounded-[2rem]' : design.layout === 'arch' ? 'rounded-t-[48%] rounded-b-xl' : design.layout === 'framed' ? 'rounded-sm' : 'rounded-xl'}`}
      style={{
        background: design.background,
        color: design.text,
        border: design.layout === 'framed' ? `1px solid ${design.accent}` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: `0 20px 60px ${design.background}66`,
      }}
    >
      {design.layout === 'framed' && <div aria-hidden="true" className="pointer-events-none absolute inset-2 border" style={{ borderColor: `${design.accent}70` }} />}
      {design.layout === 'arch' && <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 top-5 h-2/3 rounded-t-full border" style={{ borderColor: `${design.accent}66` }} />}
      {design.layout === 'modern' && <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-12 h-28 w-28 rotate-45 border" style={{ borderColor: `${design.accent}70` }} />}
      {design.layout === 'botanical' && <div aria-hidden="true" className="pointer-events-none absolute -left-8 bottom-3 -rotate-45 text-8xl" style={{ color: design.accent, opacity: 0.3 }}>❧</div>}
      <Ornament design={design} />
      <div className={`relative z-10 w-full ${design.layout === 'editorial' || design.layout === 'split' || design.layout === 'modern' ? 'text-left' : 'text-center'}`}>
        <div className="mb-3 text-[8px] font-semibold uppercase tracking-[0.3em] sm:text-[9px]" style={{ color: design.muted }}>
          Una celebración especial
        </div>
        {design.layout === 'split' ? (
          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: design.muted }}>Te invitamos a celebrar</p>
              <h3 className="mt-2 text-3xl leading-none sm:text-4xl" style={titleStyle}>Tu nombre</h3>
            </div>
            <div className="pb-1 text-right text-[10px] uppercase tracking-wider" style={{ color: design.text }}>Sáb.<br/>21:00</div>
          </div>
        ) : design.layout === 'editorial' || design.layout === 'modern' ? (
          <>
            <div className="mb-1 text-[8px] uppercase tracking-[0.25em]" style={{ color: design.muted }}>La noche es tuya</div>
            <h3 className={`leading-[0.95] ${large ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl'}`} style={titleStyle}>Tu nombre</h3>
            <div className="mt-3 h-px w-16" style={{ background: design.accent }} />
          </>
        ) : (
          <>
            <h3 className={`leading-[0.95] ${large ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl'}`} style={titleStyle}>Tu nombre</h3>
            <p className="mt-2 text-[10px] uppercase tracking-[0.16em]" style={{ color: design.muted }}>Mis XV años</p>
          </>
        )}
        <div className={`mx-auto my-4 h-px ${design.layout === 'editorial' || design.layout === 'split' || design.layout === 'modern' ? 'w-10' : 'w-16'}`} style={{ background: design.accent }} />
        <div className="text-xs font-medium sm:text-sm" style={{ color: design.text }}>Sábado · 21:00 hs</div>
        <div className="mt-1 text-[9px] uppercase tracking-[0.17em]" style={{ color: design.muted }}>Montevideo · Uruguay</div>
        <CountdownPreview design={design} />
        <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ background: design.accent, color: isLight ? '#fff' : design.background }}>
          Confirmar asistencia <ArrowRight className="h-3 w-3" />
        </div>
      </div>
      {design.layout === 'minimal' && <div className="absolute bottom-3 h-px w-10" style={{ background: design.accentSoft }} />}
    </div>
  );
}

function DesignCard({ design, onPreview }: { design: InvitationDesign; onPreview: () => void }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.055]">
      <button type="button" onClick={onPreview} className="block w-full p-3 text-left sm:p-4" aria-label={`Previsualizar diseño ${design.name}`}>
        <InvitationMockup design={design} />
      </button>
      <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: design.accent }}>{design.category}</div>
            <h2 className="mt-1 text-lg font-semibold text-white">{design.name}</h2>
          </div>
          <button type="button" onClick={onPreview} className="rounded-full border border-white/15 p-2 text-white/70 transition hover:border-white/35 hover:text-white" aria-label={`Ver detalles de ${design.name}`}>
            <ArrowRight size={17} />
          </button>
        </div>
        <p className="mt-2 min-h-10 text-sm leading-relaxed text-white/60">{design.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[design.background, design.accent, design.accentSoft, design.text].map((color) => (
            <span key={color} title={color} className="h-4 w-4 rounded-full border border-white/15" style={{ background: color }} />
          ))}
          <span className="ml-1 self-center text-xs text-white/50">{design.palette}</span>
        </div>
        <button type="button" onClick={onPreview} className="mt-4 w-full rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/35 hover:bg-white/5">
          Ver diseño
        </button>
      </div>
    </article>
  );
}

export default function CatalogoPage() {
  const [selected, setSelected] = useState<InvitationDesign | null>(null);

  return (
    <div className="fixed inset-0 z-[250] overflow-y-auto bg-[#09090b] text-white" style={{ overscrollBehavior: 'contain' }}>
      <div className="pointer-events-none fixed inset-0 opacity-80" aria-hidden="true" style={{ background: 'radial-gradient(ellipse at 15% 0%, rgba(153,96,125,0.17), transparent 36%), radial-gradient(ellipse at 90% 15%, rgba(133,112,69,0.12), transparent 35%)' }} />
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <a href="#inicio" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5"><Heart size={18} /></div>
            <div>
              <div className="text-lg font-semibold tracking-tight">Miluaistudio</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Invitaciones digitales</div>
            </div>
          </a>
          <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/85 sm:inline-flex">
            Ver oferta <ExternalLink size={15} />
          </a>
          <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 p-2 text-white sm:hidden" aria-label="Ver publicación de compra"><ArrowRight size={18} /></a>
        </div>
      </header>

      <main id="inicio" className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <section className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65">
            <Sparkles size={14} style={{ color: '#d7b46a' }} /> Diseños para momentos únicos
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Una invitación que se siente <span className="font-serif italic text-[#dfbd85]">tuya.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            Explorá diferentes estilos de invitación web. Elegí la estética que más te representa y conocé una forma simple de compartir todos los detalles de tu celebración en un solo enlace.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#disenos" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#dfbd85] px-6 py-3 text-sm font-semibold text-[#17120b] transition hover:bg-[#eed5a7]">
              Explorar diseños <ArrowDown size={16} />
            </a>
            <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-white/80 transition hover:bg-white/5">
              Comprar invitación <ExternalLink size={15} />
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5"><Check size={13} /> Diseño personalizado</span>
            <span className="inline-flex items-center gap-1.5"><Check size={13} /> Experiencia interactiva</span>
            <span className="inline-flex items-center gap-1.5"><Check size={13} /> Optimizada para celular</span>
          </div>
        </section>

        <section id="disenos" className="mt-14 scroll-mt-8 sm:mt-20">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dfbd85]">Colección inicial</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Diez caminos visuales</h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-white/50">Cada modelo tiene su propia invitación web de demostración para que explores colores, composición y reloj antes de consultar la personalización.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {INVITATION_DESIGNS.map((design) => <DesignCard key={design.id} design={design} onPreview={() => setSelected(design)} />)}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#dfbd85]">Una invitación, toda la información</p>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Tu evento, en un solo enlace.</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">El producto actual incluye diseño web personalizado y funciones como cuenta regresiva, galería, música, ubicación y confirmación de asistencia, sujeto a la configuración contratada.</p>
          </div>
          <div className="mt-6 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0">
            <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/85">Ver publicación <ExternalLink size={15} /></a>
          </div>
        </section>

        <footer className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Miluaistudio · Invitaciones digitales</span>
          <span>Diseños de demostración · Personalización a consultar</span>
        </footer>
      </main>

      {selected && (
        <div className="fixed inset-0 z-[300] overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-label={`Vista previa ${selected.name}`}>
          <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
            <div className="relative grid w-full gap-4 rounded-3xl border border-white/15 bg-[#101012] p-4 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-8">
              <button onClick={() => setSelected(null)} type="button" className="absolute right-3 top-3 z-20 rounded-full border border-white/15 bg-black/50 p-2 text-white/80 hover:text-white" aria-label="Cerrar vista previa"><X size={18} /></button>
              <div className="mx-auto w-full max-w-sm pt-8 lg:pt-0">
                <InvitationMockup design={selected} large />
              </div>
              <div className="flex flex-col justify-center py-3 pr-1 sm:py-5 lg:pr-5">
                <span className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: selected.accent }}>{selected.category}</span>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{selected.name}</h2>
                <p className="mt-4 text-base leading-relaxed text-white/60">{selected.description}</p>
                <div className="mt-5 flex items-center gap-2 text-sm text-white/55"><Clock3 size={16} /> Cuenta regresiva con diseño a juego</div>
                <div className="mt-3 flex items-center gap-2 text-sm text-white/55"><Check size={16} /> Adaptable a pantallas móviles</div>
                <div className="mt-3 flex items-center gap-2 text-sm text-white/55"><Check size={16} /> Personalizable según el evento</div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a href={'/Miluaistudio/catalogo/' + selected.id + '/'} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#dfbd85] px-5 py-3 text-sm font-semibold text-[#17120b] hover:bg-[#eed5a7]">Probar invitación completa <ArrowRight size={15} /></a>
                  <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/85">Consultar / comprar <ExternalLink size={15} /></a>
                  <button type="button" onClick={() => setSelected(null)} className="rounded-full border border-white/15 px-5 py-3 text-sm text-white/80 hover:bg-white/5">Volver al catálogo</button>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-white/35">La invitación completa funciona en modo demostración: no envía confirmaciones, no usa datos personales ni publica fotos. Los datos reales se configuran al personalizar.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
