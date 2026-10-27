import type { Metadata } from 'next';

/**
 * /editar — editor móvil visual (herramienta LOCAL, nunca publicada).
 *
 * Igual que /admin: el build de producción elimina esta ruta del
 * artefacto estático (scripts/prune-export.mjs) y scripts/verify-export.mjs
 * falla si reaparece, porque GitHub Pages no ofrece autenticación y un
 * editor público no puede considerarse protegido.
 */

export const metadata: Metadata = {
  title: 'Editor móvil',
  description: 'Editor visual de la invitación desde el teléfono. Herramienta local.',
  robots: { index: false, follow: false },
};

/**
 * Nota: a diferencia de /admin, acá NO se muta <html>/<body> con un script
 * bloqueante: hacerlo antes de la hidratación genera un desajuste de
 * atributos (className/estilos) que la consola reporta como issue. El
 * editor pinta su propio fondo en la raíz de la página y los ajustes de
 * overflow los hace la página tras montar (src/app/editar/page.tsx).
 */
export default function EditarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
