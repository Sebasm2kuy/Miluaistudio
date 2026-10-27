'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  ArrowRight,
  CalendarClock,
  Check,
  ExternalLink,
  Heart,
  Music2,
  PenLine,
  Sparkles,
  Type,
  X,
} from 'lucide-react';
import { INVITATION_DESIGNS, type InvitationDesign } from '@/data/invitation-designs';
import MiniInvitation, { miniFromDesign, type MiniInvitationData } from '@/components/mini-invitation';
import CatalogScene from '@/components/catalog-scene';
import InvitationExperience from '@/components/invitation-experience';
import { ConfigProvider } from '@/hooks/useConfig';
import { OrnamentDivider } from '@/components/store-ui';
import WhatsAppIcon from '@/components/whatsapp-icon';
import WhatsAppFloat from '@/components/whatsapp-float';
import { MERCADO_LIBRE_URL, whatsappLink } from '@/data/contacto';
import {
  createPersonalConfig,
  fechaSugerida,
  mensajeWhatsAppPersonal,
  partesFecha,
  TIPOS_EVENTO,
  type DatosPersonales,
} from '@/lib/personalizador';

const CATALOGO_URL = '/Miluaistudio/catalogo/';
const PERSONALIZAR_URL = '/Miluaistudio/personalizar/';

const DATOS_INICIALES: DatosPersonales = {
  tipo: 'Mis XV años',
  nombre: '',
  fecha: '',
  hora: '21:00',
  lugar: '',
  frase: '',
  musica: '',
};

/** Miniatura del paso 1: la misma maqueta de las galerías */
function MiniaturaDiseno({ design, selected, onSelect }: { design: InvitationDesign; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={
        'group relative block overflow-hidden rounded-2xl border text-left transition duration-300 hover:-translate-y-1 ' +
        (selected
          ? 'border-[#f1a46a] shadow-[0_0_0_2px_rgba(241,164,106,0.55),0_18px_40px_rgba(0,0,0,0.35)]'
          : 'border-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.22)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.4)]')
      }
    >
      <span className="block aspect-[4/5] w-full">
        <CatalogScene design={design} />
      </span>
      <span className="absolute inset-x-2 bottom-2 rounded-lg bg-black/55 px-2 py-1.5 text-center text-[11px] font-semibold text-white backdrop-blur-sm">
        {design.name}
      </span>
      {selected && (
        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#f1a46a] text-[#17191d] shadow-lg">
          <Check size={16} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

/** Vista previa instantánea de la portada dentro de un celular */
function PhonePreview({ data }: { data: MiniInvitationData }) {
  return (
    <div className="relative mx-auto w-[218px] rounded-[2.6rem] bg-[#101012] p-[9px] shadow-[0_28px_60px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.12)] sm:w-[248px]">
      <div className="relative aspect-[9/18.6] w-full overflow-hidden rounded-[2.05rem]">
        <MiniInvitation data={data} variant="screen" />
        <div className="absolute left-1/2 top-[1.6%] h-[3%] w-[40%] -translate-x-1/2 rounded-full bg-[#101012]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.14) 0%, transparent 26%, transparent 72%, rgba(255,255,255,0.05) 100%)' }}
        />
      </div>
    </div>
  );
}

const INPUT_CLS =
  'w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-[#f7f1e8] placeholder:text-[#8b8b92] outline-none transition focus:border-[#f1a46a]/60 focus:bg-white/[0.09]';
const LABEL_CLS = 'mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#b2b1b6]';

export default function PersonalizadorApp() {
  const [designId, setDesignId] = useState<string | null>(null);
  const [datos, setDatos] = useState<DatosPersonales>(DATOS_INICIALES);
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [overlayKey, setOverlayKey] = useState(0);

  // Preselección vía /personalizar/?diseno=oro-real (solo cliente, sin hidratación rota)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get('diseno');
    if (d && INVITATION_DESIGNS.some((item) => item.id === d)) setDesignId(d);
    setDatos((prev) => ({ ...prev, fecha: prev.fecha || fechaSugerida() }));
  }, []);

  // Bloquear el scroll de fondo mientras la vista completa está abierta
  useEffect(() => {
    if (!vistaPrevia) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVistaPrevia(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [vistaPrevia]);

  const design = INVITATION_DESIGNS.find((item) => item.id === designId) ?? null;

  const previewData = useMemo<MiniInvitationData | null>(() => {
    if (!design) return null;
    const base = miniFromDesign(design);
    const p = partesFecha(datos.fecha, datos.hora);
    return {
      ...base,
      name: datos.nombre.trim() || 'Tu nombre',
      tipo: datos.tipo.trim() || base.tipo,
      dateLabel: p?.dateLabel ?? base.dateLabel,
    };
  }, [design, datos.nombre, datos.tipo, datos.fecha, datos.hora]);

  const configCompleta = useMemo(
    () => (design ? createPersonalConfig(design, datos) : null),
    [design, datos],
  );

  const linkWhatsApp = useMemo(
    () => (design ? whatsappLink(mensajeWhatsAppPersonal(design, datos)) : '#'),
    [design, datos],
  );

  const set = (campo: keyof DatosPersonales) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDatos((prev) => ({ ...prev, [campo]: e.target.value }));

  const abrirVistaCompleta = () => {
    setOverlayKey((k) => k + 1);
    setVistaPrevia(true);
  };

  return (
    <div data-page="storefront" className="milua-neo min-h-screen bg-[#f7f4ef] text-[#272a2d]">
      {/* ===== Encabezado ===== */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0f1115]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="/Miluaistudio/" className="flex items-center gap-2.5" aria-label="Volver al inicio de Miluaistudio">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f1a46a]/40 bg-white/5 text-[#f1a46a]">
              <Heart size={17} />
            </span>
            <span>
              <span className="block font-serif text-base tracking-[0.08em] sm:text-lg">MILUAISTUDIO</span>
              <span className="hidden text-[9px] uppercase tracking-[0.2em] text-white/50 sm:block">Personalizá tu invitación</span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <a
              href={CATALOGO_URL}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-medium text-[#e6e1d8] transition hover:bg-white/10 sm:text-sm"
            >
              Ver diseños
            </a>
            <a
              href={whatsappLink('Hola! Quiero ayuda para personalizar mi invitación digital.')}
              target="_blank"
              rel="noreferrer"
              aria-label="Consultar por WhatsApp"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_6px_16px_rgba(37,211,102,0.3)] transition hover:bg-[#1db957]"
            >
              <WhatsAppIcon size={16} />
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-9 sm:px-6 sm:pt-12">
        {/* ===== Intro ===== */}
        <section className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-[#e4d9cb]">
            <Sparkles size={14} className="text-[#f1a46a]" /> Auto-servicio · Sin registro · Gratis
          </p>
          <h1 className="mt-5 font-serif text-3xl leading-[1.1] tracking-tight sm:text-5xl">
            Creá tu invitación <em className="italic" style={{ color: 'transparent', backgroundImage: 'linear-gradient(105deg, #f1a46a 0%, #f4d1a7 48%, #70d7d0 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>en minutos</em>.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#b2b1b6] sm:text-base">
            Elegí un diseño, cargá tus datos y mirá cómo queda tu invitación al instante. Si te gusta, nos la enviás por WhatsApp y la dejamos lista para publicar.
          </p>
          <OrnamentDivider className="mt-7" />
        </section>

        {/* ===== Paso 1 · Elegí el diseño ===== */}
        <section className="mt-10 sm:mt-12">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl sm:text-2xl">
              <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f1a46a] font-sans text-xs font-bold not-italic text-[#17191d]">1</span>
              Elegí el diseño
            </h2>
            {design && (
              <button
                type="button"
                onClick={() => setDesignId(null)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-[#e6e1d8] transition hover:bg-white/10"
              >
                <PenLine size={13} /> Cambiar diseño: <strong className="font-semibold text-[#f1a46a]">{design.name}</strong>
              </button>
            )}
          </div>

          {!design ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {INVITATION_DESIGNS.map((item) => (
                <MiniaturaDiseno key={item.id} design={item} selected={false} onSelect={() => setDesignId(item.id)} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-[#b2b1b6]">
                Elegiste <strong className="font-semibold text-[#f7f1e8]">{design.name}</strong> — {design.description.split('.')[0]}. Ahora completá tus datos:
              </p>
            </div>
          )}
        </section>

        {/* ===== Paso 2 · Tus datos + vista previa ===== */}
        {design && (
          <section className="mt-10 sm:mt-12">
            <h2 className="mb-5 font-serif text-xl sm:text-2xl">
              <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f1a46a] font-sans text-xs font-bold not-italic text-[#17191d]">2</span>
              Tus datos — la vista previa se actualiza al instante
            </h2>

            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
              {/* Formulario */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="p-tipo" className={LABEL_CLS}><Type size={13} className="text-[#f1a46a]" /> Tipo de evento</label>
                    <input
                      id="p-tipo"
                      list="p-tipos"
                      value={datos.tipo}
                      onChange={set('tipo')}
                      placeholder="Mis XV años"
                      maxLength={40}
                      className={INPUT_CLS}
                    />
                    <datalist id="p-tipos">
                      {TIPOS_EVENTO.map((t) => <option key={t} value={t} />)}
                    </datalist>
                  </div>
                  <div>
                    <label htmlFor="p-nombre" className={LABEL_CLS}><Sparkles size={13} className="text-[#f1a46a]" /> Nombre(s)</label>
                    <input
                      id="p-nombre"
                      value={datos.nombre}
                      onChange={set('nombre')}
                      placeholder={design.mockupName}
                      maxLength={32}
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <label htmlFor="p-fecha" className={LABEL_CLS}><CalendarClock size={13} className="text-[#f1a46a]" /> Fecha del evento</label>
                    <input id="p-fecha" type="date" value={datos.fecha} onChange={set('fecha')} className={INPUT_CLS + ' [color-scheme:dark]'} />
                  </div>
                  <div>
                    <label htmlFor="p-hora" className={LABEL_CLS}><CalendarClock size={13} className="text-[#f1a46a]" /> Hora</label>
                    <input id="p-hora" type="time" value={datos.hora} onChange={set('hora')} className={INPUT_CLS + ' [color-scheme:dark]'} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="p-lugar" className={LABEL_CLS}><PenLine size={13} className="text-[#f1a46a]" /> Lugar del evento</label>
                    <input id="p-lugar" value={datos.lugar} onChange={set('lugar')} placeholder="Ej: Salón Imperial, Jardín Magnolia…" maxLength={60} className={INPUT_CLS} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="p-frase" className={LABEL_CLS}><Type size={13} className="text-[#f1a46a]" /> Frase o dedicatoria (opcional)</label>
                    <textarea
                      id="p-frase"
                      value={datos.frase}
                      onChange={set('frase')}
                      rows={2}
                      maxLength={160}
                      placeholder="Una frase especial que quieras incluir al abrir la invitación…"
                      className={INPUT_CLS + ' resize-none'}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="p-musica" className={LABEL_CLS}><Music2 size={13} className="text-[#f1a46a]" /> Canción de Spotify (opcional)</label>
                    <input
                      id="p-musica"
                      value={datos.musica}
                      onChange={set('musica')}
                      placeholder="https://open.spotify.com/playlist/…"
                      className={INPUT_CLS}
                    />
                    <p className="mt-1.5 text-[11px] text-[#8b8b92]">Pegá el enlace de una playlist, álbum o tema y sonará en tu invitación.</p>
                  </div>
                </div>
              </div>

              {/* Columna de vista previa */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#b2b1b6]">Vista previa en vivo</p>
                  {previewData && <PhonePreview data={previewData} />}
                  <button
                    type="button"
                    onClick={abrirVistaCompleta}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#17191d] shadow-[0_10px_26px_rgba(241,164,106,0.25)] transition hover:brightness-110"
                    style={{ background: 'linear-gradient(110deg, #f1a46a, #f6c78f 48%, #70d7d0)' }}
                  >
                    Abrir la invitación completa <ArrowRight size={15} />
                  </button>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-[#8b8b92]">
                    Cuenta regresiva, galería, música y confirmación de asistencia funcionando con tus datos.
                  </p>
                </div>

                {/* Paso 3 · Pedir */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="mb-3 font-serif text-lg">
                    <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f1a46a] font-sans text-xs font-bold not-italic text-[#17191d]">3</span>
                    ¿Te gusta? Pedila lista
                  </p>
                  <a
                    href={linkWhatsApp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(37,211,102,0.28)] transition hover:bg-[#1db957]"
                  >
                    <WhatsAppIcon size={16} /> Enviar mi configuración
                  </a>
                  <a
                    href={MERCADO_LIBRE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-medium text-[#e6e1d8] transition hover:bg-white/10"
                  >
                    Comprar por Mercado Libre <ExternalLink size={13} />
                  </a>
                  <p className="mt-3 text-[11px] leading-relaxed text-[#8b8b92]">
                    Te llega con tu diseño, nombre, fecha, lugar, frase y música. Con el pago lo dejamos publicado con tu enlace final.
                  </p>
                </div>
              </aside>
            </div>
          </section>
        )}

        {/* ===== Nota final ===== */}
        <section className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
          <p className="font-serif text-lg italic text-[#f4d1a7] sm:text-xl">¿Preferís que lo hagamos por vos?</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#b2b1b6]">
            Elegí el diseño y escribinos: cargamos todos los datos por vos, te mandamos la vista previa y publicamos cuando la apruebes.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={CATALOGO_URL} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-[#e6e1d8] transition hover:bg-white/10">
              Explorar los 10 diseños <ArrowRight size={15} />
            </a>
            <a
              href={whatsappLink('Hola! Quiero que me ayuden a personalizar mi invitación digital.')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1db957]"
            >
              <WhatsAppIcon size={15} /> Escribir por WhatsApp
            </a>
          </div>
        </section>
      </main>

      {/* ===== Pie ===== */}
      <footer className="border-t border-white/10 bg-[#0b0d10]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="font-serif tracking-[0.12em] text-white/85">MILUAISTUDIO</span>
          <span>Personalización auto-servicio · tu vista previa no se guarda ni se comparte.</span>
          <span>© {new Date().getFullYear()} Miluaistudio · Uruguay</span>
        </div>
      </footer>

      <WhatsAppFloat />

      {/* ===== Vista previa completa (pantalla entera) ===== */}
      {vistaPrevia && design && configCompleta && (
        <div className="fixed inset-0 z-[500] bg-black" role="dialog" aria-modal="true" aria-label={'Vista previa completa del diseño ' + design.name}>
          <ConfigProvider config={configCompleta}>
            <InvitationExperience key={overlayKey} />
          </ConfigProvider>
          <button
            type="button"
            onClick={() => setVistaPrevia(false)}
            className="fixed left-3 top-3 z-[600] inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/75 px-3 py-2 text-xs font-medium text-white/90 shadow-lg backdrop-blur-md transition hover:border-white/40 hover:bg-black/90 sm:left-5 sm:top-5 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <X size={15} /> Cerrar vista previa
          </button>
          <a
            href={linkWhatsApp}
            target="_blank"
            rel="noreferrer"
            className="fixed right-3 top-3 z-[600] inline-flex items-center gap-2 rounded-full bg-[#25d366] px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-[#1db957] sm:right-5 sm:top-5 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <WhatsAppIcon size={14} /> Pedir esta invitación
          </a>
        </div>
      )}
    </div>
  );
}
