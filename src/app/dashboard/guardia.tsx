'use client';

// ============================================================
// GUARDIA + CASCA DEL PANEL DE CLIENTE (/dashboard/*)
// ------------------------------------------------------------
// En un export estático (GitHub Pages) no existe middleware de
// servidor: la protección de /dashboard/* es client-side. Esta
// guardia lee la sesión (sessionStorage, expira en 8 h) y redirige
// a /acceso/ si no hay sesión válida. La superficie de riesgo es
// baja por diseño: sin sesión solo se ven esqueletos; toda escritura
// real exige el token de GitHub de la conexión del panel.
// ============================================================

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, PenLine, ShieldCheck, Users, LayoutGrid } from 'lucide-react';
import { cerrarSesion, leerSesion, type SesionCliente } from '@/lib/auth-cliente';
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
      <div className="min-h-screen bg-[#131009] px-4 py-10 text-[#f0e8da]">
        <div className="mx-auto max-w-3xl">
          <Esqueleto className="h-10 w-56" />
          <Esqueleto className="mt-6 h-28" />
          <Esqueleto className="mt-4 h-40" />
          <p className="mt-6 flex items-center gap-2 text-xs text-[#8a7d67]">
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
      <div className="flex min-h-screen flex-col bg-[#131009] text-[#f0e8da]">
        {/* Barra superior */}
        <header className="sticky top-0 z-40 border-b border-[#3a3226] bg-[#131009]/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <Link href="/dashboard/" className="flex items-center gap-2.5">
              <img
                src="/logo-lgs.png"
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 rounded-lg object-cover ring-1 ring-[#d4b465]/40"
              />
              <span>
                <span className="block font-serif text-sm tracking-[0.14em]">LUMEN GALA</span>
                <span className="block text-[10px] uppercase tracking-[0.22em] text-[#8a7d67]">
                  Panel de cliente
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-[#b3a68f] sm:block">{sesion.nombre}</span>
              <button
                type="button"
                onClick={salir}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#3a3226] px-2.5 py-1.5 text-xs text-[#d8cbb2] transition hover:border-[#57503f] hover:bg-[#262017]"
              >
                <LogOut size={13} /> Salir
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
                    ? 'border-[#d4b465] text-[#d4b465]'
                    : 'border-transparent text-[#b3a68f] hover:text-[#f0e8da]'
                }`}
              >
                <Icono size={14} /> {etiqueta}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        <footer className="border-t border-[#3a3226] px-4 py-4 text-center text-[10px] text-[#8a7d67]">
          Lumen Gala Studio · invitación “{sesion.slug}” · sesión con expiración automática
        </footer>
      </div>
    </ContextoSesion.Provider>
  );
}
