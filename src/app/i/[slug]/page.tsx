import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InvitationExperience from '@/components/invitation-experience';
import { ConfigProvider } from '@/hooks/useConfig';
import {
  listarSlugsPublicados,
  leerInvitacionPublicada,
} from '@/lib/invitaciones-publicadas';
import { urlPublicaInvitacion } from '@/data/invitacion-publicada';

/**
 * Invitación publicada — /i/[slug]/
 *
 * Página estática generada a partir de content/invitaciones/<slug>.json.
 * Cada invitación publicada tiene su propio archivo y su propia URL:
 * publicar otra no altera esta ruta ni su contenido. Renderiza la MISMA
 * experiencia que las demos (InvitationExperience + ConfigProvider),
 * sin duplicar la implementación visual.
 *
 * Indexación: las invitaciones contienen datos de un evento privado;
 * se comparten con un enlace directo a invitados, no se promueven a
 * buscadores (misma política que las demos del catálogo).
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return listarSlugsPublicados().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const invitacion = leerInvitacionPublicada(slug);

  if (!invitacion) {
    return { title: 'Invitación no encontrada', robots: { index: false, follow: false } };
  }

  const nombre = invitacion.config.evento.nombre;
  const tipo = invitacion.config.evento.tipo || 'Invitación';
  const descripcion =
    `${tipo} de ${nombre}. ` +
    'Confirmá tu asistencia y encontrá todos los detalles del evento en esta invitación digital.';

  return {
    title: `${tipo} de ${nombre} · Invitación`,
    description: descripcion,
    robots: { index: false, follow: true },
    alternates: { canonical: urlPublicaInvitacion(slug) },
    openGraph: {
      title: `${tipo} de ${nombre}`,
      description: descripcion,
      type: 'website',
      locale: 'es_UY',
      siteName: 'Miluaistudio · Invitaciones digitales',
      url: urlPublicaInvitacion(slug),
    },
    twitter: {
      card: 'summary',
      title: `${tipo} de ${nombre}`,
      description: descripcion,
    },
  };
}

export default async function PaginaInvitacionPublicada({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const invitacion = leerInvitacionPublicada(slug);

  // Seguridad de consistencia: el slug del archivo debe coincidir con la
  // ruta servida (verify-export además detecta este desfase en el build).
  if (!invitacion || invitacion.slug !== slug) notFound();

  return (
    <ConfigProvider config={invitacion.config}>
      <InvitationExperience />
    </ConfigProvider>
  );
}
