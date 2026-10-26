import WhatsAppIcon from '@/components/whatsapp-icon';
import { WHATSAPP_MENSAJE_GENERAL, whatsappLink } from '@/data/contacto';

/**
 * Botón flotante de WhatsApp (esquina inferior derecha).
 * Presente en portada y catálogo para conversión directa desde redes sociales.
 * Objetivo táctil de 56 px en móvil.
 */
export default function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(WHATSAPP_MENSAJE_GENERAL)}
      target="_blank"
      rel="noreferrer"
      aria-label="Consultar por WhatsApp"
      className="group fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition hover:scale-105 hover:bg-[#1db957] sm:h-16 sm:w-16"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366]/40 [animation-duration:2.6s]"
      />
      <WhatsAppIcon size={30} />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-[#17191b] px-3.5 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 lg:block">
        ¿Dudas? Consultá por WhatsApp
      </span>
    </a>
  );
}
