'use client';

import {
  ArrowRight,
  Calendar,
  Check,
  Clock3,
  Heart,
  Image as ImageIcon,
  MapPin,
  Music,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { INVITATION_DESIGNS, type InvitationDesign } from '@/data/invitation-designs';

const MERCADO_LIBRE_URL =
  'https://www.mercadolibre.com.uy/invitacion-15-anos-bodas-y-mas/up/MLUU5535524605?pdp_filters=item_id:MLU702768047';
const CATALOG_URL = '/Miluaistudio/catalogo/';
const FEATURED_DESIGNS = INVITATION_DESIGNS.slice(0, 4);

const shapeClasses: Record<InvitationDesign['layout'], string> = {
  classic: 'rounded-2xl',
  editorial: 'rounded-md',
  split: 'rounded-2xl',
  framed: 'rounded-md',
  botanical: 'rounded-[2rem]',
  modern: 'rounded-xl',
  rounded: 'rounded-[2rem]',
  cinematic: 'rounded-xl',
  arch: 'rounded-t-[45%] rounded-b-2xl',
  minimal: 'rounded-xl',
};

function CountdownSample({ design }: { design: InvitationDesign }) {
  const values = [
    { value: '128', label: 'días' },
    { value: '08', label: 'horas' },
    { value: '42', label: 'min' },
  ];

  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      {values.map((item) => (
        <div
          key={item.label}
          className={`px-1 py-2 text-center ${design.clock === 'circles' ? 'rounded-full border' : design.clock === 'minimal' ? '' : design.clock === 'glass' ? 'rounded-xl border backdrop-blur' : 'rounded-md'}`}
          style={{
            color: design.text,
            background: design.clock === 'glass' ? `${design.accentSoft}70` : design.clock === 'cards' ? design.accentSoft : 'transparent',
            borderColor: design.accent,
          }}
        >
          <div className="text-lg font-light tabular-nums sm:text-xl">{item.value}</div>
          <div className="mt-1 text-[7px] uppercase tracking-[0.15em]" style={{ color: design.muted }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function DesignPreview({ design, large = false }: { design: InvitationDesign; large?: boolean }) {
  const titleFont =
    design.font === 'script'
      ? "var(--font-cursive), cursive"
      : design.font === 'serif'
        ? "var(--font-serif), Georgia, serif"
        : "var(--font-sans), Arial, sans-serif";

  return (
    <div
      className={`relative isolate flex flex-col items-center justify-center overflow-hidden border text-center ${shapeClasses[design.layout]} ${large ? 'min-h-[420px] p-8 sm:min-h-[500px] sm:p-10' : 'min-h-[320px] p-5 sm:min-h-[350px] sm:p-6'}`}
      style={{
        background: design.background,
        color: design.text,
        borderColor: `${design.accent}70`,
        boxShadow: `0 20px 55px ${design.background}65`,
      }}
    >
      {design.layout === 'framed' && <div aria-hidden="true" className="pointer-events-none absolute inset-2 border" style={{ borderColor: `${design.accent}70` }} />}
      {design.layout === 'arch' && <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 top-5 h-2/3 rounded-t-full border" style={{ borderColor: `${design.accent}70` }} />}
      {design.layout === 'modern' && <div aria-hidden="true" className="pointer-events-none absolute -right-8 top-8 h-28 w-28 rotate-45 border opacity-70" style={{ borderColor: design.accent }} />}
      {design.ornament !== 'none' && (
        <div aria-hidden="true" className="pointer-events-none absolute right-4 top-4 text-2xl opacity-70" style={{ color: design.accent }}>
          {design.ornament === 'botanical' ? '❧' : design.ornament === 'petals' ? '❋' : design.ornament === 'geometry' ? '◇' : design.ornament === 'stars' ? '✦' : '✧'}
        </div>
      )}
      <div className="relative z-10 w-full">
        <p className="text-[8px] font-medium uppercase tracking-[0.28em] sm:text-[9px]" style={{ color: design.muted }}>Una celebración especial</p>
        <h3 className={`mt-4 leading-none ${large ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl'}`} style={{ color: design.accent, fontFamily: titleFont }}>
          Tu nombre
        </h3>
        <p className="mt-3 text-[10px] uppercase tracking-[0.2em]" style={{ color: design.muted }}>Mis XV años</p>
        <div className="mx-auto my-5 h-px w-14" style={{ background: design.accent }} />
        <p className="text-xs sm:text-sm">Sábado · 21:00 hs</p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.16em]" style={{ color: design.muted }}>Montevideo · Uruguay</p>
        <CountdownSample design={design} />
        <div className="mx-auto mt-5 inline-flex rounded-full px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.15em]" style={{ background: design.accent, color: design.background }}>
          Confirmar asistencia
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Calendar;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfbd85]/25 bg-[#dfbd85]/10 text-[#dfbd85]">
        <Icon size={20} strokeWidth={1.7} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/55">{description}</p>
    </article>
  );
}

export default function Home() {
  const heroDesign = INVITATION_DESIGNS[1];

  return (
    <main className="min-h-screen overflow-hidden bg-[#09090b] text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 opacity-90" style={{ background: 'radial-gradient(ellipse at 12% 2%, rgba(153,96,125,0.18), transparent 34%), radial-gradient(ellipse at 88% 12%, rgba(215,180,106,0.12), transparent 32%)' }} />

      <header className="relative z-20 border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="/Miluaistudio/" className="flex items-center gap-3" aria-label="Miluaistudio, inicio">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfbd85]/30 bg-[#dfbd85]/10 text-[#dfbd85]">
              <Heart size={19} />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">Miluaistudio</span>
              <span className="block text-[9px] uppercase tracking-[0.22em] text-white/45">Invitaciones digitales</span>
            </span>
          </a>
          <nav aria-label="Navegación principal" className="hidden items-center gap-6 md:flex">
            <a href="#incluye" className="text-sm text-white/65 transition hover:text-white">Qué incluyen</a>
            <a href="#disenos" className="text-sm text-white/65 transition hover:text-white">Diseños</a>
            <a href="#proceso" className="text-sm text-white/65 transition hover:text-white">Cómo funciona</a>
          </nav>
          <a href={CATALOG_URL} className="inline-flex items-center gap-2 rounded-full bg-[#dfbd85] px-4 py-2.5 text-sm font-semibold text-[#17120b] transition hover:bg-[#eed5a7] sm:px-5">
            Ver diseños <ArrowRight size={15} />
          </a>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70">
            <Sparkles size={14} className="text-[#dfbd85]" />
            Diseñadas para celebrar a tu manera
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Una invitación digital que se siente <span className="font-serif italic text-[#dfbd85]">tuya.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            Invitaciones web personalizadas para fiestas de 15, bodas y celebraciones. Un solo enlace para compartir los detalles, el estilo y la emoción de tu gran día.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={CATALOG_URL} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#dfbd85] px-6 py-3.5 text-sm font-semibold text-[#17120b] transition hover:bg-[#eed5a7]">
              Explorar los 10 diseños <ArrowRight size={16} />
            </a>
            <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-white/85 transition hover:border-white/30 hover:bg-white/5">
              Comprar por Mercado Libre
            </a>
          </div>
          <p className="mt-4 text-xs text-white/40">Precio publicado: $ 1.200 UYU · Personalización a medida</p>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/55">
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#dfbd85]" /> Personalizada</span>
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#dfbd85]" /> Lista para compartir</span>
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#dfbd85]" /> Adaptada al celular</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[430px]">
          <div aria-hidden="true" className="absolute -inset-5 rounded-[2.5rem] bg-[#dfbd85]/[0.07] blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.035] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between px-2 pt-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/45">Vista de ejemplo</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-[#dfbd85]"><span className="h-1.5 w-1.5 rounded-full bg-[#dfbd85]" /> Interactiva</span>
            </div>
            <DesignPreview design={heroDesign} large />
            <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-4">
              <div>
                <p className="text-sm font-semibold">{heroDesign.name}</p>
                <p className="mt-0.5 text-xs text-white/45">{heroDesign.palette}</p>
              </div>
              <a href={'/Miluaistudio/catalogo/' + heroDesign.id + '/'} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dfbd85] hover:text-[#eed5a7]">
                Probar diseño <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="incluye" className="relative z-10 border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dfbd85]">Mucho más que una tarjeta</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Todo lo importante, en un solo enlace.</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55 sm:text-base">El contenido se configura según el evento y el alcance confirmado al contratar.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={Clock3} title="Cuenta regresiva" description="Un reloj que acompaña la espera hasta el día de la celebración." />
            <Feature icon={ImageIcon} title="Galería de fotos" description="Compartí imágenes y momentos especiales dentro de la invitación." />
            <Feature icon={Music} title="Música integrada" description="Sumá una banda sonora mediante la integración con Spotify." />
            <Feature icon={MapPin} title="Ubicación del evento" description="Incluí la dirección y el acceso al mapa para tus invitados." />
            <Feature icon={Calendar} title="Fecha y cronograma" description="Presentá los horarios y permití agregar la fecha al calendario." />
            <Feature icon={ShieldCheck} title="Confirmación de asistencia" description="Añadí RSVP para organizar las respuestas de los invitados, según la configuración contratada." />
          </div>
        </div>
      </section>

      <section id="disenos" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dfbd85]">Colección inicial</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Encontrá el estilo que te representa.</h2>
          </div>
          <a href={CATALOG_URL} className="inline-flex items-center gap-2 text-sm font-semibold text-[#dfbd85] transition hover:text-[#eed5a7]">
            Ver los diez diseños <ArrowRight size={16} />
          </a>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_DESIGNS.map((design) => (
            <article key={design.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition hover:-translate-y-1 hover:border-white/20 sm:p-4">
              <a href={'/Miluaistudio/catalogo/' + design.id + '/'} className="block" aria-label={'Probar ' + design.name}>
                <DesignPreview design={design} />
              </a>
              <div className="px-1 pb-1 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: design.accent }}>{design.category}</p>
                <h3 className="mt-1 text-base font-semibold">{design.name}</h3>
                <p className="mt-2 min-h-[3.5rem] text-xs leading-relaxed text-white/50">{design.description}</p>
                <a href={'/Miluaistudio/catalogo/' + design.id + '/'} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white">
                  Ver demostración <ArrowRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <a href={CATALOG_URL} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5">
            Explorar el catálogo completo <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section id="proceso" className="relative z-10 border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dfbd85]">Simple desde el comienzo</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Así preparamos tu invitación.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { number: '01', title: 'Nos contás tu idea', text: 'Compartís los datos del evento, tus fotos y el estilo que imaginás.' },
              { number: '02', title: 'Personalizamos el diseño', text: 'Configuramos la invitación y las funciones acordadas para tu celebración.' },
              { number: '03', title: 'Recibís tu enlace', text: 'Te entregamos la invitación web lista para compartir con tus invitados.' },
            ].map((step) => (
              <article key={step.number} className="rounded-2xl border border-white/10 bg-[#09090b]/70 p-6 sm:p-7">
                <span className="text-xs font-semibold tracking-[0.2em] text-[#dfbd85]">{step.number}</span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-[#dfbd85]/20 p-7 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:p-12" style={{ background: 'radial-gradient(ellipse at 90% 0%, rgba(223,189,133,0.15), transparent 45%), linear-gradient(135deg, #171216, #0b0b0d)' }}>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#dfbd85]">Tu celebración empieza acá</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Elegí un diseño y hacelo tuyo.</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55 sm:text-base">Explorá la colección, probá las demostraciones y consultá las condiciones de personalización antes de comprar.</p>
          </div>
          <div className="mt-7 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0">
            <a href={CATALOG_URL} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#dfbd85] px-6 py-3.5 text-sm font-semibold text-[#17120b] transition hover:bg-[#eed5a7]">
              Elegir diseño <ArrowRight size={16} />
            </a>
            <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-white/85 transition hover:border-white/30 hover:bg-white/5">
              Ver publicación
            </a>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dfbd85]">Preguntas frecuentes</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Antes de elegir tu invitación.</h2>
          </div>
          <div className="mt-8 space-y-3">
            {[
              { q: '¿Es una imagen o una página web?', a: 'Es una invitación web personalizada que se abre desde un enlace y puede reunir la información y las funciones acordadas para tu celebración.' },
              { q: '¿Mis invitados necesitan instalar una aplicación?', a: 'No. La invitación se abre desde un navegador compatible en el celular o la computadora.' },
              { q: '¿Puedo elegir los colores y el estilo?', a: 'Sí. El diseño se personaliza según tus preferencias y las opciones disponibles para el modelo elegido.' },
              { q: '¿Cómo se confirma la asistencia?', a: 'La invitación puede incluir RSVP. El método de registro y las funciones asociadas se confirman al definir la configuración del evento.' },
              { q: '¿Cuánto cuesta?', a: 'La publicación enlazada muestra actualmente un precio de $ 1.200 UYU. Revisá la publicación para confirmar el precio y las condiciones vigentes antes de comprar.' },
            ].map((item) => (
              <details key={item.q} className="group rounded-xl border border-white/10 bg-white/[0.025] px-5 py-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-white/90 marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-lg font-light text-[#dfbd85] transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="pt-3 text-sm leading-relaxed text-white/55">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-white/75">Miluaistudio</p>
            <p className="mt-1">Invitaciones digitales personalizadas · Uruguay</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href={CATALOG_URL} className="transition hover:text-white">Catálogo</a>
            <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="transition hover:text-white">Comprar</a>
            <a href="/Miluaistudio/catalogo/rosa-romantica/" className="transition hover:text-white">Ver demostración</a>
          </div>
          <p>© {new Date().getFullYear()} Miluaistudio</p>
        </div>
      </footer>
    </main>
  );
}
