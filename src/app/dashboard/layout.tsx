import type { Metadata } from 'next';
import GuardiaDashboard from './guardia';

/**
 * /dashboard — Panel privado del cliente.
 *
 * Layout servidor: solo aporta metadata noindex (zona operativa) y
 * monta la guardia cliente. En un export estático no hay middleware de
 * servidor: la protección de rutas es client-side (leerSesion() +
 * redirección a /acceso/). El panel es de SOLO LECTURA para el cliente:
 * sin campos de token ni ajustes de desarrollo en ninguna pestaña (038);
 * los cambios los publica el estudio y las confirmaciones entran por el
 * formulario de la invitación (backend del registro automático).
 */
export const metadata: Metadata = {
  title: { absolute: 'Panel de cliente | Lumen Gala' },
  description: 'Gestión de tu invitación web: estado, datos del evento y confirmaciones.',
  robots: { index: false, follow: false },
  /* Zona privada: sin canonical (no heredar el «/» del layout raíz, 032). */
  alternates: { canonical: null },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <GuardiaDashboard>{children}</GuardiaDashboard>;
}
