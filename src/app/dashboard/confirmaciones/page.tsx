'use client';

// ============================================================
// /dashboard/confirmaciones — LISTA DE CONFIRMACIONES (RSVP)
// ------------------------------------------------------------
// Lee content/rsvps/<slug>.json del repositorio (lectura anónima) y
// lo vuelve a consultar cada 25 s (autoactualización "en vivo"; se
// pausa cuando la pestaña está oculta). Permite filtrar, buscar,
// exportar CSV y — con la conexión de GitHub activa — registrar,
// alternar asistencia y eliminar confirmaciones con commits
// automáticos ([skip ci]: nunca reconstruyen el sitio).
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Download,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import {
  MAX_CANTIDAD_GRUPO,
  rutaArchivoRsvps,
  resumenRsvps,
  serializarRsvps,
  validarColeccionRsvps,
  type ColeccionRsvps,
  type EntradaRsvp,
} from '@/data/rsvps-esquema';
import { agregarEntradaRsvp, leerJSON, escribirJSON } from '@/lib/github-db';
import { validarCantidad, validarListaNombres, validarTextoOpcional } from '@/lib/dashboard-validacion';
import { WHATSAPP_NUMERO, whatsappLink } from '@/data/contacto';
import { useSesionCliente } from '../guardia';
import PanelConexion, { leerTokenGuardado } from '@/components/dashboard/panel-conexion';
import {
  Aviso,
  BotonPrincipal,
  BotonSecundario,
  CampoTexto,
  Esqueleto,
  Tarjeta,
  fechaCorta,
} from '@/components/dashboard/ui';

const INTERVALO_ACTUALIZACION_MS = 25000;
type Filtro = 'todas' | 'asisten' | 'no-asisten';

export default function PanelConfirmaciones() {
  const sesion = useSesionCliente();
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [rsvps, setRsvps] = useState<EntradaRsvp[]>([]);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState<{ tono: 'ok' | 'error' | 'info'; texto: string } | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [token, setToken] = useState('');
  const [formAbierto, setFormAbierto] = useState(false);
  const [ocupada, setOcupada] = useState(false);
  const [nombres, setNombres] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [asistencia, setAsistencia] = useState<'si' | 'no'>('si');
  const [cancion, setCancion] = useState('');
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});

  const cargar = useCallback(
    async (silencioso = false) => {
      if (silencioso) setActualizando(true);
      else setCargando(true);
      setError('');
      const lectura = await leerJSON<ColeccionRsvps>(rutaArchivoRsvps(sesion.slug));
      if (lectura.ok) {
        const coleccion = validarColeccionRsvps(lectura.data);
        if (coleccion) setRsvps(coleccion.rsvps);
        else setError('El archivo de confirmaciones tiene un formato inesperado. Escribinos para revisarlo.');
      } else if (lectura.motivo === 'no-existe') {
        setRsvps([]); // sin confirmaciones todavía: estado normal
      } else {
        setError(lectura.mensaje);
      }
      setCargando(false);
      setActualizando(false);
    },
    [sesion.slug],
  );

  useEffect(() => {
    // Token en sessionStorage + carga inicial (sistemas externos, solo cliente).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(leerTokenGuardado());
     
    void cargar();
  }, [cargar]);

  // Autoactualización "en vivo": cada 25 s, pausada con la pestaña oculta.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') void cargar(true);
    }, INTERVALO_ACTUALIZACION_MS);
    const alVisibilidad = () => {
      if (document.visibilityState === 'visible') void cargar(true);
    };
    document.addEventListener('visibilitychange', alVisibilidad);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', alVisibilidad);
    };
  }, [cargar]);

  const resumen = resumenRsvps(rsvps);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return rsvps
      .filter((r) => {
        if (filtro === 'asisten' && r.asistencia !== 'si') return false;
        if (filtro === 'no-asisten' && r.asistencia !== 'no') return false;
        if (!texto) return true;
        return (
          r.codigo.toLowerCase().includes(texto) ||
          r.invitados.some((n) => n.toLowerCase().includes(texto))
        );
      })
      .sort((a, b) => Date.parse(b.fecha) - Date.parse(a.fecha));
  }, [rsvps, filtro, busqueda]);

  // --- Acciones con commit (exigen token) ---
  async function alternarAsistencia(entrada: EntradaRsvp) {
    if (!token || ocupada) return;
    setOcupada(true);
    setAviso(null);
    const nueva: EntradaRsvp = { ...entrada, asistencia: entrada.asistencia === 'si' ? 'no' : 'si' };
    const actualizada = await escribirColeccion(rsvps.map((r) => (r.codigo === entrada.codigo ? nueva : r)));
    if (actualizada) setAviso({ tono: 'ok', texto: `Asistencia de ${entrada.codigo} actualizada (commit automático).` });
    setOcupada(false);
  }

  async function eliminar(entrada: EntradaRsvp) {
    if (!token || ocupada) return;
    if (!window.confirm(`¿Eliminar la confirmación de ${entrada.invitados[0]} (${entrada.codigo})? Se hace un commit que la quita del archivo.`)) return;
    setOcupada(true);
    setAviso(null);
    const actualizada = await escribirColeccion(rsvps.filter((r) => r.codigo !== entrada.codigo));
    if (actualizada) setAviso({ tono: 'ok', texto: `Confirmación ${entrada.codigo} eliminada (commit automático).` });
    setOcupada(false);
  }

  /** Re-escribe la colección completa preservando el SHA (con un reintento ante conflicto). */
  async function escribirColeccion(nuevaLista: EntradaRsvp[]): Promise<boolean> {
    const lectura = await leerJSON<ColeccionRsvps>(rutaArchivoRsvps(sesion.slug), { token });
    if (!lectura.ok && lectura.motivo !== 'no-existe') {
      setAviso({ tono: 'error', texto: lectura.mensaje });
      return false;
    }
    const coleccion = {
      esquema: 1,
      actualizadoEn: new Date().toISOString(),
      rsvps: nuevaLista,
    };
    const escritura = await escribirJSON(rutaArchivoRsvps(sesion.slug), serializarRsvps(coleccion), {
      mensaje: `rsvp(${sesion.slug}): actualización manual del panel [skip ci]`,
      token,
      ...(lectura.ok ? { shaPrevio: lectura.sha } : {}),
    });
    if (!escritura.ok) {
      setAviso({ tono: 'error', texto: `${escritura.mensaje} Recargá la lista e intentá de nuevo.` });
      await cargar(true);
      return false;
    }
    await cargar(true);
    return true;
  }

  async function agregarManual() {
    if (!token) return;
    const erroresNuevos: Record<string, string> = {};
    const lista = validarListaNombres(nombres);
    if (!lista.ok) erroresNuevos.nombres = lista.motivo;
    const cant = validarCantidad(cantidad);
    if (!cant.ok) erroresNuevos.cantidad = cant.motivo;
    const cancionLimpia = validarTextoOpcional(cancion, 'La canción', 120);
    if (!cancionLimpia.ok) erroresNuevos.cancion = cancionLimpia.motivo;
    setErroresForm(erroresNuevos);
    if (Object.keys(erroresNuevos).length > 0) return;

    setOcupada(true);
    setAviso(null);
    const resultado = await agregarEntradaRsvp(
      sesion.slug,
      {
        // Código de grupo de alta manual, distinguible del formulario (MIL-…).
        codigo: 'LGS-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        cantidad: cant.ok ? cant.valor : 1,
        invitados: lista.ok ? lista.valor : [],
        asistencia,
        fecha: new Date().toISOString(),
        origen: 'manual',
        cancion: cancionLimpia.ok ? cancionLimpia.valor : '',
      },
      { token },
    );
    setOcupada(false);
    if (!resultado.ok) {
      setAviso({ tono: 'error', texto: resultado.mensaje });
      return;
    }
    setAviso({ tono: 'ok', texto: resultado.dedup ? 'Ese grupo ya estaba registrado.' : 'Confirmación registrada (commit automático).' });
    setFormAbierto(false);
    setNombres('');
    setCantidad('1');
    setAsistencia('si');
    setCancion('');
    setErroresForm({});
    await cargar(true);
  }

  // --- Export CSV (Excel es-UY: BOM + separador ;) ---
  function exportarCsv() {
    const filas = [['Fecha', 'Codigo', 'Invitados', 'Cantidad', 'Asistencia', 'Cancion']];
    for (const r of visibles) {
      filas.push([
        fechaCorta(r.fecha),
        r.codigo,
        r.invitados.join(' | '),
        String(r.cantidad),
        r.asistencia === 'si' ? 'Asiste' : 'No asiste',
        r.cancion || '',
      ]);
    }
    const csv = filas.map((f) => f.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confirmaciones-${sesion.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-[#f0e8da]">Confirmaciones</h1>
          <p className="mt-1 text-xs text-[#b3a68f]">Se actualiza sola cada 25 segundos mientras esta pestaña esté abierta.</p>
        </div>
        <BotonSecundario onClick={() => void cargar(true)} ocupado={actualizando} icono={RefreshCw}>
          Actualizar
        </BotonSecundario>
      </div>

      {error && <Aviso tono="error">{error} <button onClick={() => void cargar()} className="underline underline-offset-2">Reintentar</button></Aviso>}
      {aviso && <Aviso tono={aviso.tono}>{aviso.texto}</Aviso>}

      {/* Resumen */}
      {cargando ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Esqueleto className="h-20" />
          <Esqueleto className="h-20" />
          <Esqueleto className="h-20" />
          <Esqueleto className="h-20" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { etiqueta: 'Grupos', valor: resumen.grupos },
            { etiqueta: 'Personas', valor: resumen.personas },
            { etiqueta: 'Asisten', valor: resumen.asisten },
            { etiqueta: 'No asisten', valor: resumen.noAsisten },
          ].map(({ etiqueta, valor }) => (
            <Tarjeta key={etiqueta} className="!p-4 text-center">
              <p className="font-serif text-2xl text-[#d4b465]">{valor}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#8a7d67]">{etiqueta}</p>
            </Tarjeta>
          ))}
        </div>
      )}

      {/* Filtros + búsqueda + acciones */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ['todas', 'Todas'],
              ['asisten', 'Asisten'],
              ['no-asisten', 'No asisten'],
            ] as const
          ).map(([clave, etiqueta]) => (
            <button
              key={clave}
              type="button"
              onClick={() => setFiltro(clave)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                filtro === clave
                  ? 'border-[#d4b465] bg-[#d4b465]/10 text-[#d4b465]'
                  : 'border-[#3a3226] text-[#b3a68f] hover:border-[#57503f] hover:text-[#f0e8da]'
              }`}
            >
              {etiqueta}
            </button>
          ))}
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7d67]" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar nombre o código…"
              aria-label="Buscar confirmaciones"
              className="w-56 rounded-full border border-[#3a3226] bg-[#262017] py-2 pl-8 pr-3 text-xs text-[#f0e8da] placeholder-[#6f6552] outline-none transition focus:border-[#d4b465]"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <BotonSecundario onClick={exportarCsv} icono={Download} disabled={visibles.length === 0}>
            Exportar CSV
          </BotonSecundario>
          {token ? (
            <BotonPrincipal onClick={() => setFormAbierto(!formAbierto)} icono={formAbierto ? X : UserPlus}>
              {formAbierto ? 'Cerrar' : 'Registrar a mano'}
            </BotonPrincipal>
          ) : (
            <a href={whatsappLink(`Hola! Quiero anotar una confirmación para mi invitación (${sesion.slug}).`)} target="_blank" rel="noreferrer">
              <BotonSecundario icono={MessageCircle}>Avisar por WhatsApp</BotonSecundario>
            </a>
          )}
        </div>
      </div>

      {/* Alta manual (solo con conexión) */}
      {formAbierto && token && (
        <Tarjeta>
          <TituloSimple>Registrar confirmación a mano</TituloSimple>
          <p className="mt-1 text-xs text-[#b3a68f]">
            Para las que te llegan por WhatsApp o de palabra. Se guarda con un commit automático (código LGS-…).
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <CampoTexto
              id="nombres"
              etiqueta="Nombres (uno por línea)"
              valor={nombres}
              alCambiar={setNombres}
              error={erroresForm.nombres}
              multilinea
              filas={3}
              placeholder={'Tía Mercedes\nPrimo Juan'}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto
                id="cantidad"
                etiqueta={`Cantidad (1-${MAX_CANTIDAD_GRUPO})`}
                valor={cantidad}
                alCambiar={setCantidad}
                error={erroresForm.cantidad}
                tipo="number"
              />
              <div>
                <span className="block text-xs font-medium text-[#b3a68f]">Asistencia</span>
                <div className="mt-1.5 flex gap-2">
                  {(['si', 'no'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAsistencia(v)}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm transition ${
                        asistencia === v
                          ? 'border-[#d4b465] bg-[#d4b465]/10 text-[#d4b465]'
                          : 'border-[#3a3226] text-[#b3a68f] hover:text-[#f0e8da]'
                      }`}
                    >
                      {v === 'si' ? 'Asiste' : 'No asiste'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <CampoTexto
                id="cancion"
                etiqueta="Canción sugerida (opcional)"
                valor={cancion}
                alCambiar={setCancion}
                error={erroresForm.cancion}
              />
            </div>
          </div>
          <div className="mt-4">
            <BotonPrincipal onClick={() => void agregarManual()} ocupado={ocupada} icono={Plus}>
              Registrar
            </BotonPrincipal>
          </div>
        </Tarjeta>
      )}

      {/* Lista */}
      {cargando ? (
        <div className="space-y-3">
          <Esqueleto className="h-16" />
          <Esqueleto className="h-16" />
          <Esqueleto className="h-16" />
        </div>
      ) : visibles.length === 0 ? (
        <Tarjeta className="text-center">
          <p className="text-sm text-[#b3a68f]">
            {rsvps.length === 0
              ? 'Todavía no hay confirmaciones registradas. Cuando tus invitados confirmen (o las registres acá), aparecen solas.'
              : 'Ninguna confirmación coincide con el filtro o la búsqueda.'}
          </p>
        </Tarjeta>
      ) : (
        <div className="space-y-2.5">
          {visibles.map((r) => (
            <div
              key={r.codigo}
              className="flex flex-col gap-3 rounded-2xl border border-[#3a3226] bg-[#1d1810] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      r.asistencia === 'si'
                        ? 'border-[#3f5b3f] bg-[#1c2b1c] text-[#bfe3bf]'
                        : 'border-[#7a4034] bg-[#3a201a] text-[#f2b8ad]'
                    }`}
                  >
                    {r.asistencia === 'si' ? <Check size={11} /> : <X size={11} />}
                    {r.asistencia === 'si' ? 'Asiste' : 'No asiste'}
                  </span>
                  <span className="font-mono text-[10px] text-[#8a7d67]">{r.codigo}</span>
                  <span className="text-[10px] text-[#6f6552]">· {fechaCorta(r.fecha)}</span>
                </div>
                <p className="mt-1.5 truncate text-sm text-[#f0e8da]">{r.invitados.join(', ')}</p>
                <p className="mt-0.5 text-[11px] text-[#8a7d67]">
                  {r.cantidad} persona{r.cantidad === 1 ? '' : 's'}
                  {r.cancion ? ` · canción: ${r.cancion}` : ''}
                  {r.origen === 'manual' ? ' · registrada a mano' : r.origen === 'whatsapp' ? ' · vía WhatsApp' : ''}
                </p>
              </div>
              {token && (
                <div className="flex shrink-0 gap-2">
                  <BotonSecundario onClick={() => void alternarAsistencia(r)} disabled={ocupada} icono={Check}>
                    {r.asistencia === 'si' ? 'Marcar no va' : 'Marcar que va'}
                  </BotonSecundario>
                  <button
                    type="button"
                    onClick={() => void eliminar(r)}
                    disabled={ocupada}
                    aria-label={`Eliminar confirmación ${r.codigo}`}
                    className="inline-flex items-center justify-center rounded-xl border border-[#7a4034] px-3 py-2.5 text-[#f2b8ad] transition hover:bg-[#3a201a] disabled:opacity-60"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <PanelConexion tokenActivo={token} onCambiarToken={setToken} />
    </div>
  );
}

function TituloSimple({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-lg text-[#f0e8da]">{children}</h2>;
}
