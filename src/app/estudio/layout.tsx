import type { Metadata } from 'next';

/**
 * /estudio — Panel de administración del estudio (métricas + clientes).
 *
 * Layout servidor: solo aporta metadata noindex (zona operativa) y deja
 * el resto a la página cliente (control de acceso con Google +
 * fail-closed, ver src/app/estudio/page.tsx). La ruta está publicada
 * (igual que /dashboard/) porque no contiene secretos ni escrituras:
 * toda la protección es de identidad, y los datos de tráfico solo se
 * entregan desde el backend verificado del estudio.
 */
export const metadata: Metadata = {
  title: { absolute: 'Panel del estudio | Lumen Gala' },
  description: 'Métricas del sitio y gestión de clientes de Lumen Gala Studio.',
  robots: { index: false, follow: false },
  /* Zona privada: sin canonical (no heredar el «/» del layout raíz, 032). */
  alternates: { canonical: null },
};

export default function EstudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
