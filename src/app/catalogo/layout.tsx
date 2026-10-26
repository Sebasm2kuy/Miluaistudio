import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invitaciones digitales personalizadas | Miluaistudio',
  description: 'Explorá invitaciones digitales interactivas para fiestas de 15, bodas y celebraciones. Elegí un diseño y consultá las opciones de personalización.',
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Invitaciones digitales personalizadas | Miluaistudio',
    description: 'Diseños web personalizados para compartir los detalles de tu celebración en un solo enlace.',
    type: 'website',
    locale: 'es_UY',
    siteName: 'Miluaistudio · Invitaciones digitales',
    url: 'https://sebasm2kuy.github.io/Miluaistudio/catalogo/',
    images: [
      {
        url: 'https://sebasm2kuy.github.io/Miluaistudio/catalogo/demo-cover.svg',
        width: 900,
        height: 1200,
        alt: 'Invitación digital de demostración de Miluaistudio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invitaciones digitales personalizadas | Miluaistudio',
    description: 'Explorá diseños web personalizados para tus celebraciones.',
    images: ['https://sebasm2kuy.github.io/Miluaistudio/catalogo/demo-cover.svg'],
  },
};

export default function CatalogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
