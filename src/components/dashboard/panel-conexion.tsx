'use client';

// ============================================================
// CONEXIÓN CON GITHUB DEL PANEL DE CLIENTE
// ------------------------------------------------------------
// Para PUBLICAR cambios (commits automáticos) el navegador necesita
// un token de GitHub con permiso de contenido sobre el repositorio.
// Misma doctrina que /admin (iteración del panel de estudio):
//  - el token NO se guarda en localStorage, NI en el código, NI en
//    NEXT_PUBLIC_*: vive en sessionStorage y muere al cerrar la pestaña;
//  - se valida contra la API (GET /user) antes de habilitar acciones;
//  - se pide al estudio un token fine-grained limitado a este repo.
// ============================================================

import { useState } from 'react';
import { CloudOff, KeyRound, Loader2, PlugZap, X } from 'lucide-react';
import { Aviso, BotonPrincipal, BotonSecundario } from './ui';

export const CLAVE_TOKEN_GITHUB = 'lgs_token_github';

export function leerTokenGuardado(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(CLAVE_TOKEN_GITHUB) || '';
}

export function guardarToken(token: string): void {
  sessionStorage.setItem(CLAVE_TOKEN_GITHUB, token);
}

export function borrarToken(): void {
  sessionStorage.removeItem(CLAVE_TOKEN_GITHUB);
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/** Valida el token contra la API de GitHub; devuelve el login o null. */
export async function validarToken(
  token: string,
  fetchImpl: FetchLike = (input, init) => fetch(input, init),
): Promise<{ ok: true; login: string } | { ok: false; motivo: string }> {
  try {
    const res = await fetchImpl('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    });
    if (res.status === 401) return { ok: false, motivo: 'El token fue rechazado por GitHub (inválido o revocado).' };
    if (!res.ok) return { ok: false, motivo: `GitHub respondió ${res.status}. Probá de nuevo.` };
    const data = (await res.json()) as { login?: string };
    return { ok: true, login: String(data.login || 'conectado') };
  } catch {
    return { ok: false, motivo: 'No se pudo conectar con GitHub (red).' };
  }
}

export default function PanelConexion({
  tokenActivo,
  onCambiarToken,
}: {
  tokenActivo: string;
  onCambiarToken: (token: string) => void;
}) {
  const [abierto, setAbierto] = useState(!tokenActivo);
  const [valor, setValor] = useState('');
  const [validando, setValidando] = useState(false);
  const [error, setError] = useState('');
  const [login, setLogin] = useState(tokenActivo ? 'conectado' : '');

  async function conectar() {
    const token = valor.trim();
    if (!token || validando) return;
    setValidando(true);
    setError('');
    const resultado = await validarToken(token);
    setValidando(false);
    if (!resultado.ok) {
      setError(resultado.motivo);
      return;
    }
    guardarToken(token);
    onCambiarToken(token);
    setLogin(resultado.login);
    setValor('');
    setAbierto(false);
  }

  function desconectar() {
    borrarToken();
    onCambiarToken('');
    setLogin('');
    setAbierto(true);
  }

  return (
    <div className="rounded-2xl border border-[#3a3226] bg-[#1d1810] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium text-[#f0e8da]">
          {tokenActivo ? <PlugZap size={16} className="text-[#bfe3bf]" /> : <CloudOff size={16} className="text-[#ecd9a0]" />}
          Conexión con GitHub
          {tokenActivo && <span className="text-xs font-normal text-[#bfe3bf]">· conectado{login && login !== 'conectado' ? ` (${login})` : ''}</span>}
        </p>
        {tokenActivo ? (
          <BotonSecundario onClick={desconectar} icono={X}>
            Desconectar
          </BotonSecundario>
        ) : (
          <BotonPrincipal onClick={() => setAbierto(!abierto)} icono={KeyRound}>
            {abierto ? 'Cerrar' : 'Conectar'}
          </BotonPrincipal>
        )}
      </div>

      {abierto && !tokenActivo && (
        <div className="mt-4">
          <p className="text-xs leading-relaxed text-[#b3a68f]">
            Para publicar cambios se necesita un token de GitHub del estudio (fine-grained, permiso de contenido sobre el
            repositorio). El token vive solo en esta pestaña: se borra al cerrarla y nunca queda guardado en el sitio.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="password"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="github_pat_… o ghp_…"
              aria-label="Token de GitHub"
              className="w-full rounded-xl border border-[#3a3226] bg-[#262017] px-3 py-2.5 font-mono text-xs text-[#f0e8da] placeholder-[#6f6552] outline-none transition focus:border-[#d4b465]"
            />
            <BotonPrincipal onClick={conectar} ocupado={validando} disabled={!valor.trim()}>
              {validando ? <Loader2 size={15} className="animate-spin" /> : null}
              Conectar
            </BotonPrincipal>
          </div>
          {error && (
            <div className="mt-3">
              <Aviso tono="error">{error}</Aviso>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
