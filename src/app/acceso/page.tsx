'use client';

// ============================================================
// /acceso — Login del panel de cliente (estética de alta gama:
// fondo charcoal, acentos dorados).
// ------------------------------------------------------------
// Verifica email + contraseña contra content/clientes.json (lectura
// anónima de repo público) con PBKDF2 en el navegador (WebCrypto).
// Al ingresar crea la sesión (sessionStorage, 8 h) y entra a /dashboard.
// El alta de cuentas NO es auto-servicio: la hace el estudio
// (scripts/alta-cliente.mjs); acá solo se ofrece WhatsApp.
// ============================================================

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { RUTA_CLIENTES, type ColeccionClientes } from '@/data/clientes-esquema';
import { iniciarSesion } from '@/lib/auth-cliente';
import { leerJSON } from '@/lib/github-db';
import { whatsappLink } from '@/data/contacto';

type Estado = 'idle' | 'verificando' | 'ingresando';

export default function PaginaAcceso() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [estado, setEstado] = useState<Estado>('idle');
  const [error, setError] = useState('');
  const [bloqueadaMinutos, setBloqueadaMinutos] = useState(0);

  const ocupado = estado !== 'idle';

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
