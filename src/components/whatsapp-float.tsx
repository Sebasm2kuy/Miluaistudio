'use client'

import { useEffect, useState } from 'react'
import WhatsAppIcon from '@/components/whatsapp-icon';
import { WHATSAPP_MENSAJE_GENERAL, whatsappLink } from '@/data/contacto';

/**
 * Botón flotante de WhatsApp (esquina inferior derecha).
 * Presente en portada y catálogo para conversión directa desde redes sociales.
 * Aparece recién después de pasar la primera pantalla, para no tapar el hero
 * ni sus botones principales durante la primera impresión.
 * Objetivo táctil de 56 px en móvil.
 */
export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <a
      href={whatsappLink(WHATSAPP_MENSAJE_GENERAL)}
      target="_blank"
      rel="noreferrer"
      aria-label="Consultar por WhatsApp"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={
        'group fixed bottom-5 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-[#0b3d1e] shadow-[0_10px_30px_rgba(37,211,102,0.45)] ring-4 ring-white/25 transition-all duration-300 hover:scale-105 hover:bg-[#1db957] sm:right-5 sm:h-16 sm:w-16 ' +
        (visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0')
      }
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#25d366]/40 [animation-duration:2.6s] animate-ping"
      />
      <WhatsAppIcon size={30} />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-[#17191b] px-3.5 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 lg:block">
        ¿Dudas? Consultá por WhatsApp
      </span>
    </a>
  );
}
