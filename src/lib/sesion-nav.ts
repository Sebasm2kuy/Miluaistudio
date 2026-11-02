// ============================================================
// ESTADO DEL BOTÓN DE SESIÓN EN LA NAVEGACIÓN PÚBLICA (040)
// ------------------------------------------------------------
// Mapeo puro sesión → botón de las barras superiores del sitio
// público (portada y catálogo):
//  - Sin sesión: «Iniciar sesión» → /acceso/.
//  - Con sesión: nombre del cliente → /dashboard/ (el enlace NO
//    cierra la sesión: cerrar es la acción explícita «Salir» del
//    panel, igual que «Volver a la web» de la iteración 039).
// Función pura y sin React: se prueba con node --test.
// ============================================================

import type { SesionCliente } from './auth-cliente';

export interface EstadoBotonSesion {
  /** true si hay sesión activa en esta pestaña. */
  conSesion: boolean;
  /** Texto visible del botón. */
  texto: string;
  /** Destino del enlace. */
  destino: string;
  /** Etiqueta de accesibilidad. */
  ariaLabel: string;
}

/**
 * Estado del botón según la sesión de la pestaña. Con sesión el texto es
 * el nombre registrado; si el nombre viniera vacío, recae en el email
 * (nunca un botón en blanco).
 */
export function estadoBotonSesion(sesion: SesionCliente | null): EstadoBotonSesion {
  if (!sesion) {
    return {
      conSesion: false,
      texto: 'Iniciar sesión',
      destino: '/acceso/',
      ariaLabel: 'Iniciar sesión',
    };
  }
  const nombre = String(sesion.nombre || '').trim() || sesion.email;
  return {
    conSesion: true,
    texto: nombre,
    destino: '/dashboard/',
    ariaLabel: 'Panel de ' + nombre,
  };
}
