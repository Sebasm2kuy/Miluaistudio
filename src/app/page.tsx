import {
  ArrowRight,
  Calendar,
  Check,
  Clock3,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  MapPin,
  MessageSquareText,
  Music,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { INVITATION_DESIGNS } from '@/data/invitation-designs';
import CatalogScene from '@/components/catalog-scene';
import WhatsAppIcon from '@/components/whatsapp-icon';
import WhatsAppFloat from '@/components/whatsapp-float';
import Reveal from '@/components/reveal';
import { SectionHeading, OrnamentDivider, HeroBadge } from '@/components/store-ui';
import { DesignAdornoGlyph } from '@/components/design-ornaments';
import { MERCADO_LIBRE_URL, WHATSAPP_MENSAJE_GENERAL, whatsappLink } from '@/data/contacto';
import { TESTIMONIOS } from '@/data/testimonios';

const CATALOG_URL = '/Miluaistudio/catalogo/';
const GOLD = '#a8814f';
const INK = '#29241f';
const INK_MUTED = '#6f675e';

const PRIMARY_BTN =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[#26221d] px-6 py-3.5 text-sm font-semibold text-[#fdfbf7] shadow-[0_12px_28px_rgba(38,34,29,0.22)] transition hover:-translate-y-0.5 hover:bg-[#3a332b]';
const WHATSAPP_BTN =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(37,211,102,0.28)] transition hover:-translate-y-0.5 hover:bg-[#1db957]';
const OUTLINE_BTN =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[#d9cec2] bg-transparent px-6 py-3.5 text-sm font-medium text-[#54483e] transition hover:-translate-y-0.5 hover:border-[#c4b6a3] hover:bg-white';

export default function Home() {
  const heroDesign = INVITATION_DESIGNS[0];
  const heroSecondary = INVITATION_DESIGNS[1];
  const featured = INVITATION_DESIGNS.slice(0, 4);

  return (
    <main data-page="storefront" className="min-h-screen bg-[#f7f4ef] text-[#29241f]">
      {/* Lavados de color cálidos + adornos de fondo */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 8% 0%, rgba(184,138,148,0.10), transparent 60%), radial-gradient(ellipse 55% 45% at 96% 8%, rgba(168,129,79,0.10), transparent 62%)' }} />

      {/* ===== Encabezado ===== */}
      <header className="relative z-30 border-b border-[#e8e1d8] bg-[#f7f4ef]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-nowrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
          <a href="/Miluaistudio/" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Miluaistudio, inicio">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dfc9a4] bg-white text-[#a8814f] shadow-sm sm:h-10 sm:w-10">
              <Heart size={17} />
            </span>
            <span className="min-w-0">
              <span className="block font-serif text-base leading-tight tracking-[0.06em] sm:text-xl">MILUAISTUDIO</span>
              <span className="hidden text-[9px] uppercase tracking-[0.24em] text-[#9a8f81] sm:block">Invitaciones digitales</span>
            </span>
          </a>
          <nav aria-label="Navegación principal" className="hidden items-center gap-6 md:flex">
            <a href="#incluye" className="text-sm text-[#6f675e] transition hover:text-[#29241f]">Qué incluyen</a>
            <a href="#disenos" className="text-sm text-[#6f675e] transition hover:text-[#29241f]">Diseños</a>
            <a href="#proceso" className="text-sm text-[#6f675e] transition hover:text-[#29241f]">Cómo funciona</a>
            <a href="#resenas" className="text-sm text-[#6f675e] transition hover:text-[#29241f]">Reseñas</a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <a href={whatsappLink(WHATSAPP_MENSAJE_GENERAL)} target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_6px_16px_rgba(37,211,102,0.3)] transition hover:bg-[#1db957]">
              <WhatsAppIcon size={17} />
            </a>
            <a href={CATALOG_URL} className="inline-flex items-center gap-1.5 rounded-full bg-[#26221d] px-3.5 py-2.5 text-xs font-semibold text-[#fdfbf7] transition hover:bg-[#3a332b] sm:gap-2 sm:px-5 sm:text-sm">
              Ver diseños <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </header>

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
                <Sparkles size={14} className="text-[#a8814f]" /> Demo interactiva · Música y RSVP
              </HeroBadge>
            </div>
          </div>
          {/* Escritorio: collage editorial */}
          <div className="store-hero-in-2 relative mx-auto hidden w-full max-w-[440px] pb-12 pr-6 sm:pb-14 sm:pr-10 lg:block">
            <div aria-hidden="true" className="absolute -inset-6 rounded-[3rem] bg-[#ecdcc0]/45 blur-2xl" />
            <div className="relative rotate-[-2deg] overflow-hidden rounded-[2rem] border border-[#eadfca] shadow-[0_30px_70px_rgba(88,63,32,0.22)]">
              <img
                src={heroDesign.scene}
                alt={'Escena del diseño ' + heroDesign.name}
                className="aspect-[4/5] w-full object-cover"
                draggable={false}
              />
            </div>
            <div className="absolute -bottom-0 right-0 w-[46%] rotate-[4deg] overflow-hidden rounded-2xl border-4 border-[#f7f4ef] shadow-[0_22px_50px_rgba(88,63,32,0.28)] sm:-bottom-2">
              <img
                src={heroSecondary.scene}
                alt={'Escena del diseño ' + heroSecondary.name}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
                draggable={false}
              />
            </div>
            <div className="absolute -left-2 top-6 sm:-left-6">
              <HeroBadge>
                <Sparkles size={14} className="text-[#a8814f]" /> Demo interactiva · Música y RSVP
              </HeroBadge>
            </div>
          </div>
        </div>

        <div className="relative order-2 mt-9 lg:order-1 lg:mt-0">
          {/* Adornos de fondo */}
          <DesignAdornoGlyph adorno="rosas" className="absolute -left-14 top-6 hidden h-44 w-44 text-[#b98a94]/25 lg:block" />
          <DesignAdornoGlyph adorno="eucalipto" className="absolute -right-12 bottom-0 hidden h-40 w-40 -scale-x-100 text-[#a8814f]/20 lg:block" />

          <div className="store-hero-in inline-flex items-center gap-2 rounded-full border border-[#eadfca] bg-white px-3.5 py-1.5 text-xs text-[#7a6f61] shadow-sm">
            <Sparkles size={14} className="text-[#a8814f]" />
            Diseñadas para celebrar a tu manera
          </div>
          <h1 className="store-hero-in-2 mt-6 max-w-xl font-serif text-[2.6rem] font-medium leading-[1.06] tracking-tight sm:text-6xl">
            Una invitación que se siente <em className="italic" style={{ color: GOLD }}>tuya</em>, en un solo enlace.
          </h1>
          <p className="store-hero-in-2 mt-6 max-w-lg text-base leading-relaxed text-[#6f675e] sm:text-lg">
            Invitaciones web personalizadas para fiestas de 15, bodas y celebraciones. Cuenta regresiva, galería, música y confirmación de asistencia, con el estilo de tu evento.
          </p>
          <div className="store-hero-in-3 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={CATALOG_URL} className={PRIMARY_BTN}>
              Explorar los 10 diseños <ArrowRight size={16} />
            </a>
            <a href={whatsappLink(WHATSAPP_MENSAJE_GENERAL)} target="_blank" rel="noreferrer" className={WHATSAPP_BTN}>
              <WhatsAppIcon size={16} /> Consultar por WhatsApp
            </a>
            <div className="hidden sm:block">
              <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className={OUTLINE_BTN}>
                Comprar por Mercado Libre
              </a>
            </div>
          </div>
          <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="store-hero-in-3 mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6d5326] underline decoration-[#d9c9ad] underline-offset-4 transition hover:decoration-[#a8814f] sm:hidden">
            Compralo en Mercado Libre <ExternalLink size={14} />
          </a>
          <p className="store-hero-in-3 mt-5 text-xs text-[#9a8f81]">
            <strong className="font-semibold text-[#5c5347]">$ 1.200 UYU</strong> · Pago único · Personalización a medida
          </p>
          <div className="store-hero-in-3 mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#6f675e]">
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#a8814f]" /> Personalizada</span>
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#a8814f]" /> Lista para compartir</span>
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#a8814f]" /> Adaptada al celular</span>
          </div>
        </div>
      </section>

      {/* ===== Franja de la colección (10 escenas) ===== */}
      <section aria-label="Los diez diseños de la colección" className="relative z-10">
        <Reveal>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <OrnamentDivider className="mb-7" />
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible">
              {INVITATION_DESIGNS.map((design) => (
                <a
                  key={design.id}
                  href={'/Miluaistudio/catalogo/' + design.id + '/'}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block aspect-[4/5] w-[7.25rem] shrink-0 overflow-hidden rounded-xl border border-[#e8e1d8] shadow-[0_6px_18px_rgba(88,63,32,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(88,63,32,0.20)] sm:w-auto"
                  aria-label={'Probar el diseño ' + design.name}
                >
                  <img
                    src={design.scene}
                    alt={'Escena del diseño ' + design.name}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
                  />
                  <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-[#211c17]/55 px-2 py-1 text-center text-[9px] font-medium text-white backdrop-blur-sm sm:text-[10px]">
                    {design.name}
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-4 text-center text-[11px] text-[#9a8f81]">Tocá cualquier diseño para abrir su demostración completa.</p>
          </div>
        </Reveal>
      </section>

      {/* ===== Qué incluyen ===== */}
      <section id="incluye" className="relative z-10 mt-16 scroll-mt-20 sm:mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Mucho más que una tarjeta"
              title={<>Todo lo importante, <em className="italic" style={{ color: GOLD }}>en un solo enlace</em>.</>}
              sub="Cada invitación reúne las funciones esenciales del evento, configuradas según lo acordado al contratar."
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-8 divide-y divide-[#efe7dc] overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-[0_4px_16px_rgba(88,63,32,0.05)] sm:mt-10 sm:grid sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
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
                    <h3 className="font-serif text-base font-semibold text-[#29241f] sm:text-lg">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#6f675e] sm:mt-2">{feature.description}</p>
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
              <a href={CATALOG_URL} className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#8a6b3a] transition hover:text-[#6d5326]">
                Ver los diez diseños <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((design, index) => (
              <Reveal key={design.id} delay={index * 70}>
                <article className="group h-full overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-[0_4px_16px_rgba(88,63,32,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(88,63,32,0.14)]">
                  <a href={'/Miluaistudio/catalogo/' + design.id + '/'} target="_blank" rel="noreferrer" className="block aspect-[4/5] overflow-hidden" aria-label={'Probar ' + design.name + ' en una pestaña nueva'}>
                    <div className="h-full w-full transition duration-500 group-hover:scale-[1.03]">
                      <CatalogScene design={design} />
                    </div>
                  </a>
                  <div className="px-4 pb-4 pt-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: design.accentSoft }}>{design.category}</p>
                    <h3 className="mt-1 font-serif text-lg font-semibold">{design.name}</h3>
                    <a href={'/Miluaistudio/catalogo/' + design.id + '/'} target="_blank" rel="noreferrer" className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a6b3a] transition hover:text-[#6d5326]">
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
              { number: '1', icon: Search, title: 'Elegís el diseño que más te gusta', text: 'Explorás el catálogo, abrís las demos y encontrás el estilo ideal para tu evento.' },
              { number: '2', icon: MessageSquareText, title: 'Nos pasás los datos y la música', text: 'Nombres, fecha, lugar, fotos y la canción que querés sonando de fondo.' },
              { number: '3', icon: Share2, title: 'Recibís tu enlace listo para compartir', text: 'Te entregamos la invitación web para reenviarla por WhatsApp a tus invitados.' },
            ].map((step, index) => (
              <Reveal key={step.number} delay={index * 90}>
                <article className="relative h-full rounded-2xl border border-[#e8e1d8] bg-white p-6 text-center shadow-[0_4px_16px_rgba(88,63,32,0.05)] sm:p-7">
                  <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#dfc9a4] bg-[#f3ead9]" style={{ color: GOLD }}>
                    <step.icon size={22} strokeWidth={1.7} />
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#26221d] font-serif text-xs italic text-[#ecdcc0]">{step.number}</span>
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold leading-snug">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6f675e]">{step.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Reseñas ===== */}
      <section id="resenas" className="relative z-10 mt-16 scroll-mt-20 sm:mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Reseñas de clientes"
              title={<>Fiestas que ya comparten <em className="italic" style={{ color: GOLD }}>su enlace</em>.</>}
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIOS.map((t, index) => (
              <Reveal key={t.nombre} delay={index * 50}>
                <figure className="flex h-full flex-col rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-[0_4px_16px_rgba(88,63,32,0.05)] sm:p-6">
                  <div className="flex items-center gap-0.5 text-[#d9a53f]" aria-label="Calificación: 5 de 5 estrellas">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-[#5d564e]">“{t.comentario}”</blockquote>
                  <figcaption className="mt-4 border-t border-[#efe7dc] pt-3">
                    <span className="block text-sm font-semibold text-[#29241f]">{t.nombre}</span>
                    <span className="block text-xs text-[#9a8f81]">{t.evento}</span>
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
            <DesignAdornoGlyph adorno="eucalipto" className="absolute -bottom-10 -right-8 h-44 w-44 -scale-x-100 text-[#a8814f]/20" />
            <div className="relative mx-auto max-w-2xl text-center">
              <p className="font-serif text-xl italic sm:text-2xl" style={{ color: GOLD }}>Tu celebración empieza acá</p>
              <h2 className="mt-3 font-serif text-3xl leading-[1.15] tracking-tight sm:text-4xl">
                Elegí un diseño y <em className="italic" style={{ color: GOLD }}>hacelo tuyo</em>.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#6f675e] sm:text-base">
                Explorá la colección, probá las demostraciones y consultá las condiciones de personalización antes de comprar.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                <a href={CATALOG_URL} className={PRIMARY_BTN}>
                  Elegir diseño <ArrowRight size={16} />
                </a>
                <a href={whatsappLink(WHATSAPP_MENSAJE_GENERAL)} target="_blank" rel="noreferrer" className={WHATSAPP_BTN}>
                  <WhatsAppIcon size={16} /> Consultar por WhatsApp
                </a>
                <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className={OUTLINE_BTN}>
                  Ver publicación
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== Preguntas frecuentes ===== */}
      <section className="relative z-10 border-t border-[#e8e1d8] bg-white/60">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="Preguntas frecuentes"
              title={<>Antes de elegir <em className="italic" style={{ color: GOLD }}>tu invitación</em>.</>}
            />
          </Reveal>
          <div className="mt-9 space-y-3">
            {[
              { q: '¿Es una imagen o una página web?', a: 'Es una invitación web personalizada que se abre desde un enlace y puede reunir la información y las funciones acordadas para tu celebración.' },
              { q: '¿Mis invitados necesitan instalar una aplicación?', a: 'No. La invitación se abre desde un navegador compatible en el celular o la computadora.' },
              { q: '¿Puedo elegir los colores y el estilo?', a: 'Sí. El diseño se personaliza según tus preferencias y las opciones disponibles para el modelo elegido.' },
              { q: '¿Cómo se confirma la asistencia?', a: 'La invitación puede incluir RSVP. El método de registro y las funciones asociadas se confirman al definir la configuración del evento.' },
              { q: '¿Cuánto cuesta?', a: 'La publicación enlazada muestra actualmente un precio de $ 1.200 UYU, pago único. Revisá la publicación para confirmar el precio y las condiciones vigentes antes de comprar.' },
            ].map((item, index) => (
              <Reveal key={item.q} delay={index * 40}>
                <details className="group rounded-2xl border border-[#e8e1d8] bg-white px-5 py-4 shadow-[0_3px_12px_rgba(88,63,32,0.04)]">
                  <summary className="cursor-pointer list-none font-serif text-base font-semibold text-[#29241f] marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {item.q}
                      <span className="text-xl font-light transition group-open:rotate-45" style={{ color: GOLD }}>+</span>
                    </span>
                  </summary>
                  <p className="pt-3 text-sm leading-relaxed text-[#6f675e]">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pie ===== */}
      <footer className="relative z-10 bg-[#211c17] text-[#d8d0c5]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 pb-28 pt-10 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-10 lg:px-8">
          <div>
            <p className="font-serif text-base tracking-[0.08em] text-[#f0e8da]">MILUAISTUDIO</p>
            <p className="mt-1.5 text-[#a1988a]">Invitaciones digitales personalizadas · Uruguay</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href={whatsappLink(WHATSAPP_MENSAJE_GENERAL)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-white"><WhatsAppIcon size={13} /> WhatsApp</a>
            <a href={CATALOG_URL} className="transition hover:text-white">Catálogo</a>
            <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="transition hover:text-white">Comprar</a>
            <a href="/Miluaistudio/catalogo/rosa-romantica/" target="_blank" rel="noreferrer" className="transition hover:text-white">Ver demostración</a>
          </div>
          <p className="text-[#a1988a]">© {new Date().getFullYear()} Miluaistudio</p>
        </div>
      </footer>

      <WhatsAppFloat />
    </main>
  );
}
