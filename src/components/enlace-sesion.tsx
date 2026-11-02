'use client';

// ============================================================
// BOTÓN DE SESIÓN EN LA NAVEGACIÓN PÚBLICA (iteración 040)
// ------------------------------------------------------------
// Reemplaza el botón estático «Panel de clientes» (033/039) por
// uno consciente de la sesión de la pestaña:
//  - Sin sesión: «Iniciar sesión» → /acceso/.
//  - Con sesión: el NOMBRE del cliente → /dashboard/, sin cerrarla
//    (mismo contrato que «Volver a la web» del panel: cerrar la
//    sesión es la acción explícita «Salir»).
// La sesión vive en sessionStorage con la MISMA clave que la
// guardia del panel (lgs_sesion_cliente): quien abre la web en
// otra pestaña ve «Iniciar sesión» de nuevo, igual que el panel,
// que también pide login en cada pestaña.
// SSR-safe: el HTML estático del export siempre dice «Iniciar
// sesión»; el nombre se resuelve al montar, cuando sessionStorage
// ya existe en el navegador.
// ============================================================

import { useEffect, useState } from 'react';
import { LogIn, UserRound } from 'lucide-react';
import { leerSesion, type SesionCliente } from '@/lib/auth-cliente';
import { estadoBotonSesion } from '@/lib/sesion-nav';

/**
 * Sesión activa EN ESTA PESTAÑA (null si no hay o expiró). Se lee tras el
 * montaje —en el export estático sessionStorage no existe en el servidor—
 * y se relee al restaurar la página (botón atrás / bfcache) para no
 * mostrar un estado viejo.
 */
export function useSesionPublica(): SesionCliente | null {
  const [sesion, setSesion] = useState<SesionCliente | null>(null);

  useEffect(() => {
    const sincronizar = () => setSesion(leerSesion());
    // bfcache: al volver con «atrás» la página se restaura sin remontar.
    window.addEventListener('pageshow', sincronizar);
    // Lectura de sessionStorage (sistema externo): solo posible tras el montaje.
    sincronizar();
    return () => window.removeEventListener('pageshow', sincronizar);
  }, []);

  return sesion;
}

interface PropsEnlaceSesion {
  /** Clases del enlace sin sesión (estado «Iniciar sesión»). */
  classNameInvitado: string;
  /** Clases con sesión activa; si falta, reutiliza classNameInvitado. */
  classNameSesion?: string;
}

/**
 * Enlace de sesión para barras superiores del sitio público. Icono siempre
 * visible; texto desde sm, con elipsis si el nombre es largo.
 */
export default function EnlaceSesionNavbar({ classNameInvitado, classNameSesion }: PropsEnlaceSesion) {
  const sesion = useSesionPublica();
  const boton = estadoBotonSesion(sesion);

  if (!boton.conSesion) {
    return (
      <a href={boton.destino} aria-label={boton.ariaLabel} className={classNameInvitado}>
        <LogIn size={16} />
        <span className="hidden sm:inline">{boton.texto}</span>
      </a>
    );
  }

  return (
    <a
      href={boton.destino}
      aria-label={boton.ariaLabel}
      title={'Sesión de ' + boton.texto}
      className={classNameSesion ?? classNameInvitado}
    >
      <UserRound size={16} />
      <span className="hidden max-w-[9rem] truncate sm:inline">{boton.texto}</span>
    </a>
  );
}
