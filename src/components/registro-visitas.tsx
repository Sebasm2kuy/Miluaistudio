'use client';

// ============================================================
// REGISTRO DE VISITAS — componente invisible montado en el layout raíz
// (iteración 042 — panel del estudio /estudio/)
// ------------------------------------------------------------
// En cada página pública medible envía UNA fila 'visita' al backend de
// Apps Script y un 'latido' cada 60 s mientras la pestaña esté visible
// (para el estimado de personas online). Fire-and-forget: nunca bloquea
// el render, nunca lanza, nunca muestra nada. En rutas operativas
// (/dashboard/, /editar/, /estudio/, /previsualizar/, /acceso/) no hace
// NADA: el tráfico del propio estudio no infl las métricas.
//
// Privacidad: sin cookies, sin IP, sin fingerprinting — solo un id
// aleatorio de pestaña (sessionStorage) y dos banderas locales
// (localStorage) sin datos personales. Ver src/lib/metricas-visitas.ts.
// ============================================================

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  construirPayload,
  decidirMarcas,
  enviarRegistroMetrica,
  esRutaMedible,
  obtenerIdSesion,
} from '@/lib/metricas-visitas';
import { diaMontevideo } from '@/data/metricas-esquema';
import { ENDPOINT_REGISTRO } from '@/data/registro-auto';

const INTERVALO_LATIDO_MS = 60000;

/** Generador del id de sesión: 16 bytes aleatorios en hex. */
function generarIdSesion(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return hex;
}

/** Almacenes del navegador (inyectados aquí; las lib son puras). */
function almacenSesion(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

function almacenLocal(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export default function RegistroVisitas() {
  const pathname = usePathname();
  const enviadoPara = useRef<string>('');

  useEffect(() => {
    if (!pathname || !esRutaMedible(pathname)) return;
    const sesion = almacenSesion();
    const local = almacenLocal();
    if (!sesion || !local) return;
    if (!ENDPOINT_REGISTRO) return;
    if (enviadoPara.current === pathname) return;
    enviadoPara.current = pathname;

    const sesionId = obtenerIdSesion(sesion, generarIdSesion);
    const marcas = decidirMarcas(local, diaMontevideo(new Date()));
    const payload = construirPayload('visita', {
      pagina: pathname,
      sesion: sesionId,
      nuevaSesionDia: marcas.nuevaSesionDia,
      nuevoVisitante: marcas.nuevoVisitante,
    });

    let backendActivo = true;

    // Visita inicial (fire-and-forget: el resultado nunca afecta al usuario).
    void enviarRegistroMetrica(ENDPOINT_REGISTRO, payload).then((resultado) => {
      if (resultado === 'sin-backend') backendActivo = false;
    });

    // Latido cada 60 s SOLO mientras la pestaña está visible; al volver a
    // visible se manda un latido inmediato (regreso de pestaña en segundo plano).
    const latir = () => {
      if (document.visibilityState !== 'visible') return;
      if (!backendActivo) return;
      void enviarRegistroMetrica(
        ENDPOINT_REGISTRO,
        construirPayload('latido', {
          pagina: pathname,
          sesion: sesionId,
          nuevaSesionDia: false,
          nuevoVisitante: false,
        }),
      );
    };

    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') latir();
    };

    const intervalo = window.setInterval(latir, INTERVALO_LATIDO_MS);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    latir(); // primer latido inmediato: marca la pestaña como online ya mismo

    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
  }, [pathname]);

  return null;
}
