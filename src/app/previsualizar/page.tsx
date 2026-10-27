import type { Metadata } from 'next';
import VistaPreviaLocal from '@/components/vista-previa-local';

/**
 * Vista previa local del panel — /previsualizar/
 *
 * Página de apoyo para el flujo del panel de administración (herramienta
 * local): renderiza la experiencia real de invitación con la configuración
 * guardada por el panel en este navegador (localStorage), ANTES de publicar.
 *
 * Sin esa configuración local muestra la base de demostración sintética,
 * así que en el sitio público la página no revela ningún dato (y noindex
 * evita que se promueva). Solo tiene uso en desarrollo local.
 */

export const metadata: Metadata = {
  title: 'Vista previa local',
  description: 'Vista previa local de la invitación en edición. No es una invitación publicada.',
  robots: { index: false, follow: false },
};

export default function PaginaPrevisualizar() {
  return <VistaPreviaLocal />;
}
