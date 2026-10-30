import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, PenLine } from 'lucide-react';
import InvitationExperience from '@/components/invitation-experience';
import { INVITATION_DESIGNS } from '@/data/invitation-designs';
import { createDemoConfig } from '@/data/demo-config';
import { ConfigProvider } from '@/hooks/useConfig';

export const dynamicParams = false;

export function generateStaticParams() {
  return INVITATION_DESIGNS.map((design) => ({ designId: design.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ designId: string }>;
}): Promise<Metadata> {
  const { designId } = await params;
  const design = INVITATION_DESIGNS.find((item) => item.id === designId);

  if (!design) return { title: 'Diseño no encontrado | Lumen Gala' };

  return {
    title: `${design.name} | Invitación de demostración · Lumen Gala`,
    description: `${design.description} Explorá una invitación digital de muestra y consultá opciones de personalización.`,
    keywords: ['invitación digital', 'invitaciones interactivas', 'Lumen Gala', 'fiestas de 15', 'bodas'],
    robots: { index: false, follow: true },
    openGraph: {
      title: `${design.name} · Lumen Gala`,
      description: design.description,
      type: 'website',
      locale: 'es_UY',
      siteName: 'Lumen Gala · Invitaciones digitales',
      url: `https://lumengala.site/catalogo/${design.id}/`,
      images: [{ url: 'https://lumengala.site/lgs-preview.jpg', width: 1200, height: 630, alt: 'Invitación de demostración de Lumen Gala' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${design.name} · Lumen Gala`,
      description: design.description,
      images: ['https://lumengala.site/lgs-preview.jpg'],
    },
  };
}

export default async function InvitationDemoPage({
  params,
}: {
  params: Promise<{ designId: string }>;
}) {
  const { designId } = await params;
  const design = INVITATION_DESIGNS.find((item) => item.id === designId);

  if (!design) notFound();

  const safeConfig = createDemoConfig(design);

  return (
    <ConfigProvider config={safeConfig}>
      <>
        <InvitationExperience />
        <a
          href="/catalogo/"
          className="fixed left-3 top-3 z-[9999] inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/75 px-3 py-2 text-xs font-medium text-white/90 shadow-lg backdrop-blur-md transition hover:border-white/40 hover:bg-black/90 sm:left-5 sm:top-5 sm:px-4 sm:py-2.5 sm:text-sm"
          aria-label="Volver al catálogo de diseños"
        >
          <ArrowLeft size={15} />
          Volver al catálogo
        </a>
        <a
          href={'/personalizar/?diseno=' + designId}
          className="fixed right-3 top-3 z-[9999] inline-flex items-center gap-2 rounded-full border border-[#f1a46a]/50 bg-[#17191d]/85 px-3 py-2 text-xs font-semibold text-[#f6c78f] shadow-lg backdrop-blur-md transition hover:border-[#f1a46a] hover:bg-[#17191d] sm:right-5 sm:top-5 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <PenLine size={14} />
          Personalizar este diseño
        </a>
      </>
    </ConfigProvider>
  );
}
