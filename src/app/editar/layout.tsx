import type { Metadata } from 'next';

/**
 * /editar — editor móvil visual (publicado desde la iteración 017).
 *
 * Es la forma en que el anfitrión edita la invitación desde el teléfono
 * contra el sitio real. La ruta lleva noindex y no contiene secretos ni
 * datos privados: toda acción que modifica el sitio (cargar por slug,
 * publicar, subir fotos) exige el GitHub token del propietario. A
 * diferencia de /admin (poda del export), esta ruta SÍ se publica y
 * scripts/verify-export.mjs exige su presencia en el artefacto.
 */

export const metadata: Metadata = {
  title: 'Editor móvil',
  description: 'Editor visual de la invitación desde el teléfono (requiere token para publicar).',
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
