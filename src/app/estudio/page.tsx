'use client';

// ============================================================
// /estudio — PANEL DE ADMINISTRACIÓN DEL ESTUDIO (iteración 042)
// ------------------------------------------------------------
// Panel privado de métricas y gestión de clientes, reservado a la
// cuenta sebacabrera1982@gmail.com (EMAIL_ADMIN en src/lib/admin-auth).
//
// Control de acceso (fail-closed, dos capas):
//  1. FRONTAL: credencial de Google (widget oficial) evaluada con
//     evaluarAccesoAdmin (audiencia, emisor, vigencia, email verificado,
//     email exacto del estudio). Cualquier otro usuario ve
//     «Acceso restringido» y NADA del panel.
//  2. BACKEND: los datos de tráfico solo existen en la hoja privada de
//     Google del Web App (gallery-server.gs) y se entregan vía
//     metricas_admin, que re-verifica el token con Google (tokeninfo) y
//     exige el email del estudio. Sin backend activo: la sección de
//     tráfico se muestra «no disponible», nunca ceros inventados.
//
// Datos:
//  - Tráfico (visitas, únicas, online, tendencias): filas anónimas del
//    backend → src/lib/admin-metricas.ts (funciones puras probadas).
//  - Clientes y confirmaciones: lectura pública del repo (la MISMA
//    fuente que usa /acceso/ y el panel de cliente) — sin secretos.
//
// La sesión vive en sessionStorage y dura lo mismo que el id_token de
// Google (≈1 h): vencida, el panel vuelve a la puerta de acceso.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Globe, LogOut, ShieldCheck } from 'lucide-react';
import { ENDPOINT_REGISTRO } from '@/data/registro-auto';
import { GOOGLE_CLIENT_ID } from '@/data/acceso-google';
import {
  RUTA_CLIENTES,
  validarColeccionClientes,
  type ClienteCuenta,
} from '@/data/clientes-esquema';
import {
  rutaArchivoInvitacion,
  validarInvitacionPublicada,
} from '@/data/invitacion-publicada';
import { rutaArchivoRsvps, validarColeccionRsvps, type ColeccionRsvps } from '@/data/rsvps-esquema';
import {
  diaMontevideo,
  type FilaMetrica,
} from '@/data/metricas-esquema';
import {
  cerrarSesionAdmin,
  evaluarAccesoAdmin,
  guardarSesionAdmin,
  leerSesionAdmin,
  type SesionAdmin,
} from '@/lib/admin-auth';
import {
  agregarFilasMetricas,
  calcularRango,
  serieRegistrosConfirmaciones,
  tasaConversion,
  type PeriodoMetricas,
} from '@/lib/admin-metricas';
import { consultarMetricasAdmin } from '@/lib/admin-backend';
import { leerJSON } from '@/lib/github-db';
import { Esqueleto } from '@/components/dashboard/ui';
import { PantallaAcceso, PantallaBloqueado } from '@/components/estudio/pantalla-acceso';
import { SeccionMetricas, SelectorPeriodo, type EstadoBackendMetricas } from '@/components/estudio/metricas';
import { TablaClientes, type FilaCliente } from '@/components/estudio/tabla-clientes';

type FasePanel =
  | { fase: 'verificando' }
  | { fase: 'acceso' }
  | { fase: 'bloqueado'; motivo: string }
  | { fase: 'panel' };

type EstadoClientes = { estado: 'cargando' } | { estado: 'ok' } | { estado: 'error'; mensaje: string };

export default function PaginaEstudio() {
  const [fase, setFase] = useState<FasePanel>({ fase: 'verificando' });
  const [sesion, setSesion] = useState<SesionAdmin | null>(null);
  const [ocupadoAcceso, setOcupadoAcceso] = useState(false);
  const [errorAcceso, setErrorAcceso] = useState('');

  // Datos de clientes (lectura pública del repo).
  const [estadoClientes, setEstadoClientes] = useState<EstadoClientes>({ estado: 'cargando' });
  const [cuentas, setCuentas] = useState<ClienteCuenta[]>([]);
  const [filasClientes, setFilasClientes] = useState<FilaCliente[]>([]);
  const [fechasRsvps, setFechasRsvps] = useState<string[]>([]);
  const [personasAsisten, setPersonasAsisten] = useState(0);

  // Métricas de tráfico (backend privado).
  const [estadoBackend, setEstadoBackend] = useState<EstadoBackendMetricas>({ estado: 'cargando' });
  const [filasTrafico, setFilasTrafico] = useState<FilaMetrica[]>([]);

  // Período seleccionado + «ahora» (se refresca cada minuto para el online).
  const [periodo, setPeriodo] = useState<PeriodoMetricas>('7d');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [ahora, setAhora] = useState<Date>(() => new Date());
  const [actualizando, setActualizando] = useState(false);

  // ---------------------------------------------------------------------------
  // Cargas de datos
  // ---------------------------------------------------------------------------

  const cargarClientes = useCallback(async () => {
    setEstadoClientes({ estado: 'cargando' });

    const lectura = await leerJSON(RUTA_CLIENTES);
    if (!lectura.ok) {
      setEstadoClientes({
        estado: 'error',
        mensaje:
          lectura.motivo === 'no-existe'
            ? 'Todavía no hay clientes registrados en el repositorio.'
            : 'No se pudo leer el registro de clientes (repositorio). Probá de nuevo en unos segundos.',
      });
      return;
    }
    const coleccion = validarColeccionClientes(lectura.data);
    if (!coleccion) {
      setEstadoClientes({ estado: 'error', mensaje: 'El registro de clientes no tiene el formato esperado.' });
      return;
    }

    const cuentasValidas = coleccion.cuentas;
    setCuentas(cuentasValidas);

    // Estado de invitación y confirmaciones por cliente (lecturas públicas,
    // tolerantes: 404 = sin publicar / sin confirmaciones, estados normales).
    const slugsUnicos = [...new Set(cuentasValidas.map((c) => c.slug).filter(Boolean))];

    const detalles = await Promise.all(
      slugsUnicos.map(async (slug) => {
        const lecturaInv = await leerJSON(rutaArchivoInvitacion(slug));
        const lecturaRsvps = await leerJSON<ColeccionRsvps>(rutaArchivoRsvps(slug));
        const rsvps = lecturaRsvps.ok ? validarColeccionRsvps(lecturaRsvps.data) : null;
        return {
          slug,
          publicada: lecturaInv.ok ? validarInvitacionPublicada(lecturaInv.data) !== null : false,
          publicadoEn: lecturaInv.ok
            ? String(validarInvitacionPublicada(lecturaInv.data)?.publicadoEn || '')
            : '',
          rsvps: rsvps ? rsvps.rsvps : [],
        };
      }),
    );

    const porSlug = new Map(detalles.map((d) => [d.slug, d]));
    setFilasClientes(
      cuentasValidas.map((cuenta) => {
        const detalle = porSlug.get(cuenta.slug);
        const asisten = (detalle?.rsvps || []).filter((r) => r.asistencia === 'si');
        return {
          nombre: cuenta.nombre,
          email: cuenta.email,
          slug: cuenta.slug,
          creadoEn: cuenta.creadoEn,
          invitacionPublicada: Boolean(detalle?.publicada),
          publicadoEn: detalle?.publicadoEn || '',
          grupos: detalle?.rsvps.length || 0,
          personasAsisten: asisten.reduce((acc, r) => acc + r.cantidad, 0),
        };
      }),
    );

    setFechasRsvps(detalles.flatMap((d) => d.rsvps.map((r) => r.fecha)));
    setPersonasAsisten(
      detalles.reduce(
        (acc, d) => acc + d.rsvps.filter((r) => r.asistencia === 'si').reduce((a, r) => a + r.cantidad, 0),
        0,
      ),
    );
    setEstadoClientes({ estado: 'ok' });
  }, []);

  const cargarMetricas = useCallback(
    async (credencial: string) => {
      setEstadoBackend({ estado: 'cargando' as const });
      const resultado = await consultarMetricasAdmin(credencial, { endpoint: ENDPOINT_REGISTRO });
      if (resultado.ok) {
        setFilasTrafico(resultado.filas);
        setEstadoBackend({ estado: 'ok' });
        return;
      }
      setFilasTrafico([]);
      setEstadoBackend({ estado: 'error', motivo: resultado.motivo, mensaje: resultado.mensaje });
      // Credencial vencida o cuenta ajena: la sesión ya no sirve (fail-closed).
      if (resultado.motivo === 'credencial') {
        cerrarSesionAdmin();
        setSesion(null);
        setErrorAcceso(resultado.mensaje);
        setFase({ fase: 'acceso' });
      }
      if (resultado.motivo === 'no-autorizado') {
        cerrarSesionAdmin();
        setSesion(null);
        setFase({ fase: 'bloqueado', motivo: 'email' });
      }
    },
    [],
  );

  const cargarTodo = useCallback(
    async (sesionActiva: SesionAdmin) => {
      setActualizando(true);
      setAhora(new Date());
      await Promise.all([cargarClientes(), cargarMetricas(sesionActiva.credencial)]);
      setActualizando(false);
    },
    [cargarClientes, cargarMetricas],
  );

  // ---------------------------------------------------------------------------
  // Sesión: verificación al montar + credencial de Google
  // ---------------------------------------------------------------------------

  // Panel abierto: resolver la sesión al montar (lectura de sessionStorage,
  // sistema externo: solo posible tras el montaje). El setState va por una
  // función declarada DENTRO del efecto: el sistema externo dispara el estado.
  useEffect(() => {
    const resolver = () => {
      const activa = leerSesionAdmin();
      if (!activa) {
        setFase({ fase: 'acceso' });
        return;
      }
      setSesion(activa);
      setFase({ fase: 'panel' });
    };
    resolver();
  }, []);

  const manejarCredencial = useCallback((credencial: string) => {
    setOcupadoAcceso(true);
    setErrorAcceso('');
    const resultado = evaluarAccesoAdmin(credencial, { clienteId: GOOGLE_CLIENT_ID });
    if (resultado.ok) {
      guardarSesionAdmin(resultado.sesion);
      setSesion(resultado.sesion);
      setFase({ fase: 'panel' });
    } else {
      setFase({ fase: 'bloqueado', motivo: resultado.motivo });
    }
    setOcupadoAcceso(false);
  }, []);

  // Panel abierto: primera carga + refresco suave del «ahora» (online).
  useEffect(() => {
    if (fase.fase !== 'panel' || !sesion) return;
    // La carga inicial fuerza un estado de carga sincrónico (sistema externo:
    // repositorio + backend), mismo patrón que el panel de cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargarTodo(sesion);
    const intervalo = window.setInterval(() => setAhora(new Date()), 60000);
    return () => window.clearInterval(intervalo);
  }, [fase.fase, sesion, cargarTodo]);

  function salir() {
    cerrarSesionAdmin();
    setSesion(null);
    setFilasTrafico([]);
    setEstadoBackend({ estado: 'cargando' });
    setEstadoClientes({ estado: 'cargando' });
    setFase({ fase: 'acceso' });
  }

  // ---------------------------------------------------------------------------
  // Cálculos derivados del período (funciones puras de admin-metricas)
  // ---------------------------------------------------------------------------

  const rango = useMemo(
    () => calcularRango(periodo, { referencia: ahora, desde, hasta }),
    [periodo, desde, hasta, ahora],
  );

  const conTrafico = estadoBackend.estado === 'ok';
  const trafico = useMemo(
    () => (conTrafico && rango ? agregarFilasMetricas(filasTrafico, rango, ahora) : null),
    [conTrafico, filasTrafico, rango, ahora],
  );

  const serieRegistros = useMemo(
    () =>
      rango
        ? serieRegistrosConfirmaciones(
            cuentas.map((c) => ({ fecha: c.creadoEn })),
            fechasRsvps.map((fecha) => ({ fecha })),
            rango,
          )
        : [],
    [cuentas, fechasRsvps, rango],
  );

  const registrosPeriodo = serieRegistros.reduce((acc, d) => acc + d.registros, 0);
  const confirmacionesPeriodo = serieRegistros.reduce((acc, d) => acc + d.confirmaciones, 0);

  const serieTraficoGrafico = useMemo(
    () => (trafico ? trafico.serie.map((d) => ({ dia: d.dia, a: d.visitas, b: d.unicas })) : []),
    [trafico],
  );
  const serieRegistrosGrafico = useMemo(
    () => serieRegistros.map((d) => ({ dia: d.dia, a: d.registros, b: d.confirmaciones })),
    [serieRegistros],
  );

  const etiquetaRango = useMemo(() => {
    if (!rango) return 'Elegí un rango válido (desde ≤ hasta, sin fechas futuras).';
    const fmt = (dia: string) => {
      const partes = dia.split('-');
      return partes.length === 3 ? `${parseInt(partes[2], 10)}/${parseInt(partes[1], 10)}` : dia;
    };
    return `Período: ${fmt(rango.desde)} — ${fmt(rango.hasta)} (hora de Montevideo)`;
  }, [rango]);

  // ---------------------------------------------------------------------------
  // Render por fase
  // ---------------------------------------------------------------------------

  if (fase.fase === 'verificando') {
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

  if (fase.fase === 'acceso') {
    return <PantallaAcceso onCredencial={manejarCredencial} ocupado={ocupadoAcceso} errorPrevio={errorAcceso} />;
  }

  if (fase.fase === 'bloqueado' || !sesion) {
    return (
      <PantallaBloqueado
        motivo={fase.fase === 'bloqueado' ? fase.motivo : 'formato'}
        onVolver={() => {
          setErrorAcceso('');
          setFase({ fase: 'acceso' });
        }}
      />
    );
  }

  const horaExpiracion = new Date(sesion.expiracion).toLocaleTimeString('es-UY', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const hoyIso = diaMontevideo(ahora);

  return (
    <div className="flex min-h-screen flex-col bg-[#faf8f4] text-[#292522]">
      {/* Barra superior — misma línea del panel de cliente (041): «Volver a la
          web» primario y primero, el camino de vuelta nunca falta. */}
      <header className="sticky top-0 z-40 border-b border-[#e8e0d7] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
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
                Panel del estudio
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#26221d] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d3830] sm:px-5"
            >
              <Globe size={15} /> Volver a la web
            </Link>
            <span className="hidden text-xs text-[#716a63] lg:block" title="Única cuenta autorizada">
              {sesion.email} · sesión hasta {horaExpiracion}
            </span>
            <button
              type="button"
              onClick={salir}
              aria-label="Salir del panel del estudio"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e0d7] bg-white px-3 py-2.5 text-sm font-medium text-[#54483e] transition hover:border-[#dfc9a4] hover:bg-[#f6efe2] sm:px-3.5"
            >
              <LogOut size={15} /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-6 sm:px-6 sm:py-8">
        {/* Métricas */}
        <SeccionMetricas
          estadoBackend={estadoBackend}
          conTrafico={conTrafico}
          rangoValido={Boolean(rango)}
          rango={rango}
          visitas={trafico?.visitas || 0}
          unicas={trafico?.unicas || 0}
          nuevas={trafico?.nuevas || 0}
          online={trafico?.online || 0}
          serieTrafico={serieTraficoGrafico}
          serieRegistros={serieRegistrosGrafico}
          registrosPeriodo={registrosPeriodo}
          confirmacionesPeriodo={confirmacionesPeriodo}
          totalCuentas={cuentas.length}
          totalPersonasAsisten={personasAsisten}
          conversionRegistros={tasaConversion(registrosPeriodo, trafico?.visitas || 0)}
          conversionConfirmaciones={tasaConversion(confirmacionesPeriodo, trafico?.visitas || 0)}
          etiquetaRango={etiquetaRango}
          actualizando={actualizando}
          alActualizar={() => void cargarTodo(sesion)}
          selector={
            <SelectorPeriodo
              periodo={periodo}
              alCambiarPeriodo={setPeriodo}
              desde={desde}
              hasta={hasta}
              alCambiarDesde={(v) => setDesde(v)}
              alCambiarHasta={(v) => setHasta(v)}
              hoyIso={hoyIso}
            />
          }
          avisoRango={
            periodo === 'personalizado' && !rango ? (
              <p className="mt-3 text-xs text-[#8c2f1d]" role="alert">
                Rango inválido: revisá las fechas (el final no puede ser anterior al inicio ni futuro).
              </p>
            ) : undefined
          }
        />

        {/* Clientes */}
        <TablaClientes
          filas={filasClientes}
          cargando={estadoClientes.estado === 'cargando' && filasClientes.length === 0}
        />

        {estadoClientes.estado === 'error' && (
          <p role="alert" className="rounded-xl border border-[#efc3b7] bg-[#fcefec] px-4 py-3 text-xs leading-relaxed text-[#8c2f1d]">
            {estadoClientes.mensaje}{' '}
            <button onClick={() => void cargarClientes()} className="underline underline-offset-2">
              Reintentar
            </button>
          </p>
        )}
      </main>

      <footer className="border-t border-[#e8e0d7] px-4 py-4 text-center text-[10px] leading-relaxed text-[#787168]">
        Lumen Gala Studio · Panel del estudio · Las métricas no usan cookies ni direcciones IP:
        solo contadores anónimos de sesión. La lista de clientes proviene del registro público del repositorio.
      </footer>
    </div>
  );
}
