import type { Metadata } from 'next';
import PersonalizadorApp from '@/components/personalizador-app';

export const metadata: Metadata = {
  /* El template del layout ya agrega "| Miluaistudio"; no repetir la marca acá
     (antes renderizaba "…| Miluaistudio | Miluaistudio"). */
  title: 'Personalizá tu invitación',
  description:
    'Elegí un diseño, cargá tus datos y mirá tu invitación digital en vivo: cuenta regresiva, música, galería y confirmación de asistencia con tu nombre y tu fecha. XV años, bodas y más, en Uruguay.',
  alternates: { canonical: 'https://sebasm2kuy.github.io/Miluaistudio/personalizar/' },
  keywords: ['personalizar invitación digital', 'invitación interactiva', 'Miluaistudio', 'fiestas de 15', 'bodas Uruguay'],
  openGraph: {
    title: 'Personalizá tu invitación digital · Miluaistudio',
    description:
      'Elegí un diseño, cargá tus datos y mirá tu invitación en vivo antes de comprar. XV años, bodas y celebraciones.',
    type: 'website',
    locale: 'es_UY',
    siteName: 'Miluaistudio · Invitaciones digitales',
    url: 'https://sebasm2kuy.github.io/Miluaistudio/personalizar/',
  },
};

export default function PersonalizarPage() {
  return <PersonalizadorApp />;
}
