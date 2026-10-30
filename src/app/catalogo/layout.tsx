import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invitaciones digitales personalizadas',
  description: 'Explorá invitaciones digitales interactivas para fiestas de 15, bodas y celebraciones. Elegí un diseño y consultá las opciones de personalización.',
  // The public storefront must be discoverable. Individual demo pages may
  // remain noindex until each template has finalized commercial content.
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://lumengala.site/catalogo/' },
  openGraph: {
    title: 'Invitaciones digitales personalizadas | Lumen Gala',
    description: 'Diseños web personalizados para compartir los detalles de tu celebración en un solo enlace.',
    type: 'website',
    locale: 'es_UY',
    siteName: 'Lumen Gala · Invitaciones digitales',
    url: 'https://lumengala.site/catalogo/',
    images: [
      {
        url: 'https://lumengala.site/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Invitación digital de demostración de Lumen Gala',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invitaciones digitales personalizadas | Lumen Gala',
    description: 'Explorá diseños web personalizados para tus celebraciones.',
    images: ['https://lumengala.site/og-image.jpg'],
  },
};

export default function CatalogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
