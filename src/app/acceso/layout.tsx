import type { Metadata } from 'next';

/**
 * /acceso — Login del panel de cliente.
 *
 * Zona privada: noindex (área operativa, no comercial). La página en sí
 * es un componente cliente (form + WebCrypto); el layout solo aporta la
 * metadata y el fondo oscuro de marca.
 */
export const metadata: Metadata = {
  /* title.absolute: evita que el template raíz duplique la marca
     («…| Lumen Gala | Lumen Gala Studio»). */
  title: { absolute: 'Acceso clientes | Lumen Gala' },
  description: 'Panel privado para gestionar tu invitación web de Lumen Gala Studio.',
  robots: { index: false, follow: false },
  /* Zona privada: sin canonical (no heredar el «/» del layout raíz, 032). */
  alternates: { canonical: null },
};

export default function AccesoLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#131009]">{children}</div>;
}
