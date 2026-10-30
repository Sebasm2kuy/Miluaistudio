import type { Metadata } from 'next';
import PersonalizadorApp from '@/components/personalizador-app';

export const metadata: Metadata = {
  /* El template del layout ya agrega "| Lumen Gala"; no repetir la marca acá
     (antes renderizaba "…| Lumen Gala | Lumen Gala"). */
  title: 'Personalizá tu invitación',
  description:
    'Elegí un diseño, cargá tus datos y mirá tu invitación digital en vivo: cuenta regresiva, música, galería y confirmación de asistencia con tu nombre y tu fecha. XV años, bodas y más, en Uruguay.',
  alternates: { canonical: 'https://lumengala.site/personalizar/' },
  keywords: ['personalizar invitación digital', 'invitación interactiva', 'Lumen Gala', 'fiestas de 15', 'bodas Uruguay'],
  openGraph: {
    title: 'Personalizá tu invitación digital · Lumen Gala',
    description:
      'Elegí un diseño, cargá tus datos y mirá tu invitación en vivo antes de comprar. XV años, bodas y celebraciones.',
    type: 'website',
    locale: 'es_UY',
    siteName: 'Lumen Gala · Invitaciones digitales',
    url: 'https://lumengala.site/personalizar/',
  },
};

export default function PersonalizarPage() {
  return <PersonalizadorApp />;
}
