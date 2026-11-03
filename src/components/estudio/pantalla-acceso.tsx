'use client';

// ============================================================
// PANTALLA DE ACCESO DEL PANEL DEL ESTUDIO (/estudio/) — 042
// ------------------------------------------------------------
// Puerta del panel de administración: solo el botón oficial de Google
// y los mensajes de bloqueo. No hay formulario de contraseña acá: la
// cuenta del estudio entra SIEMPRE por Google (identidad verificable
// por el backend con tokeninfo).
//  - El widget de Google se monta igual que en /acceso/ (script único
//    con id propio; renderButton sobre un contenedor siempre presente).
//  - Con un email ajeno: pantalla «Acceso restringido» (fail-closed,
//    sin ningún dato del panel).
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { GOOGLE_CLIENT_ID } from '@/data/acceso-google';

const ID_SCRIPT_GOOGLE = 'lgs-gsi-script-estudio';
let widgetYaIniciado = false;

/** Motivos de bloqueo → mensaje honesto (sin filtrar nada del panel). */
export const MENSAJES_BLOQUEO: Record<string, string> = {
  formato: 'La credencial de Google no se pudo leer. Probá de nuevo.',
  audiencia: 'La credencial no corresponde a este sitio. Ingresá desde https://lumengala.site/estudio/.',
  emisor: 'La credencial no fue emitida por Google. Probá de nuevo.',
  expirado: 'La sesión de Google venció. Volvé a ingresar.',
  'sin-verificar': 'Tu cuenta de Google todavía no tiene el email verificado. Verificalo en Google y volvé a intentar.',
  email: 'Acceso restringido: este panel es exclusivo de la cuenta del estudio.',
};

export function PantallaAcceso({
  onCredencial,
  ocupado,
  errorPrevio,
}: {
  onCredencial: (credencial: string) => void;
  ocupado: boolean;
  errorPrevio?: string;
}) {
  const contenedorGoogle = useRef<HTMLDivElement>(null);
  const [googleListo, setGoogleListo] = useState(false);
  const [googleFallado, setGoogleFallado] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const iniciarWidget = () => {
      const api = (window as unknown as { google?: { accounts?: { id?: { initialize: (o: object) => void; renderButton: (el: HTMLElement, o: object) => void } } } }).google?.accounts?.id;
      const destino = contenedorGoogle.current;
      if (!api || !destino || widgetYaIniciado) return;
      widgetYaIniciado = true;
      try {
        api.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (respuesta: { credential?: string }) => {
            if (respuesta?.credential) onCredencial(respuesta.credential);
          },
        });
        api.renderButton(destino, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          locale: 'es-419',
        });
        setGoogleListo(true);
      } catch {
        setGoogleFallado(true);
      }
    };

    const yaCargado = document.getElementById(ID_SCRIPT_GOOGLE);
    if (yaCargado) {
      iniciarWidget();
      return;
    }
    const script = document.createElement('script');
    script.id = ID_SCRIPT_GOOGLE;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = iniciarWidget;
    script.onerror = () => setGoogleFallado(true);
    document.head.appendChild(script);
  }, [onCredencial]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(120%_120%_at_50%_0%,#ffffff_0%,#faf8f4_55%,#f3ead9_100%)] px-4 py-10 text-[#292522]">
      <main className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img
            src="/logo-lgs.png"
            alt="Isotipo de Lumen Gala Studio"
            width={72}
            height={72}
            className="mx-auto h-18 w-18 rounded-2xl object-cover shadow-[0_10px_30px_rgba(138,101,52,0.14)] ring-1 ring-[#dfc9a4]"
          />
          <h1 className="mt-4 font-serif text-2xl tracking-[0.14em] text-[#292522]">LUMEN GALA</h1>
          <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-[#716a63]">Panel del estudio</p>
          <p className="mt-3 text-xs leading-relaxed text-[#716a63]">
            Métricas del sitio y gestión de clientes. Acceso exclusivo con la cuenta de Google del estudio.
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8e0d7] bg-white p-6 shadow-[0_20px_60px_rgba(88,63,32,0.14)]">
          {GOOGLE_CLIENT_ID && !googleFallado ? (
            <>
              <div className={googleListo ? '' : 'h-10 overflow-hidden'} aria-hidden={!googleListo}>
                <div ref={contenedorGoogle} className="flex justify-center" />
              </div>
              {ocupado && (
                <p className="mt-3 flex items-center justify-center gap-2 text-xs text-[#716a63]" role="status">
                  <Loader2 size={14} className="animate-spin" /> Verificando tu identidad…
                </p>
              )}
            </>
          ) : (
            <p className="text-xs leading-relaxed text-[#716a63]">
              {GOOGLE_CLIENT_ID
                ? 'No se pudo cargar el botón de Google (¿sin conexión a Google?). Probá recargando la página.'
                : 'El panel no está configurado: falta el Client ID de Google en el sitio.'}
            </p>
          )}

          {errorPrevio && (
            <p role="alert" className="mt-4 rounded-xl border border-[#efc3b7] bg-[#fcefec] px-3 py-2.5 text-xs leading-relaxed text-[#b42318]">
              {errorPrevio}
            </p>
          )}

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#e8e0d7] bg-[#faf8f4] px-3 py-2.5 text-[11px] leading-relaxed text-[#716a63]">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#8a6534]" />
            <span>
              La identidad se verifica en el navegador y otra vez en el servidor del estudio (tokeninfo de Google).
              La sesión dura lo mismo que tu ingreso de Google.
            </span>
          </div>
        </div>

        <a href="/" className="mt-6 block text-center text-[11px] text-[#787168] transition hover:text-[#54483e]">
          ← Volver al sitio
        </a>
      </main>
    </div>
  );
}

/** Pantalla de bloqueo: email ajeno o credencial inválida (sin datos del panel). */
export function PantallaBloqueado({ motivo, onVolver }: { motivo: string; onVolver: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(120%_120%_at_50%_0%,#ffffff_0%,#faf8f4_55%,#f3ead9_100%)] px-4 py-10 text-[#292522]">
      <main className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#efc3b7] bg-[#fcefec]">
          <Lock size={26} className="text-[#b42318]" />
        </div>
        <h1 className="mt-4 font-serif text-xl text-[#292522]">Acceso restringido</h1>
        <p className="mt-2 text-xs leading-relaxed text-[#716a63]" role="alert">
          {MENSAJES_BLOQUEO[motivo] || MENSAJES_BLOQUEO.email}
        </p>
        <button
          type="button"
          onClick={onVolver}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#26221d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d3830]"
        >
          Volver a intentar
        </button>
        <a href="/" className="mt-4 block text-[11px] text-[#787168] transition hover:text-[#54483e]">
          ← Volver al sitio
        </a>
      </main>
    </div>
  );
}
