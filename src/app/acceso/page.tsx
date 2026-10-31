'use client';

// ============================================================
// /acceso — Login del panel de cliente (estética de alta gama:
// fondo charcoal, acentos dorados).
// ------------------------------------------------------------
// Dos vías de ingreso (iteración 034):
//  1. «Continuar con Google» (si hay GOOGLE_CLIENT_ID en
//     src/data/acceso-google.ts): identidad del widget oficial de
//     Google Identity Services; entra el email que ya existe como
//     cuenta en content/clientes.json. Si el email no tiene panel,
//     se ofrece WhatsApp (el alta sigue siendo del estudio).
//  2. Email + contraseña (PBKDF2 en el navegador, WebCrypto),
//     contra content/clientes.json (lectura anónima del repo).
// Al ingresar crea la sesión (sessionStorage, 8 h) y entra a /dashboard.
// El alta de cuentas NO es auto-servicio: la hace el estudio
// (scripts/alta-cliente.mjs); acá solo se ofrece WhatsApp.
// ============================================================

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { RUTA_CLIENTES, type ColeccionClientes } from '@/data/clientes-esquema';
import { iniciarSesion, iniciarSesionGoogle, decodificarPayloadJwt } from '@/lib/auth-cliente';
import { leerJSON } from '@/lib/github-db';
import { whatsappLink } from '@/data/contacto';
import { GOOGLE_CLIENT_ID } from '@/data/acceso-google';

type Estado = 'idle' | 'verificando' | 'ingresando';

/** Mínimo tipado del widget de Google Identity Services que usamos. */
interface GoogleIdApi {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (respuesta: { credential?: string }) => void;
      }): void;
      renderButton(parent: HTMLElement, opciones: Record<string, string>): void;
    };
  };
}
declare global {
  interface Window {
    google?: GoogleIdApi;
  }
}

const ID_SCRIPT_GOOGLE = 'lgs-gsi-script';

export default function PaginaAcceso() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [estado, setEstado] = useState<Estado>('idle');
  const [error, setError] = useState('');
  const [bloqueadaMinutos, setBloqueadaMinutos] = useState(0);

  // Google
  const [googleListo, setGoogleListo] = useState(false);
  const [googleOcupado, setGoogleOcupado] = useState(false);
  const [errorGoogle, setErrorGoogle] = useState('');
  const [sinCuenta, setSinCuenta] = useState<{ email: string; nombre: string } | null>(null);
  const contenedorGoogle = useRef<HTMLDivElement>(null);

  const ocupado = estado !== 'idle' || googleOcupado;

  const manejarCredencial = useCallback(
    async (credencial: string) => {
      setErrorGoogle('');
      setSinCuenta(null);
      if (!credencial) {
        setErrorGoogle('No se pudo completar el ingreso con Google. Probá de nuevo.');
        return;
      }
      const identidad = decodificarPayloadJwt(credencial);
      if (!identidad) {
        setErrorGoogle('No se pudo leer tu identidad de Google. Probá de nuevo.');
        return;
      }

      setGoogleOcupado(true);
      const lectura = await leerJSON<ColeccionClientes>(RUTA_CLIENTES);
      if (!lectura.ok) {
        setGoogleOcupado(false);
        setErrorGoogle('No se pudo conectar con el repositorio de cuentas. Probá de nuevo en unos segundos.');
        return;
      }

      const resultado = iniciarSesionGoogle(
        identidad.email,
        identidad.nombre,
        identidad.emailVerificado,
        lectura.data.cuentas,
      );
      setGoogleOcupado(false);

      if (resultado.ok) {
        router.replace('/dashboard/');
        return;
      }
      if (resultado.motivo === 'sin-cuenta') {
        setSinCuenta({ email: identidad.email.trim(), nombre: identidad.nombre.trim() });
        return;
      }
      if (resultado.motivo === 'email-sin-verificar') {
        setErrorGoogle('Tu cuenta de Google todavía no tiene el email verificado. Verificalo en Google y volvé a intentar.');
        return;
      }
      setErrorGoogle('No se pudo usar ese email de Google. Probá con tu contraseña.');
    },
    [router],
  );

  // Carga única del widget de Google (solo si hay Client ID configurado).
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const iniciarWidget = () => {
      const api = window.google?.accounts?.id;
      const destino = contenedorGoogle.current;
      if (!api || !destino) return;
      try {
        api.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (respuesta) => void manejarCredencial(respuesta?.credential ?? ''),
        });
        api.renderButton(destino, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          locale: 'es-419',
        });
        setGoogleListo(true);
      } catch {
        // Widget no disponible: el formulario de contraseña sigue funcionando.
        setGoogleListo(false);
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
    script.onerror = () => setGoogleListo(false); // sin red a Google: solo contraseña
    document.head.appendChild(script);
    // Deps estables: manejarCredencial es useCallback([router]) y GOOGLE_CLIENT_ID es constante.
  }, [manejarCredencial]);

  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    if (ocupado) return;
    setError('');
    setBloqueadaMinutos(0);
    setEstado('verificando');

    // 1. Leer la colección de cuentas (lectura pública del repo).
    const lectura = await leerJSON<ColeccionClientes>(RUTA_CLIENTES);
    if (!lectura.ok) {
      setEstado('idle');
      if (lectura.motivo === 'no-existe') {
        setError('Todavía no hay cuentas habilitadas. Escribinos por WhatsApp y te creamos el acceso.');
      } else {
        setError('No se pudo conectar con el repositorio de cuentas. Probá de nuevo en unos segundos.');
      }
      return;
    }

    // 2. Verificar credenciales y abrir sesión.
    setEstado('ingresando');
    const resultado = await iniciarSesion(email, password, lectura.data.cuentas);
    if (!resultado.ok) {
      setEstado('idle');
      setError(resultado.motivo);
      setBloqueadaMinutos(resultado.bloqueadaMinutos ?? 0);
      return;
    }

    router.replace('/dashboard/');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(120%_120%_at_50%_0%,#241d12_0%,#131009_55%,#0b0906_100%)] px-4 py-10 text-[#f0e8da]">
      <main className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* Isotipo oficial LGS */}
          <img
            src="/logo-lgs.png"
            alt="Isotipo de Lumen Gala Studio"
            width={72}
            height={72}
            className="mx-auto h-18 w-18 rounded-2xl object-cover shadow-[0_10px_30px_rgba(212,180,101,0.18)] ring-1 ring-[#d4b465]/40"
          />
          <h1 className="mt-4 font-serif text-2xl tracking-[0.14em] text-[#f0e8da]">LUMEN GALA</h1>
          <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-[#b3a68f]">Panel de clientes</p>
        </div>

        {/* Vía rápida: Google (solo con Client ID configurado y widget cargado) */}
        {GOOGLE_CLIENT_ID && googleListo && (
          <div className="mb-5">
            <div ref={contenedorGoogle} className="flex justify-center" />
            {googleOcupado && (
              <p className="mt-3 flex items-center justify-center gap-2 text-xs text-[#b3a68f]" role="status">
                <Loader2 size={14} className="animate-spin" /> Verificando tu identidad de Google…
              </p>
            )}
            {errorGoogle && (
              <p role="alert" className="mt-3 rounded-xl border border-[#7a4034] bg-[#3a201a] px-3 py-2.5 text-xs leading-relaxed text-[#f2b8ad]">
                {errorGoogle}
              </p>
            )}
            {sinCuenta && (
              <div className="mt-3 rounded-xl border border-[#4a4230] bg-[#262017] px-3 py-3 text-xs leading-relaxed text-[#d8cbb2]">
                <p>
                  Hola{sinCuenta.nombre ? ` ${sinCuenta.nombre}` : ''}: el email{' '}
                  <span className="font-semibold text-[#f0e8da]">{sinCuenta.email}</span> todavía no tiene un panel
                  asignado. Te lo activamos nosotros:
                </p>
                <a
                  href={whatsappLink(
                    `Hola! Soy ${sinCuenta.nombre || sinCuenta.email} (${sinCuenta.email}) y quiero activar mi panel de cliente de Lumen Gala.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 font-semibold text-[#d4b465] underline decoration-[#d4b465]/30 underline-offset-4 transition hover:text-[#e2c67c]"
                >
                  <MessageCircle size={14} /> Pedir mi acceso por WhatsApp
                </a>
              </div>
            )}
            <div className="my-5 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-[#3a3226]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8a7d67]">o con tu contraseña</span>
              <span className="h-px flex-1 bg-[#3a3226]" />
            </div>
          </div>
        )}

        <form
          onSubmit={alEnviar}
          className="rounded-2xl border border-[#3a3226] bg-[#1d1810] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        >
          <label htmlFor="email" className="block text-xs font-medium text-[#b3a68f]">
            Email
          </label>
          <div className="relative mt-1.5">
            <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7d67]" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={ocupado}
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-[#3a3226] bg-[#262017] py-2.5 pl-9 pr-3 text-sm text-[#f0e8da] placeholder-[#6f6552] outline-none transition focus:border-[#d4b465] disabled:opacity-60"
            />
          </div>

          <label htmlFor="password" className="mt-4 block text-xs font-medium text-[#b3a68f]">
            Contraseña
          </label>
          <div className="relative mt-1.5">
            <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7d67]" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={ocupado}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#3a3226] bg-[#262017] py-2.5 pl-9 pr-3 text-sm text-[#f0e8da] placeholder-[#6f6552] outline-none transition focus:border-[#d4b465] disabled:opacity-60"
            />
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-[#7a4034] bg-[#3a201a] px-3 py-2.5 text-xs leading-relaxed text-[#f2b8ad]">
              {error}
            </p>
          )}
          {bloqueadaMinutos > 0 && (
            <p className="mt-2 text-[11px] text-[#b3a68f]">
              Bloqueo temporal por intentos fallidos: {bloqueadaMinutos} min. Podés entrar con Google mientras tanto.
            </p>
          )}

          <button
            type="submit"
            disabled={ocupado}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4b465] px-4 py-3 text-sm font-semibold text-[#201a0e] transition hover:bg-[#e2c67c] disabled:cursor-wait disabled:opacity-70"
          >
            {ocupado ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verificando…
              </>
            ) : (
              <>
                <ShieldCheck size={16} /> Ingresar al panel
              </>
            )}
          </button>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-[#8a7d67]">
            Acceso exclusivo para clientes con invitación en producción.
          </p>
        </form>

        <div className="mt-6 text-center">
          <a
            href={whatsappLink('Hola! Quiero gestionar mi invitación de Lumen Gala y no tengo usuario todavía.')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#d4b465] underline decoration-[#d4b465]/30 underline-offset-4 transition hover:text-[#e2c67c]"
          >
            <MessageCircle size={14} /> No tengo cuenta — escribinos por WhatsApp
          </a>
          <a href="/" className="mt-3 block text-[11px] text-[#8a7d67] transition hover:text-[#b3a68f]">
            ← Volver al sitio
          </a>
        </div>
      </main>
    </div>
  );
}
