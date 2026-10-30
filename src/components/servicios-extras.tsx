'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Check, ChevronDown, Clapperboard, Film, Images } from 'lucide-react';
import WhatsAppIcon from '@/components/whatsapp-icon';
import { SERVICIOS_EXTRA } from '@/data/servicios';
import { whatsappLink } from '@/data/contacto';
import { PREFIJO_ANCLA_SERVICIO } from '@/data/navegacion';

/**
 * Tarjetas de los servicios extra «próximamente» en formato acordeón:
 * cada fila muestra nombre + tagline + badge «Próximamente», y al abrirla
 * (toc directo o desde el menú superior, vía #servicio-<id>) despliega la
 * descripción, lo que incluirá y la CTA de WhatsApp. Estado inicial: todo
 * cerrado, para que el menú sea quien «despliegue el próximamente».
 */

const ICONO_SERVICIO: Record<string, typeof Images> = {
  'album-digital': Images,
  'edicion-video': Clapperboard,
  'video-historia': BookOpen,
  'trailer-evento': Film,
};

export default function ServiciosExtras() {
  const [abiertos, setAbiertos] = useState<ReadonlySet<string>>(new Set());
  const [destacado, setDestacado] = useState<string | null>(null);

  // Anclas #servicio-<id> (menú superior, enlaces internos, recarga con hash):
  // despliegan la tarjeta, la resaltan y la re-encuadran tras el despliegue.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const aplicar = () => {
      const h = window.location.hash || '';
      if (!h.startsWith(PREFIJO_ANCLA_SERVICIO)) return;
      const id = h.slice(PREFIJO_ANCLA_SERVICIO.length);
      if (!SERVICIOS_EXTRA.some((s) => s.id === id)) return;
      setAbiertos((prev) => {
        const n = new Set(prev);
        n.add(id);
        return n;
      });
      setDestacado(id);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setDestacado(null), 2800);
      setTimeout(() => {
        document.getElementById(PREFIJO_ANCLA_SERVICIO.slice(1) + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 90);
    };
    aplicar();
    window.addEventListener('hashchange', aplicar);
    return () => {
      window.removeEventListener('hashchange', aplicar);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const alternar = (id: string) =>
    setAbiertos((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="mx-auto mt-9 max-w-3xl space-y-3.5">
      {SERVICIOS_EXTRA.map((s) => {
        const Icono = ICONO_SERVICIO[s.id] ?? Film;
        const abierto = abiertos.has(s.id);
        return (
          <article
            key={s.id}
            id={PREFIJO_ANCLA_SERVICIO.slice(1) + s.id}
            data-servicio={s.id}
            className={
              'overflow-hidden rounded-2xl border bg-white shadow-[0_4px_16px_rgba(88,63,32,0.05)] transition-shadow ' +
              (destacado === s.id ? 'border-[#cbb289] pulso-dorado' : 'border-[#e8e0d7]')
            }
          >
            <button
              type="button"
              onClick={() => alternar(s.id)}
              aria-expanded={abierto}
              aria-controls={'panel-' + s.id}
              className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-[#fdfaf3] sm:p-5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#dfc9a4] bg-[#f3ead9] text-[#8a6534]">
                <Icono size={20} strokeWidth={1.7} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-lg font-semibold leading-snug text-[#292522]">{s.nombre}</span>
                <span className="mt-0.5 block truncate text-sm italic text-[#8a6534]">{s.tagline}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="rounded-full border border-[#dfc9a4] bg-[#faf6ef] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a6534]">
                  Próximamente
                </span>
                <ChevronDown size={16} className={'text-[#8a6534] transition-transform duration-300 ' + (abierto ? 'rotate-180' : '')} />
              </span>
            </button>

            {abierto && (
              <div id={'panel-' + s.id} className="servicio-abre border-t border-[#f0e9df] px-4 pb-5 pt-4 sm:px-5">
                <p className="text-sm leading-relaxed text-[#716a63]">{s.desc}</p>
                <ul className="mt-3 space-y-1.5">
                  {s.puntos.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-[#5d564e]">
                      <Check size={14} strokeWidth={2.4} className="mt-0.5 shrink-0 text-[#8a6534]" />
                      {p}
                    </li>
                  ))}
                </ul>
                <a
                  href={whatsappLink('Hola! Vi que el servicio «' + s.nombre + '» de Miluaistudio está próximamente. Quiero consultar más detalles y que me avisen cuando esté listo.')}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25d366] px-4 py-2.5 text-xs font-semibold text-[#0b3d1e] transition hover:bg-[#1db957]"
                >
                  <WhatsAppIcon size={14} /> Avisame cuando esté listo
                </a>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
