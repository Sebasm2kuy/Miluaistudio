'use client';

import { useState } from 'react';
import { ArrowRight, CalendarDays, Check, Clock3, ExternalLink, Heart, Images, MapPin, MessageSquareText, Music2, PenLine, Search, Share2, ShieldCheck, Sparkles, Star, X } from 'lucide-react';
import { INVITATION_DESIGNS, type InvitationDesign } from '@/data/invitation-designs';
import CatalogScene from '@/components/catalog-scene';
import WhatsAppIcon from '@/components/whatsapp-icon';
import WhatsAppFloat from '@/components/whatsapp-float';
import Reveal from '@/components/reveal';
import { OrnamentDivider } from '@/components/store-ui';
import { DesignAdornoGlyph } from '@/components/design-ornaments';
import { MERCADO_LIBRE_URL, WHATSAPP_MENSAJE_GENERAL, whatsappLink, whatsappLinkDiseno } from '@/data/contacto';
import { TESTIMONIOS } from '@/data/testimonios';
import { PRECIO } from '@/data/precio';

function DesignCard({ design, index, onQuickView }: { design: InvitationDesign; index: number; onQuickView: () => void }) {
  const demoUrl = '/Miluaistudio/catalogo/' + design.id + '/';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8e0d7] bg-white shadow-[0_4px_16px_rgba(34,26,19,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(34,26,19,0.10)]">
      <a
        href={demoUrl}
        target="_blank"
        rel="noreferrer"
        className="relative block aspect-[4/5] w-full overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b58c5a]"
        aria-label={'Abrir la invitación de muestra ' + design.name + ' en una pestaña nueva'}
      >
        <CatalogScene design={design} />
        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-[#38332e] shadow-sm">
          {String(index + 1).padStart(2, '0')} / 10
        </span>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-[#151719]/85 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm">
          Abrir invitación <ExternalLink size={11} />
        </span>
      </a>

      <div className="flex flex-1 flex-col p-4 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: design.accentSoft }}>{design.category}</p>
            <h2 className="mt-1 font-serif text-base font-semibold leading-snug text-[#292522] sm:text-lg">{design.name}</h2>
          </div>
        </div>

        <p className="mt-2 min-h-[4.5rem] text-xs leading-relaxed text-[#716a63]">{design.description}</p>

        <div className="mt-3 flex items-center gap-1.5" aria-label={'Paleta ' + design.palette}>
          {design.paletteDots.map((color, dotIndex) => (
            <span key={design.id + '-' + dotIndex} title={color} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: color }} />
          ))}
          <span className="ml-1 truncate text-[10px] text-[#82786e]">{design.palette}</span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <strong className="text-base font-bold tracking-tight text-[#292522]">{PRECIO.texto}</strong>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5c7355]">
              <Check size={12} strokeWidth={3} /> {PRECIO.condicion}
            </span>
          </div>
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-semibold transition hover:brightness-110"
            style={{ background: design.buttonBg, color: design.buttonText }}
          >
            Ver invitación <ArrowRight size={14} />
          </a>
          <a
            href={whatsappLinkDiseno(design.name)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] px-3 py-3 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(37,211,102,0.24)] transition hover:bg-[#1db957]"
          >
            <WhatsAppIcon size={15} /> Consultar por WhatsApp
          </a>
          <button type="button" onClick={onQuickView} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8e0d7] px-3 py-2.5 text-xs font-medium text-[#62584f] transition hover:bg-[#f8f5f1]">
            Ver detalles
          </button>
        </div>
      </div>
    </article>
  );
}

const FEATURE_BAR = [
  { icon: Sparkles, label: 'Diseños exclusivos' },
  { icon: Check, label: 'Totalmente personalizables' },
  { icon: Clock3, label: 'Con cuenta regresiva' },
  { icon: Images, label: 'Galería de fotos' },
  { icon: Music2, label: 'Música' },
  { icon: ShieldCheck, label: 'Confirmación de asistencia' },
  { icon: CalendarDays, label: 'Ubicación y calendario' },
];

export default function CatalogoPage() {
  const [selected, setSelected] = useState<InvitationDesign | null>(null);

  return (
    <div data-page="storefront" className="min-h-screen bg-[#faf8f4] text-[#292522]">
      <header className="sticky top-0 z-40 border-b border-[#e8e0d7] bg-white/85 text-[#292522] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <a href="/Miluaistudio/" className="flex items-center gap-3" aria-label="Volver al inicio de Miluaistudio">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfc9a4] bg-white text-[#b58c5a]"><Heart size={19} /></span>
            <span>
              <span className="block font-serif text-lg tracking-[0.08em] sm:text-xl">MILUAISTUDIO</span>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-[#8f867c]">Tu historia, en formato digital</span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <a href={whatsappLink(WHATSAPP_MENSAJE_GENERAL)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1db957] sm:text-sm">
              <WhatsAppIcon size={16} />
              <span className="hidden sm:inline">Consultar por WhatsApp</span>
            </a>
            <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#e8e0d7] bg-white px-4 py-2.5 text-xs font-semibold text-[#54483e] transition hover:bg-[#f3ead9] sm:px-5 sm:text-sm">
              <span className="hidden sm:inline">Consultar / contratar</span>
              <span className="sm:hidden">Mercado Libre</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pb-14 pt-9 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
        <section className="mx-auto max-w-4xl text-center">
          <p className="font-serif text-xl italic sm:text-2xl" style={{ color: '#b58c5a' }}>La colección</p>
          <h1 className="mt-2 font-serif text-2xl leading-snug tracking-wide text-[#292522] sm:text-3xl lg:text-4xl">
            10 diseños únicos
            <span className="mx-2 text-[#b18163]">·</span>
            <em className="italic text-[#7d746a]">La invitación perfecta para tu gran momento</em>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#716a63] sm:text-base">
            Elegí el estilo que más te guste y hacé de tu fiesta un evento inolvidable. Cada diseño incluye una invitación web completa con cuenta regresiva, galería, música y confirmación de asistencia.
          </p>
          <a
            href="/Miluaistudio/personalizar/"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#292522] px-5 py-2.5 text-sm font-semibold text-[#fdfbf7] shadow-[0_10px_26px_rgba(38,34,29,0.22)] transition hover:-translate-y-0.5 hover:bg-[#3d3830]"
          >
            <PenLine size={15} /> Personalizar con mis datos
          </a>
          <OrnamentDivider className="mt-6" />
        </section>

        <section id="disenos" className="mt-10 scroll-mt-6 sm:mt-12">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-5">
            {INVITATION_DESIGNS.map((design, index) => (
              <DesignCard key={design.id} design={design} index={index} onQuickView={() => setSelected(design)} />
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-[#8f867c]">
            Tocá cualquier tarjeta: la invitación se abre sola en una pestaña nueva, carga con el nombre
            y arranca la demostración completa — cuenta regresiva, música, galería y RSVP funcionando.
          </p>
        </section>

        {/* Cómo funciona (3 pasos) */}
        <section aria-labelledby="como-funciona-titulo" className="mt-14 scroll-mt-24 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-xl italic sm:text-2xl" style={{ color: '#b58c5a' }}>Cómo funciona</p>
            <h2 id="como-funciona-titulo" className="mt-2 font-serif text-2xl text-[#292522] sm:text-3xl">Tu invitación, en 3 pasos.</h2>
          </div>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Search, titulo: 'Elegís el diseño que más te gusta', texto: 'Abrís la demo, la probás con calma y ves todo lo que incluye.' },
              { icon: MessageSquareText, titulo: 'Nos pasás los datos y la música de tu evento', texto: 'Nombres, fecha, lugar, fotos y la canción que querés de fondo.' },
              { icon: Share2, titulo: 'Recibís tu enlace listo para compartir por WhatsApp', texto: 'Un solo link con todo adentro: lo reenviás y listo.' },
            ].map((paso, pasoIndex) => (
              <Reveal key={paso.titulo} delay={pasoIndex * 80}>
                <li className="relative h-full rounded-2xl border border-[#e8e0d7] bg-white p-5 shadow-[0_4px_16px_rgba(88,63,32,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(88,63,32,0.11)] sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3ead9] text-[#a8814f]">
                      <paso.icon size={20} strokeWidth={1.8} />
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#292522] font-serif text-sm italic text-[#ecdcc0]">{pasoIndex + 1}</span>
                  </div>
                  <h3 className="mt-4 font-serif text-base font-semibold leading-snug text-[#292522]">{paso.titulo}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#716a63] sm:text-sm">{paso.texto}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Reseñas / prueba social */}
        <section aria-labelledby="resenas-titulo" className="mt-14 scroll-mt-24 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-xl italic sm:text-2xl" style={{ color: '#b58c5a' }}>Lo que buscamos para cada evento</p>
            <h2 id="resenas-titulo" className="mt-2 font-serif text-2xl text-[#292522] sm:text-3xl">Así se ve una buena experiencia.</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIOS.map((t, tIndex) => (
              <Reveal key={t.nombre} delay={tIndex * 50}>
                <figure className="flex h-full flex-col rounded-2xl border border-[#e8e0d7] bg-white p-5 shadow-[0_4px_16px_rgba(88,63,32,0.05)]">
                  <div className="flex items-center gap-0.5 text-[#d9a53f]" aria-label="Calificación: 5 de 5 estrellas">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-[#5d564e]">“{t.comentario}”</blockquote>
                  <figcaption className="mt-4 border-t border-[#f0e9df] pt-3">
                    <span className="block text-sm font-semibold text-[#292522]">{t.nombre}</span>
                    <span className="block text-xs text-[#8f867c]">{t.evento}</span>
                    {t.estado !== 'verificado' && (
                      <span className="mt-1 inline-block rounded-full border border-[#e8e0d7] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8f867c]">
                        Ejemplo de referencia
                      </span>
                    )}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal>
        <section className="relative mt-12 overflow-hidden rounded-3xl border border-[#e6d5bd] p-6 sm:mt-16 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10" style={{ background: 'linear-gradient(120deg, #fdf3ec 0%, #f8ecdd 48%, #f3e6d3 100%)' }}>
          <DesignAdornoGlyph adorno="rosas" className="absolute -right-10 -top-10 h-44 w-44 text-[#b98a94]/20" />
          <div className="relative max-w-2xl">
            <p className="font-serif text-xl italic sm:text-2xl" style={{ color: '#b58c5a' }}>Una invitación, toda la información</p>
            <h2 className="mt-2 font-serif text-2xl text-[#292522] sm:text-3xl">Tu evento, en un solo enlace.</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#716a63]">Cuenta regresiva, galería, música, ubicación, calendario y confirmación de asistencia, según la configuración acordada para tu evento.</p>
          </div>
          <div className="relative mt-5 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0">
            <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#292522] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3d3830]">
              Consultar la publicación <ExternalLink size={15} />
            </a>
            <a href={whatsappLink(WHATSAPP_MENSAJE_GENERAL)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#25d366] px-5 py-3 text-sm font-semibold text-[#17903f] transition hover:bg-[#25d366]/10">
              <WhatsAppIcon size={16} /> WhatsApp
            </a>
          </div>
        </section>
        </Reveal>
      </main>

      {/* Barra de características (como en la referencia) */}
      <div className="border-t border-[#e8e0d7] bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-4 text-[11px] text-[#716a63] sm:gap-x-8 sm:text-xs">
          {FEATURE_BAR.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <Icon size={13} className="text-[#b58c5a]" /> {label}
            </span>
          ))}
        </div>
      </div>

      <footer className="bg-[#292522] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 pb-24 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-6 lg:px-8">
          <span className="font-serif tracking-[0.12em] text-white/85">MILUAISTUDIO</span>
          <span className="text-white/50">Tu historia, en formato digital.</span>
          <span className="text-white/50">© {new Date().getFullYear()} Miluaistudio · Uruguay</span>
        </div>
      </footer>

      <WhatsAppFloat />

      {selected && (
        <div className="fixed inset-0 z-[300] overflow-y-auto bg-[#17191b]/80 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label={'Vista previa ' + selected.name} onClick={() => setSelected(null)}>
          <div className="mx-auto flex min-h-full max-w-4xl items-center justify-center">
            <div className="relative grid w-full gap-5 rounded-3xl bg-white p-4 shadow-2xl sm:p-6 lg:grid-cols-2 lg:gap-8" onClick={(event) => event.stopPropagation()}>
              <button onClick={() => setSelected(null)} type="button" className="absolute right-3 top-3 z-10 rounded-full border border-[#e5ddd4] bg-white/90 p-2 text-[#4c4844] hover:bg-white" aria-label="Cerrar vista previa"><X size={18} /></button>
              <div className="pt-8 lg:pt-0">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl">
                  <CatalogScene design={selected} />
                </div>
                <p className="mt-2 text-center text-[10px] text-[#8f867c]">Maqueta del diseño · Invitación web interactiva de muestra</p>
              </div>
              <div className="flex flex-col justify-center py-2 pr-1 sm:py-5 lg:pr-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: selected.accentSoft }}>{selected.category}</span>
                <h2 className="mt-2 font-serif text-3xl text-[#292522] sm:text-4xl">{selected.name}</h2>
                <p className="mt-2 text-sm font-medium text-[#8f867c]">Ejemplo: {selected.mockupName}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#716a63]">{selected.description}</p>
                <div className="mt-4 flex items-center gap-2" aria-label={'Paleta ' + selected.palette}>
                  {selected.paletteDots.map((color, dotIndex) => (
                    <span key={selected.id + '-qv-' + dotIndex} title={color} className="h-4 w-4 rounded-full border border-black/10" style={{ background: color }} />
                  ))}
                  <span className="ml-1 text-[11px] text-[#82786e]">{selected.palette}</span>
                </div>
                <div className="mt-5 space-y-2 text-sm text-[#716a63]">
                  <div className="flex items-center gap-2"><Clock3 size={16} /> Cuenta regresiva con diseño a juego</div>
                  <div className="flex items-center gap-2"><Images size={16} /> Galería de fotos de muestra</div>
                  <div className="flex items-center gap-2"><MapPin size={16} /> Ubicación y calendario</div>
                  <div className="flex items-center gap-2"><Music2 size={16} /> Música y funciones interactivas</div>
                </div>
                <div className="mt-6 flex items-center justify-between border-y border-[#e8e0d7] py-4">
                  <strong className="text-lg text-[#292522]">{PRECIO.texto}</strong>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5c7355]">
                    <Check size={15} strokeWidth={3} /> {PRECIO.condicion}
                  </span>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a href={'/Miluaistudio/personalizar/?diseno=' + selected.id} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#292522] px-5 py-3 text-sm font-semibold text-[#fdfbf7] transition hover:bg-[#3d3830]">
                    <PenLine size={15} /> Personalizar este diseño
                  </a>
                  <a href={'/Miluaistudio/catalogo/' + selected.id + '/'} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:brightness-110" style={{ background: selected.buttonBg, color: selected.buttonText }}>
                    Abrir demostración <ArrowRight size={15} />
                  </a>
                  <a href={whatsappLinkDiseno(selected.name)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1db957]">
                    <WhatsAppIcon size={16} /> Consultar por WhatsApp
                  </a>
                  <a href={MERCADO_LIBRE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9cec2] px-5 py-3 text-sm font-semibold text-[#54483e] hover:bg-white">
                    Mercado Libre <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
