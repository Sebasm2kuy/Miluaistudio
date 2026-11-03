'use client';

// ============================================================
// GUARDIA + CASCA DEL PANEL DE CLIENTE (/dashboard/*)
// ------------------------------------------------------------
// En un export estático (GitHub Pages) no existe middleware de
// servidor: la protección de /dashboard/* es client-side. Esta
// guardia lee la sesión (sessionStorage, expira en 8 h) y redirige
// a /acceso/ si no hay sesión válida. La superficie de riesgo es
// baja por diseño: sin sesión solo se ven esqueletos; el panel es de
// solo lectura para el cliente (sin token ni escrituras directas, 038).
// Cáscara con la MISMA paleta clara de la web pública (041) y el
// «Volver a la web» como botón primario: el camino de vuelta es lo
// primero que un cliente nuevo debe encontrar.
// ============================================================

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, LogOut, PenLine, ShieldCheck, Sparkles, Users, LayoutGrid } from 'lucide-react';
import { cerrarSesion, leerSesion, type SesionCliente } from '@/lib/auth-cliente';
import { esEmailDelEstudio } from '@/lib/admin-auth';
import { Esqueleto } from '@/components/dashboard/ui';

const ContextoSesion = createContext<SesionCliente | null>(null);

/** Sesión activa del panel (lanza si se usa fuera de la guardia). */
export function useSesionCliente(): SesionCliente {
  const sesion = useContext(ContextoSesion);
  if (!sesion) throw new Error('useSesionCliente debe usarse dentro del panel (/dashboard).');
  return sesion;
}

const PESTANAS = [
  { href: '/dashboard/', etiqueta: 'Resumen', icono: LayoutGrid },
  { href: '/dashboard/editar/', etiqueta: 'Mi invitación', icono: PenLine },
  { href: '/dashboard/confirmaciones/', etiqueta: 'Confirmaciones', icono: Users },
] as const;

export default function GuardiaDashboard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const ruta = usePathname();
  const [sesion, setSesion] = useState<SesionCliente | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const activa = leerSesion();
    if (!activa) {
      router.replace('/acceso/');
      return;
    }
    // Sincronización con sessionStorage (sistema externo): solo posible tras el montaje.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSesion(activa);
     
    setVerificando(false);
  }, [router]);

  function salir() {
    cerrarSesion();
    router.replace('/acceso/');
  }

  if (verificando) {
    return (
      <div className="min-h-screen bg-[#faf8f4] px-4 py-10 text-[#292522]">
        <div className="mx-auto max-w-3xl">
          <Esqueleto className="h-10 w-56" />
          <Esqueleto className="mt-6 h-28" />
          <Esqueleto className="mt-4 h-40" />
          <p className="mt-6 flex items-center gap-2 text-xs text-[#787168]">
            <ShieldCheck size={14} /> Verificando tu sesión…
          </p>
        </div>
      </div>
    );
  }

  if (!sesion) return null; // redirección en curso

  const esActiva = (href: string) => ruta === href || ruta === href.slice(0, -1);

  return (
    <ContextoSesion.Provider value={sesion}>
      <div className="flex min-h-screen flex-col bg-[#faf8f4] text-[#292522]">
        {/* Barra superior */}
        <header className="sticky top-0 z-40 border-b border-[#e8e0d7] bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6">
            <Link href="/dashboard/" className="flex shrink-0 items-center gap-2.5">
              <img
                src="/logo-lgs.png"
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 rounded-lg object-cover ring-1 ring-[#dfc9a4]"
              />
              <span>
                <span className="block font-serif text-sm tracking-[0.14em]">LUMEN GALA</span>
                <span className="block text-[10px] uppercase tracking-[0.22em] text-[#787168]">
                  Panel de cliente
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Volver a la web (041): botón PRIMARIO, grande y primero —
                  el camino de vuelta a la web es lo más importante para
                  alguien que entra por primera vez. Enlace común: NO
                  cierra la sesión (039), vive en sessionStorage de esta
                  pestaña y sigue activa al regresar por el botón con el
                  nombre (040). */}
              <Link
                href="/"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#26221d] px-3 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#3d3830] sm:px-5 sm:text-sm"
              >
                <Globe size={15} /> Volver a la web
              </Link>
              {/* Acceso directo al panel del estudio (043): SOLO para la sesión
                  con el email del estudio (visibilidad decidida por
                  esEmailDelEstudio; para cualquier otro cliente el enlace no se
                  renderiza). Es una comodidad de navegación, no una capa de
                  seguridad: /estudio/ sigue protegida por su propia puerta
                  fail-closed. Enlace común <Link>: no toca sessionStorage, así
                  que la sesión de cliente sigue viva al ir y volver, y la sesión
                  de administrador (≈1 h desde el ingreso Google, 042) se usa
                  intacta si sigue vigente — si venció, /estudio/ pide la cuenta
                  de nuevo, tal como sucede entrando por URL directa. */}
              {esEmailDelEstudio(sesion.email) && (
                <Link
                  href="/estudio/"
                  aria-label="Ir al panel del estudio"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e0d7] bg-white px-2.5 py-2.5 text-sm font-medium text-[#54483e] transition hover:border-[#dfc9a4] hover:bg-[#f6efe2] sm:px-3.5"
                >
                  <Sparkles size={15} />{' '}
                  <span className="hidden sm:inline">Panel del estudio</span>
                  <span className="sm:hidden">Estudio</span>
                </Link>
              )}
              <span className="hidden text-xs text-[#716a63] sm:block">{sesion.nombre}</span>
              <button
                type="button"
                onClick={salir}
                aria-label="Salir"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e0d7] bg-white px-3 py-2.5 text-sm font-medium text-[#54483e] transition hover:border-[#dfc9a4] hover:bg-[#f6efe2] sm:px-3.5"
              >
                <LogOut size={15} /> <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>

          {/* Pestañas de navegación del panel */}
          <nav aria-label="Secciones del panel" className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6">
            {PESTANAS.map(({ href, etiqueta, icono: Icono }) => (
              <Link
                key={href}
                href={href}
                aria-current={esActiva(href) ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition ${
                  esActiva(href)
                    ? 'border-[#8a6534] text-[#8a6534]'
                    : 'border-transparent text-[#716a63] hover:text-[#292522]'
                }`}
              >
                <Icono size={14} /> {etiqueta}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        <footer className="border-t border-[#e8e0d7] px-4 py-4 text-center text-[10px] text-[#787168]">
          Lumen Gala Studio · invitación “{sesion.slug}” · sesión con expiración automática
        </footer>
      </div>
    </ContextoSesion.Provider>
  );
}
