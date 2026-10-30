'use client';

import { useEffect, useState } from 'react';
import { Heart, Menu, PenLine, X } from 'lucide-react';
import WhatsAppIcon from '@/components/whatsapp-icon';
import { ITEMS_NAV } from '@/data/navegacion';
import { WHATSAPP_MENSAJE_GENERAL, whatsappLink } from '@/data/contacto';

/**
 * Encabezado de la portada con navegación completa en escritorio y menú
 * desplegable en móvil. Los servicios «próximamente» son ítems de menú con
 * una etiqueta «pronto»; al abrirlos la tarjeta correspondiente se despliega
 * (ver servicios-extras.tsx).
 */
export default function StoreNav() {
  const [abierto, setAbierto] = useState(false);

  // Escape cierra el menú móvil
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto]);

  return (
    <header className="relative z-40 border-b border-[#e8e0d7] bg-[#faf8f4]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-nowrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
        <a href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Lumen Gala, inicio">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dfc9a4] bg-white text-[#9c7443] shadow-sm sm:h-10 sm:w-10">
            <Heart size={17} />
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-base leading-tight tracking-[0.06em] sm:text-xl">LUMEN GALA</span>
            <span className="hidden text-[9px] uppercase tracking-[0.24em] text-[#787168] sm:block">Invitaciones digitales</span>
          </span>
        </a>

        {/* Navegación de escritorio: servicios «próximamente» incluidos */}
        <nav aria-label="Navegación principal" className="hidden items-center gap-5 lg:flex">
          {ITEMS_NAV.map((item) => (
            <a key={item.href} href={item.href} className="inline-flex items-center gap-1.5 text-sm text-[#716a63] transition hover:text-[#292522]">
              {item.label}
              {item.servicio && (
                <span className="rounded-full bg-[#f3ead9] px-1.5 py-px text-[8px] font-bold uppercase tracking-wider text-[#8a6534]">
                  pronto
                </span>
              )}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a href={whatsappLink(WHATSAPP_MENSAJE_GENERAL)} target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25d366] text-[#0b3d1e] shadow-[0_6px_16px_rgba(37,211,102,0.3)] transition hover:bg-[#1db957]">
            <WhatsAppIcon size={17} />
          </a>
          <a href="/personalizar/" className="hidden items-center gap-1.5 rounded-full bg-[#26221d] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3d3830] sm:gap-2 sm:px-5 sm:text-sm sm:inline-flex">
            Personalizar <PenLine size={14} />
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e0d7] bg-white text-[#292522] shadow-sm transition hover:border-[#dfc9a4] lg:hidden"
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setAbierto((v) => !v)}
          >
            {abierto ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Menú desplegable móvil */}
      {abierto && (
        <nav id="menu-movil" aria-label="Navegación móvil" className="servicio-abre border-t border-[#e8e0d7] bg-white px-4 pb-5 pt-3 shadow-[0_18px_38px_rgba(88,63,32,0.12)] lg:hidden">
          <ul className="space-y-1">
            {ITEMS_NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setAbierto(false)}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#3d3830] transition hover:bg-[#f6efe2]"
                >
                  {item.label}
                  {item.servicio && (
                    <span className="rounded-full bg-[#f3ead9] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8a6534]">
                      pronto
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2 border-t border-[#f0e9df] pt-4">
            <a href="/personalizar/" onClick={() => setAbierto(false)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#26221d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3d3830]">
              Personalizar mi invitación <PenLine size={15} />
            </a>
            <a href="/catalogo/" onClick={() => setAbierto(false)} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e8e0d7] px-5 py-3 text-sm font-semibold text-[#3d3830] transition hover:border-[#dfc9a4]">
              Ver el catálogo
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
