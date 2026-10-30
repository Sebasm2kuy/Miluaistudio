import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clapperboard,
  Clock3,
  Film,
  Image as ImageIcon,
  Images,
  MapPin,
  MessageSquareText,
  Music,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { INVITATION_DESIGNS } from '@/data/invitation-designs';
import CatalogScene from '@/components/catalog-scene';
import WhatsAppIcon from '@/components/whatsapp-icon';
import WhatsAppFloat from '@/components/whatsapp-float';
import Reveal from '@/components/reveal';
import { SectionHeading, OrnamentDivider, HeroBadge } from '@/components/store-ui';
import { DesignAdornoGlyph } from '@/components/design-ornaments';
import StoreNav from '@/components/store-nav';
import CarruselModelos from '@/components/carrusel-modelos';
import ServiciosExtras from '@/components/servicios-extras';
import { WHATSAPP_MENSAJE_GENERAL, whatsappLink } from '@/data/contacto';
import { TESTIMONIOS } from '@/data/testimonios';
import { MENSAJE_SERVICIOS_EXTRA } from '@/data/servicios';

const CATALOG_URL = '/catalogo/';
/* Champagne de texto: se oscurece el dorado decorativo para cumplir 3:1+
   (texto grande) sobre marfil y los gradientes cálidos. Medido: 4.0:1. */
const GOLD = '#8a6534'; /* auditado WCAG AA: ≥4.84:1 sobre superficies claras (ver store-tokens.ts) */
const INK = '#292522';
const INK_MUTED = '#716a63';
/* Texto oscuro sobre el verde de marca de WhatsApp: 6.23:1 (blanco era 1.98:1). */
const WA_TEXT = 'text-[#0b3d1e]';

const PRIMARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[#292522] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(41,37,34,0.22)] transition hover:-translate-y-0.5 hover:bg-[#3d3830]';
const WHATSAPP_BTN =
  `inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 py-3.5 text-sm font-semibold ${WA_TEXT} shadow-[0_12px_28px_rgba(37,211,102,0.28)] transition hover:-translate-y-0.5 hover:bg-[#1db957]`;
const OUTLINE_BTN =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[#ded4c8] bg-transparent px-6 py-3.5 text-sm font-medium text-[#54483e] transition hover:-translate-y-0.5 hover:border-[#c9bbaa] hover:bg-white';

/* Píldoras bajo el héroe (al estilo de la referencia del rubro): las de
   servicios apuntan a su tarjeta «próximamente» con ancla #servicio-<id>. */
const PILLS_SERVICIOS: Array<{ label: string; href: string; icon: LucideIcon; pronto?: boolean }> = [
  { label: 'Álbum digital', href: '#servicio-album-digital', icon: Images, pronto: true },
  { label: 'Videos', href: '#servicio-edicion-video', icon: Clapperboard, pronto: true },
  { label: 'Historia de vida', href: '#servicio-video-historia', icon: BookOpen, pronto: true },
  { label: 'Tráiler', href: '#servicio-trailer-evento', icon: Film, pronto: true },
  { label: 'Música de Spotify', href: '#incluye', icon: Music },
];

export default function Home() {
  /* Héroe: los dos modelos de mayor impacto de la colección. Gala Estrellada
     (negro + oro, haz de luz) es puro Lumen Gala; Pista Disco suma el
     contraste vibrante de la fiesta. Antes: rosa-romantica + noche-dorada. */
  const heroDesign = INVITATION_DESIGNS.find((d) => d.id === 'gala-estrellas') ?? INVITATION_DESIGNS[0];
  const heroSecondary = INVITATION_DESIGNS.find((d) => d.id === 'disco-pista') ?? INVITATION_DESIGNS[1];
  const featured = INVITATION_DESIGNS.slice(0, 4);

  return (
    <main data-page="storefront" className="min-h-screen bg-[#faf8f4] text-[#292522]">
      {/* Lavados de color cálidos + adornos de fondo */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 8% 0%, rgba(184,138,148,0.10), transparent 60%), radial-gradient(ellipse 55% 45% at 96% 8%, rgba(168,129,79,0.10), transparent 62%)' }} />

      {/* ===== Encabezado con menús (incluye servicios «próximamente») ===== */}
      <StoreNav />

      {/* ===== Hero editorial — el producto primero en móvil ===== */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-7 sm:px-6 sm:pt-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-16 lg:pt-20">
        {/* Visual — va primero en móvil: la invitación antes que el texto */}
        <div className="relative order-1 lg:order-2">
          <div aria-hidden="true" className="absolute -inset-5 rounded-[2.75rem] bg-gradient-to-br from-[#f6e2df]/75 via-[#f3e6d3]/60 to-[#ecdcc0]/70 blur-xl lg:hidden" />
          {/* Móvil y tablet: maqueta del diseño destacado */}
          <div className="store-hero-in relative mx-auto aspect-[4/5] w-full max-w-[400px] overflow-hidden rounded-[2rem] border border-[#eadfca] shadow-[0_30px_70px_rgba(88,63,32,0.24)] sm:max-w-[430px] lg:hidden">
            <CatalogScene design={heroDesign} />
            <div className="absolute -left-1.5 top-5">
              <HeroBadge>
                <Sparkles size={14} className="text-[#9c7443]" /> Demo interactiva · Música y RSVP
              </HeroBadge>
            </div>
          </div>
          {/* Escritorio: collage editorial con las maquetas reales (mismo fondo que la demo) */}
          <div className="store-hero-in-2 relative mx-auto hidden w-full max-w-[440px] pb-12 pr-6 sm:pb-14 sm:pr-10 lg:block">
            <div aria-hidden="true" className="absolute -inset-6 rounded-[3rem] bg-[#ecdcc0]/45 blur-2xl" />
            <div className="relative rotate-[-2deg] overflow-hidden rounded-[2rem] border border-[#eadfca] shadow-[0_30px_70px_rgba(88,63,32,0.22)]">
              <div className="aspect-[4/5] w-full">
                <CatalogScene design={heroDesign} />
              </div>
            </div>
            <div className="absolute -bottom-0 right-0 w-[46%] rotate-[4deg] overflow-hidden rounded-2xl border-4 border-[#f7f4ef] shadow-[0_22px_50px_rgba(88,63,32,0.28)] sm:-bottom-2">
              <div className="aspect-[4/5] w-full">
                <CatalogScene design={heroSecondary} />
              </div>
            </div>
            <div className="absolute -left-2 top-6 sm:-left-6">
              <HeroBadge>
                <Sparkles size={14} className="text-[#9c7443]" /> Demo interactiva · Música y RSVP
              </HeroBadge>
            </div>
          </div>
        </div>

        <div className="relative order-2 mt-9 lg:order-1 lg:mt-0">
          {/* Adornos de fondo */}
          <DesignAdornoGlyph adorno="rosas" className="absolute -left-14 top-6 hidden h-44 w-44 text-[#b98a94]/25 lg:block" />
          <DesignAdornoGlyph adorno="eucalipto" className="absolute -right-12 bottom-0 hidden h-40 w-40 -scale-x-100 text-[#9c7443]/20 lg:block" />

          <div className="store-hero-in inline-flex items-center gap-2 rounded-full border border-[#bfe8cd] bg-[#eafaf0] px-3.5 py-1.5 text-xs font-medium text-[#0b3d1e] shadow-sm">
            <WhatsAppIcon size={14} />
            Se comparte por WhatsApp, sin instalar nada
          </div>
          <h1 className="store-hero-in-2 mt-6 max-w-xl font-serif text-[2.6rem] font-medium leading-[1.06] tracking-tight sm:text-6xl">
            Invitaciones web de <em className="italic" style={{ color: GOLD }}>alta gama</em> para 15s y bodas, en un solo enlace.
          </h1>
          <p className="store-hero-in-2 mt-6 max-w-lg text-base leading-relaxed text-[#716a63] sm:text-lg">
            Creamos invitaciones web digitales personalizadas para fiestas de 15, bodas y eventos únicos en Uruguay. Cuenta regresiva, galería, música, ubicación y confirmación de asistencia (RSVP), con el estilo de tu evento. Basados en Montevideo.
          </p>
          <div className="store-hero-in-3 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="/personalizar/" className={PRIMARY_BTN}>
              Personalizar mi invitación <ArrowRight size={16} />
            </a>
            <a href={CATALOG_URL} className={OUTLINE_BTN}>
              Explorar los {INVITATION_DESIGNS.length} diseños
            </a>
            <a href={whatsappLink(WHATSAPP_MENSAJE_GENERAL)} target="_blank" rel="noreferrer" className={WHATSAPP_BTN}>
              <WhatsAppIcon size={16} /> Consultar por WhatsApp
            </a>
          </div>
          <div className="store-hero-in-3 mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#716a63]">
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9c7443]" /> Personalizada</span>
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9c7443]" /> Lista para compartir</span>
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#9c7443]" /> Adaptada al celular</span>
          </div>
        </div>
      </section>

      {/* ===== Píldoras de servicios (acceso rápido, estilo referencia) ===== */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-1 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {PILLS_SERVICIOS.map((p) => (
            <a
              key={p.href}
              href={p.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e0d7] bg-white px-3.5 py-2 text-xs font-medium text-[#5d564e] shadow-sm transition hover:border-[#dfc9a4] hover:text-[#292522]"
            >
              <p.icon size={13} className="text-[#8a6534]" />
              {p.label}
              {p.pronto && (
                <span className="rounded-full bg-[#f3ead9] px-1.5 py-px text-[8px] font-bold uppercase tracking-wider text-[#8a6534]">pronto</span>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* ===== Carrusel de diseños «como se ve desde un celular» ===== */}
      <section id="coleccion" aria-label="Carrusel de diseños de invitación" className="relative z-10 mt-10 scroll-mt-20 sm:mt-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <OrnamentDivider className="mb-7" />
            <SectionHeading
              eyebrow="La colección completa"
              title={<>Pasá los diseños <em className="italic" style={{ color: GOLD }}>como en tu celu</em>.</>}
              sub="Deslizá el carrusel o tocá los bordes para recorrer los modelos, y abrí la demostración del que más te guste."
            />
          </Reveal>
          <Reveal delay={80}>
            <CarruselModelos designs={INVITATION_DESIGNS} />
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8 flex justify-center">
              <a href={CATALOG_URL} className={OUTLINE_BTN}>
                Explorar el catálogo completo <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Qué incluyen ===== */}
      <section id="incluye" className="relative z-10 mt-16 scroll-mt-20 sm:mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Mucho más que una tarjeta"
              title={<>Música, RSVP y cuenta regresiva, <em className="italic" style={{ color: GOLD }}>en un solo enlace</em>.</>}
              sub="Cada invitación reúne las funciones esenciales del evento —cuenta regresiva, galería de fotos, música, ubicación y calendario— configuradas según lo acordado al contratar."
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-8 divide-y divide-[#f0e9df] overflow-hidden rounded-2xl border border-[#e8e0d7] bg-white shadow-[0_4px_16px_rgba(88,63,32,0.05)] sm:mt-10 sm:grid sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
              {[
                { icon: Clock3, title: 'Cuenta regresiva', description: 'Un reloj elegante que acompaña la espera hasta el día de la celebración.' },
                { icon: ImageIcon, title: 'Galería de fotos', description: 'Compartí imágenes y momentos especiales dentro de la invitación.' },
                { icon: Music, title: 'Música integrada', description: 'Sumá una banda sonora mediante la integración con Spotify.' },
                { icon: MapPin, title: 'Ubicación del evento', description: 'Incluí la dirección y el acceso al mapa para tus invitados.' },
                { icon: Calendar, title: 'Fecha y cronograma', description: 'Presentá los horarios y permití agregar la fecha al calendario.' },
                { icon: ShieldCheck, title: 'Confirmación de asistencia', description: 'RSVP para organizar las respuestas de los invitados, según la configuración contratada.' },
              ].map((feature) => (
                <div key={feature.title} className="flex items-start gap-4 p-4 sm:block sm:p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3ead9] sm:h-11 sm:w-11" style={{ color: GOLD }}>
                    <feature.icon size={20} strokeWidth={1.7} />
                  </div>
                  <div className="min-w-0 flex-1 sm:mt-4">
                    <h3 className="font-serif text-base font-semibold text-[#292522] sm:text-lg">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#716a63] sm:mt-2">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Diseños destacados ===== */}
      <section id="disenos" className="relative z-10 mt-16 scroll-mt-20 sm:mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <SectionHeading
                align="left"
                eyebrow="La colección"
                title={<>Encontrá el estilo que <em className="italic" style={{ color: GOLD }}>te representa</em>.</>}
              />
              <a href={CATALOG_URL} className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#8a6a44] transition hover:text-[#7a5e3d]">
                Ver diseños <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((design, index) => (
              <Reveal key={design.id} delay={index * 70}>
                <article className="group h-full overflow-hidden rounded-2xl border border-[#e8e0d7] bg-white shadow-[0_4px_16px_rgba(88,63,32,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(88,63,32,0.14)]">
                  <a href={'/catalogo/' + design.id + '/'} target="_blank" rel="noreferrer" className="block aspect-[4/5] overflow-hidden" aria-label={'Probar ' + design.name + ' en una pestaña nueva'}>
                    <div className="h-full w-full transition duration-500 group-hover:scale-[1.03]">
                      <CatalogScene design={design} />
                    </div>
                  </a>
                  <div className="px-4 pb-4 pt-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: design.storeAccent ?? design.accentSoft }}>{design.category}</p>
                    <h3 className="mt-1 font-serif text-lg font-semibold">{design.name}</h3>
                    <a href={'/catalogo/' + design.id + '/'} target="_blank" rel="noreferrer" className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a6a44] transition hover:text-[#7a5e3d]">
                      Ver demostración <ArrowRight size={13} />
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-9 flex justify-center">
              <a href={CATALOG_URL} className={OUTLINE_BTN}>
                Explorar el catálogo completo <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Cómo funciona ===== */}
      <section id="proceso" className="relative z-10 mt-16 scroll-mt-20 sm:mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Simple desde el comienzo"
              title={<>Así preparamos <em className="italic" style={{ color: GOLD }}>tu invitación</em>.</>}
            />
          </Reveal>
          <div className="relative mt-10 grid gap-4 md:grid-cols-3">
            <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-14 hidden border-t border-dashed border-[#d9c9ad] md:block" />
            {[
              { number: '1', icon: Search, title: 'Elegís el diseño y lo personalizás', text: 'Abrís el personalizador, cargás tu nombre, fecha y lugar, y ves tu invitación al instante.' },
              { number: '2', icon: MessageSquareText, title: 'Nos pasás los detalles finales', text: 'Fotos, música y ajustes finos: lo que falte lo resolvemos juntos por WhatsApp.' },
              { number: '3', icon: Share2, title: 'Recibís tu enlace listo para compartir', text: 'Te entregamos la invitación web para reenviarla por WhatsApp a tus invitados.' },
            ].map((step, index) => (
              <Reveal key={step.number} delay={index * 90}>
                <article className="relative h-full rounded-2xl border border-[#e8e0d7] bg-white p-6 text-center shadow-[0_4px_16px_rgba(88,63,32,0.05)] sm:p-7">
                  <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#dfc9a4] bg-[#f3ead9]" style={{ color: GOLD }}>
                    <step.icon size={22} strokeWidth={1.7} />
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#26221d] font-serif text-xs italic text-[#ecdcc0]">{step.number}</span>
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold leading-snug">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#716a63]">{step.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Servicios extra (próximamente) ===== */}
      <section id="servicios" className="relative z-10 mt-16 scroll-mt-20 sm:mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Estamos preparando esto para vos"
              title={<>Más que invitaciones: <em className="italic" style={{ color: GOLD }}>recuerdos completos</em>.</>}
            />
          </Reveal>
          <Reveal delay={60}>
            <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-[#716a63]">
              Tocá cada servicio —o el menú de arriba— para desplegar de qué se trata.
              Consultanos y te avisamos apenas estén listos.
            </p>
          </Reveal>
          <ServiciosExtras />
          <Reveal delay={120}>
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <a href={whatsappLink(MENSAJE_SERVICIOS_EXTRA)} target="_blank" rel="noreferrer" className={WHATSAPP_BTN}>
                <WhatsAppIcon size={16} /> Consultar por los extras
              </a>
              <p className="text-xs text-[#787168]">
                Nada de esto se cobra todavía: es lo que estamos construyendo para los próximos eventos.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Reseñas ===== */}
      <section id="resenas" className="relative z-10 mt-16 scroll-mt-20 sm:mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Lo que buscamos para cada evento"
              title={<>Así se ve <em className="italic" style={{ color: GOLD }}>una buena experiencia</em>.</>}
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIOS.map((t, index) => (
              <Reveal key={t.nombre} delay={index * 50}>
                <figure className="flex h-full flex-col rounded-2xl border border-[#e8e0d7] bg-white p-5 shadow-[0_4px_16px_rgba(88,63,32,0.05)] sm:p-6">
                  <div className="flex items-center gap-0.5 text-[#b8860b]" aria-label="Calificación: 5 de 5 estrellas">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-[#5d564e]">“{t.comentario}”</blockquote>
                  <figcaption className="mt-4 border-t border-[#f0e9df] pt-3">
                    <span className="block text-sm font-semibold text-[#292522]">{t.nombre}</span>
                    <span className="block text-xs text-[#787168]">{t.evento}</span>
                    {t.estado !== 'verificado' && (
                      <span className="mt-1 inline-block rounded-full border border-[#e8e0d7] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#787168]">
                        Ejemplo de referencia
                      </span>
                    )}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-[#e6d5bd] p-7 sm:p-11 lg:p-14" style={{ background: 'linear-gradient(120deg, #fdf3ec 0%, #f8ecdd 48%, #f3e6d3 100%)' }}>
            <DesignAdornoGlyph adorno="rosas" className="absolute -left-8 -top-8 h-40 w-40 text-[#b98a94]/20" />
            <DesignAdornoGlyph adorno="eucalipto" className="absolute -bottom-10 -right-8 h-44 w-44 -scale-x-100 text-[#9c7443]/20" />
            <div className="relative mx-auto max-w-2xl text-center">
              <p className="font-serif text-xl italic sm:text-2xl" style={{ color: GOLD }}>Tu celebración empieza acá</p>
              <h2 className="mt-3 font-serif text-3xl leading-[1.15] tracking-tight sm:text-4xl">
                Elegí un diseño y <em className="italic" style={{ color: GOLD }}>hacelo tuyo</em>.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#716a63] sm:text-base">
                Explorá la colección, probá las demostraciones y consultá las condiciones de personalización antes de comprar.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                <a href={CATALOG_URL} className={PRIMARY_BTN}>
                  Elegir diseño <ArrowRight size={16} />
                </a>
                <a href={whatsappLink(WHATSAPP_MENSAJE_GENERAL)} target="_blank" rel="noreferrer" className={WHATSAPP_BTN}>
                  <WhatsAppIcon size={16} /> Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== Preguntas frecuentes ===== */}
      <section id="faq" className="relative z-10 scroll-mt-20 border-t border-[#e8e0d7] bg-white/60">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="Preguntas frecuentes"
              title={<>Antes de elegir <em className="italic" style={{ color: GOLD }}>tu invitación</em>.</>}
            />
          </Reveal>
          <p className="mt-4 text-center text-xs text-[#787168]">
            Comentarios de muestra para ilustrar el servicio. Las reseñas de clientes reales se publicarán una vez autorizadas.
          </p>
          <div className="mt-9 space-y-3">
            {[
              { q: '¿Es una imagen o una página web?', a: 'Es una invitación web personalizada que se abre desde un enlace y puede reunir la información y las funciones acordadas para tu celebración.' },
              { q: '¿Puedo probar la invitación con mis datos antes de comprar?', a: 'Sí. En la sección Personalizar elegís el diseño, cargás nombre, fecha, lugar y música, y la invitación se actualiza al instante con tu información. Después nos enviás esa configuración por WhatsApp y la dejamos lista.' },
              { q: '¿Mis invitados necesitan instalar una aplicación?', a: 'No. La invitación se abre desde un navegador compatible en el celular o la computadora.' },
              { q: '¿Puedo elegir los colores y el estilo?', a: 'Sí. El diseño se personaliza según tus preferencias y las opciones disponibles para el modelo elegido.' },
              { q: '¿Cómo se confirma la asistencia?', a: 'La invitación puede incluir RSVP. El método de registro y las funciones asociadas se confirman al definir la configuración del evento.' },
              { q: '¿También hacen álbum de fotos o videos del evento?', a: 'Estamos desarrollando los servicios extra: álbum digital para que tus invitados suban sus fotos y videos, edición de video, video de tu historia y tráiler del evento. Consultanos por WhatsApp y te avisamos apenas estén disponibles.' },
              { q: '¿Cuánto cuesta?', a: 'Depende del diseño y de las funciones que quieras incluir. Escribinos por WhatsApp con tu idea y te pasamos el presupuesto en el día, sin compromiso.' },
            ].map((item, index) => (
              <Reveal key={item.q} delay={index * 40}>
                <details className="group rounded-2xl border border-[#e8e0d7] bg-white px-5 py-4 shadow-[0_3px_12px_rgba(88,63,32,0.04)]">
                  <summary className="cursor-pointer list-none font-serif text-base font-semibold text-[#292522] marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {item.q}
                      <span className="text-xl font-light transition group-open:rotate-45" style={{ color: GOLD }}>+</span>
                    </span>
                  </summary>
                  <p className="pt-3 text-sm leading-relaxed text-[#716a63]">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pie ===== */}
      <footer className="relative z-10 bg-[#292522] text-[#d8d0c5]">
        <div className="mx-auto max-w-7xl px-4 pb-28 pt-10 sm:px-6 sm:pb-10 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-serif text-lg tracking-[0.08em] text-[#f0e8da]">Lumen Gala Studio</h2>
              <p className="mt-2 text-[#a1988a]">Invitaciones web de alta gama para 15s y bodas · Montevideo, Uruguay</p>
              <a
                href="mailto:lumengala.studio@gmail.com"
                className="mt-1.5 inline-block text-[#a1988a] underline decoration-[#4a4239] underline-offset-4 transition hover:text-white"
              >
                lumengala.studio@gmail.com
              </a>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href={whatsappLink(WHATSAPP_MENSAJE_GENERAL)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-white"><WhatsAppIcon size={13} /> WhatsApp</a>
              <a href={CATALOG_URL} className="transition hover:text-white">Catálogo</a>
              <a href="#servicios" className="transition hover:text-white">Próximamente</a>
              <a href="/catalogo/rosa-romantica/" target="_blank" rel="noreferrer" className="transition hover:text-white">Ver demostración</a>
              {/* Editor móvil visual: edición directa tocando la invitación
                  (público por diseño; los datos reales exigen el token del
                  propietario — ver IDEAS iteración 017). */}
              <a href="/editar/" className="transition hover:text-white">Editor de invitaciones</a>
            </div>
          </div>
          <p className="mt-8 text-[#a1988a]">© {new Date().getFullYear()} Lumen Gala Studio</p>
        </div>
      </footer>

      <WhatsAppFloat />
    </main>
  );
}
