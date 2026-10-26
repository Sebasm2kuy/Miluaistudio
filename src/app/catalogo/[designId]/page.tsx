import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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

  if (!design) return { title: 'Diseño no encontrado | Miluaistudio' };

  return {
    title: `${design.name} | Invitación de demostración · Miluaistudio`,
    description: `${design.description} Explorá una invitación digital de muestra y consultá opciones de personalización.`,
    keywords: ['invitación digital', 'invitaciones interactivas', 'Miluaistudio', 'fiestas de 15', 'bodas'],
    robots: { index: false, follow: true },
    openGraph: {
      title: `${design.name} · Miluaistudio`,
      description: design.description,
      type: 'website',
      locale: 'es_UY',
      siteName: 'Miluaistudio · Invitaciones digitales',
      url: `https://sebasm2kuy.github.io/Miluaistudio/catalogo/${design.id}/`,
      images: [{ url: 'https://sebasm2kuy.github.io/Miluaistudio/catalogo/demo-cover.svg', width: 900, height: 1200, alt: 'Invitación de demostración de Miluaistudio' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${design.name} · Miluaistudio`,
      description: design.description,
      images: ['https://sebasm2kuy.github.io/Miluaistudio/catalogo/demo-cover.svg'],
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
      <InvitationExperience />
    </ConfigProvider>
  );
}
