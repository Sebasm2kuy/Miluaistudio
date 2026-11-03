'use client';

// ============================================================
// TABLA DE CLIENTES DEL PANEL DEL ESTUDIO — iteración 042
// ------------------------------------------------------------
// Lista interactiva de todas las cuentas registradas (lectura pública
// del repo, la misma fuente que usa /acceso/): nombre, email, slug,
// fecha de creación, estado de la invitación y confirmaciones.
// Buscador instantáneo (nombre, email o slug) + filtro rápido por
// estado de publicación. Los datos llegan listos desde la página.
// ============================================================

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

export interface FilaCliente {
  nombre: string;
  email: string;
  slug: string;
  creadoEn: string;
  invitacionPublicada: boolean;
  publicadoEn: string;
  grupos: number;
  personasAsisten: number;
}

type FiltroEstado = 'todos' | 'publicadas' | 'sin-publicar';

export function TablaClientes({ filas, cargando }: { filas: FilaCliente[]; cargando: boolean }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return filas.filter((f) => {
      if (filtro === 'publicadas' && !f.invitacionPublicada) return false;
      if (filtro === 'sin-publicar' && f.invitacionPublicada) return false;
      if (!q) return true;
      return (
        f.nombre.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.slug.toLowerCase().includes(q)
      );
    });
  }, [filas, busqueda, filtro]);

  return (
    <section className="space-y-4" aria-label="Clientes registrados">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg text-[#292522]">Clientes</h2>
          <p className="mt-0.5 text-xs text-[#716a63]">
            {filas.length} cuenta{filas.length === 1 ? '' : 's'} registrada{filas.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#787168]" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, email o slug…"
              aria-label="Buscar clientes"
              className="w-56 rounded-xl border border-[#e8e0d7] bg-white py-2 pl-9 pr-3 text-xs text-[#292522] placeholder-[#787168] outline-none transition focus:border-[#8a6534] sm:w-64"
            />
          </div>
          <div className="flex gap-1.5" role="group" aria-label="Filtrar por estado de invitación">
            {(
              [
                ['todos', 'Todas'],
                ['publicadas', 'Publicadas'],
                ['sin-publicar', 'Sin publicar'],
              ] as Array<[FiltroEstado, string]>
            ).map(([valor, etiqueta]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setFiltro(valor)}
                aria-pressed={filtro === valor}
                className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                  filtro === valor
                    ? 'bg-[#f3ead9] text-[#6b4e16] ring-1 ring-[#dfc9a4]'
                    : 'border border-[#e8e0d7] bg-white text-[#54483e] hover:border-[#dfc9a4] hover:bg-[#f6efe2]'
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#e8e0d7] bg-white shadow-[0_4px_16px_rgba(34,26,19,0.04)]">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="border-b border-[#e8e0d7] bg-[#faf8f4] text-[10px] uppercase tracking-[0.14em] text-[#716a63]">
              <th scope="col" className="px-4 py-3 font-medium">Cliente</th>
              <th scope="col" className="px-4 py-3 font-medium">Email</th>
              <th scope="col" className="px-4 py-3 font-medium">Invitación</th>
              <th scope="col" className="px-4 py-3 font-medium">Creada</th>
              <th scope="col" className="px-4 py-3 font-medium">Estado</th>
              <th scope="col" className="px-4 py-3 font-medium">Confirmaciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#716a63]">Cargando clientes del repositorio…</td>
              </tr>
            ) : filtradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#716a63]">
                  {filas.length === 0
                    ? 'Todavía no hay clientes registrados.'
                    : 'Ningún cliente coincide con la búsqueda.'}
                </td>
              </tr>
            ) : (
              filtradas.map((f) => (
                <tr key={f.email} className="border-b border-[#f0e9dd] last:border-0 hover:bg-[#faf8f4]">
                  <td className="px-4 py-3 font-medium text-[#292522]">{f.nombre}</td>
                  <td className="px-4 py-3 text-[#54483e]">{f.email}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`/i/${f.slug}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[11px] text-[#8a6534] underline decoration-[#8a6534]/30 underline-offset-2 transition hover:text-[#6f5428]"
                    >
                      /i/{f.slug}/
                    </a>
                  </td>
                  <td className="px-4 py-3 text-[#716a63]">{fechaCorta(f.creadoEn)}</td>
                  <td className="px-4 py-3">
                    {f.invitacionPublicada ? (
                      <span className="inline-flex items-center rounded-full border border-[#bcdcc1] bg-[#edf7ef] px-2.5 py-1 text-[10px] font-medium text-[#1e4620]">
                        Publicada
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-[#e7d3a2] bg-[#faf3e0] px-2.5 py-1 text-[10px] font-medium text-[#6b4e16]">
                        Sin publicar
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#54483e]">
                    {f.grupos === 0 ? (
                      <span className="text-[#787168]">—</span>
                    ) : (
                      <>
                        {f.grupos} grupo{f.grupos === 1 ? '' : 's'} · {f.personasAsisten} persona{f.personasAsisten === 1 ? '' : 's'}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Fecha corta es-UY: "3/11/2026". */
function fechaCorta(iso: string): string {
  const t = Date.parse(String(iso || ''));
  if (!Number.isFinite(t)) return '—';
  const d = new Date(t);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
