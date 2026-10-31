'use client';

// ============================================================
// /dashboard/editar — EDITOR DE DATOS DEL EVENTO
// ------------------------------------------------------------
// Carga content/invitaciones/<slug>.json (lectura anónima) y deja al
// cliente editar los datos operativos de SU invitación: fecha y hora,
// lugar y ubicación, música (Spotify), frase de bienvenida (dedicatoria)
// y cronograma de la noche.
//
// Guardado (estados honestos, como en el panel del estudio):
//  - Con conexión (token en sesión): «Publicar cambios» hace un commit
//    automático (publicarInvitacionEnGitHub) conservando el enlace y la
//    fecha de primera publicación. El sitio se reconstruye solo (~2-3 min).
//  - Sin conexión: «Guardar borrador» (localStorage del navegador) +
//    «Descargar JSON» / «Enviar por WhatsApp» para que el estudio lo
//    publique. Nada se presenta como publicado si no lo fue.
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import {
  CalendarDays,
  Download,
  ListMusic,
  MessageCircle,
  Music2,
  PenLine,
  Plus,
  RotateCcw,
  Save,
  ScrollText,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  crearInvitacionPublicada,
  rutaArchivoInvitacion,
  urlPublicaInvitacion,
  validarInvitacionPublicada,
  type InvitacionPublicada,
} from '@/data/invitacion-publicada';
import type { SiteConfig, TimelineEvent } from '@/data/config-schema';
import { publicarInvitacionEnGitHub } from '@/lib/github-deploy';
import { leerJSON } from '@/lib/github-db';
import {
  desglosarFecha,
  valorInputDesdeFecha,
  validarTextoRequerido,
  validarUrlOpcional,
  validarSpotify,
} from '@/lib/dashboard-validacion';
import { spotifyEmbedUrl } from '@/lib/personalizador';
import { WHATSAPP_NUMERO } from '@/data/contacto';
import { useSesionCliente } from '../guardia';
import PanelConexion, { leerTokenGuardado } from '@/components/dashboard/panel-conexion';
import {
  Aviso,
  BotonPrincipal,
  BotonSecundario,
  CampoTexto,
  Esqueleto,
  Tarjeta,
  TituloSeccion,
  fechaCorta,
} from '@/components/dashboard/ui';

type EstadoCarga = 'cargando' | 'ok' | 'error';
type Guardado = 'nada' | 'publicando' | 'borrador';

interface BorradorLocal {
  config: SiteConfig;
  guardadoEn: string;
}

function claveBorrador(slug: string): string {
  return `lgs_borrador_${slug}`;
}

export default function PanelEditar() {
  const sesion = useSesionCliente();
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [falloCarga, setFalloCarga] = useState('');
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [publicadoEn, setPublicadoEn] = useState<string | undefined>(undefined);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardado, setGuardado] = useState<Guardado>('nada');
  const [mensaje, setMensaje] = useState<{ tono: 'ok' | 'error' | 'info'; texto: string } | null>(null);
  const [borrador, setBorrador] = useState<BorradorLocal | null>(null);
  const [token, setToken] = useState('');

  // --- Carga (con preferencia del borrador local si existe) ---
  const cargar = useCallback(async () => {
    setEstado('cargando');
    setMensaje(null);
    const lectura = await leerJSON<unknown>(rutaArchivoInvitacion(sesion.slug));
    if (!lectura.ok) {
      setFalloCarga(
        lectura.motivo === 'no-existe'
          ? 'Todavía no existe una invitación publicada con tu slug. Cargá los datos y publicá por primera vez (con conexión del estudio) o escribinos.'
          : lectura.mensaje,
      );
      setEstado('error');
      return;
    }
    const invitacion = validarInvitacionPublicada(lectura.data);
    if (!invitacion) {
      setFalloCarga('El archivo publicado no tiene el formato esperado. Escribinos para revisarlo.');
      setEstado('error');
      return;
    }
    setConfig(invitacion.config);
    setPublicadoEn(invitacion.publicadoEn);
    setErrores({});
    setEstado('ok');

    try {
      const crudo = localStorage.getItem(claveBorrador(sesion.slug));
      if (crudo) {
        const parsed = JSON.parse(crudo) as BorradorLocal;
        if (parsed?.config) setBorrador(parsed);
      }
    } catch {
      setBorrador(null);
    }
  }, [sesion.slug]);

  useEffect(() => {
    // Token en sessionStorage + carga inicial (sistemas externos, solo cliente).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(leerTokenGuardado());
     
    void cargar();
  }, [cargar]);

  function usarBorrador() {
    if (!borrador) return;
    setConfig(borrador.config);
    setMensaje({ tono: 'info', texto: `Borrador local del ${fechaCorta(borrador.guardadoEn)} cargado. Revisá y publicá cuando quieras.` });
  }

  function descartarBorrador() {
    localStorage.removeItem(claveBorrador(sesion.slug));
    setBorrador(null);
    setMensaje({ tono: 'info', texto: 'Borrador local descartado.' });
  }

  if (estado === 'cargando') {
    return (
      <div className="space-y-4">
        <Esqueleto className="h-10 w-64" />
        <Esqueleto className="h-64" />
        <Esqueleto className="h-40" />
      </div>
    );
  }

  if (estado === 'error' || !config) {
    return (
      <div className="space-y-4">
        <Aviso tono="error">
          {falloCarga}{' '}
          <button onClick={() => void cargar()} className="underline underline-offset-2">
            Reintentar
          </button>
        </Aviso>
        <PanelConexion tokenActivo={token} onCambiarToken={setToken} />
      </div>
    );
  }

  // --- Helpers de edición ---
  const editar = (cambios: Partial<SiteConfig>) => setConfig((prev) => (prev ? { ...prev, ...cambios } : prev));
  const editarEvento = (cambios: Partial<SiteConfig['evento']>) =>
    setConfig((prev) => (prev ? { ...prev, evento: { ...prev.evento, ...cambios } } : prev));
  const editarDedicatoria = (cambios: Partial<SiteConfig['dedicatoria']>) =>
    setConfig((prev) => (prev ? { ...prev, dedicatoria: { ...prev.dedicatoria, ...cambios } } : prev));
  const editarMusica = (cambios: Partial<SiteConfig['musica']>) =>
    setConfig((prev) => (prev ? { ...prev, musica: { ...prev.musica, ...cambios } } : prev));

  function alCambiarFecha(valorInput: string) {
    setErrores((prev) => ({ ...prev, fecha: '' }));
    const desglose = desglosarFecha(valorInput);
    if (!desglose) {
      setErrores((prev) => ({ ...prev, fecha: 'Elegí fecha y hora con el selector.' }));
      return;
    }
    editarEvento({ fechaEvento: desglose.fechaEvento, fecha: desglose.fecha, anio: desglose.anio });
  }

  function alCambiarPlaylist(url: string) {
    const embed = spotifyEmbedUrl(url.trim());
    editarMusica({ playlistUrl: url, ...(embed ? { embedUrl: embed } : {}) });
  }

  // --- Cronograma ---
  function editarMomento(indice: number, cambios: Partial<TimelineEvent>) {
    if (!config) return;
    const eventos = config.timeline.eventos.map((e, i) => (i === indice ? { ...e, ...cambios } : e));
    editar({ timeline: { ...config.timeline, eventos } });
  }
  function agregarMomento() {
    if (!config) return;
    editar({
      timeline: {
        ...config.timeline,
        eventos: [...config.timeline.eventos, { hora: '', titulo: '', desc: '', icono: 'Sparkles' }],
      },
    });
  }
  function quitarMomento(indice: number) {
    if (!config) return;
    editar({ timeline: { ...config.timeline, eventos: config.timeline.eventos.filter((_, i) => i !== indice) } });
  }

  // --- Validación completa antes de guardar ---
  function validarFormulario(): SiteConfig | null {
    if (!config) return null;
    const erroresNuevos: Record<string, string> = {};
    const nombre = validarTextoRequerido(config.evento.nombre, 'el nombre del agasajado', 60);
    if (!nombre.ok) erroresNuevos.nombre = nombre.motivo;
    if (!desglosarFecha(valorInputDesdeFecha(config.evento.fechaEvento))) {
      erroresNuevos.fecha = 'Elegí fecha y hora con el selector.';
    }
    const lugar = validarTextoRequerido(config.evento.lugar, 'el lugar', 120);
    if (!lugar.ok) erroresNuevos.lugar = lugar.motivo;
    const maps = validarUrlOpcional(config.evento.mapsUrl, 'El enlace de Google Maps');
    if (!maps.ok) erroresNuevos.mapsUrl = maps.motivo;
    const musica = validarSpotify(config.musica.playlistUrl);
    if (!musica.ok) erroresNuevos.playlistUrl = musica.motivo;
    const cita = validarTextoRequerido(config.dedicatoria.cita, 'la frase de bienvenida', 200);
    if (!cita.ok) erroresNuevos.cita = cita.motivo;

    setErrores(erroresNuevos);
    if (Object.keys(erroresNuevos).length > 0) {
      setMensaje({ tono: 'error', texto: 'Revisá los campos marcados antes de guardar.' });
      return null;
    }
    return config;
  }

  // --- Publicar (commit automático) ---
  async function publicar() {
    const configValida = validarFormulario();
    if (!configValida) return;
    if (!token) {
      setMensaje({ tono: 'info', texto: 'Para publicar conectá primero la Conexión con GitHub (o enviá los cambios al estudio).' });
      return;
    }
    setGuardado('publicando');
    setMensaje(null);
    try {
      const invitacion = crearInvitacionPublicada({
        slug: sesion.slug,
        config: configValida,
        ...(publicadoEn ? { publicadoEn } : {}),
      });
      const resultado = await publicarInvitacionEnGitHub(invitacion, token);
      if (resultado.success) {
        setPublicadoEn(invitacion.publicadoEn);
        localStorage.removeItem(claveBorrador(sesion.slug));
        setBorrador(null);
        setMensaje({
          tono: 'ok',
          texto: resultado.creado
            ? 'Invitación publicada. El enlace queda activo cuando termine el deploy automático (≈2-3 minutos).'
            : 'Cambios publicados. El enlace se actualiza solo en ≈2-3 minutos.',
        });
      } else {
        setMensaje({ tono: 'error', texto: resultado.message });
      }
    } catch (err) {
      setMensaje({ tono: 'error', texto: err instanceof Error ? err.message : 'Error desconocido al preparar la publicación.' });
    } finally {
      setGuardado('nada');
    }
  }

  // --- Borrador local (sin token) ---
  function guardarBorrador() {
    const configValida = validarFormulario();
    if (!configValida) return;
    const borradorNuevo: BorradorLocal = { config: configValida, guardadoEn: new Date().toISOString() };
    localStorage.setItem(claveBorrador(sesion.slug), JSON.stringify(borradorNuevo));
    setBorrador(borradorNuevo);
    setMensaje({ tono: 'ok', texto: 'Borrador guardado en este navegador. Podés publicarlo cuando haya conexión del estudio.' });
  }

  // --- Descargar JSON (para el estudio) / WhatsApp ---
  function invitacionPublicable(): InvitacionPublicada | null {
    const configValida = validarFormulario();
    if (!configValida) return null;
    return crearInvitacionPublicada({
      slug: sesion.slug,
      config: configValida,
      ...(publicadoEn ? { publicadoEn } : {}),
    });
  }

  function descargarJson() {
    const invitacion = invitacionPublicable();
    if (!invitacion) return;
    const blob = new Blob([JSON.stringify(invitacion, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sesion.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMensaje({ tono: 'info', texto: 'Descargá el archivo y enviaselo al estudio: lo publica sin tocar el diseño.' });
  }

  function enviarPorWhatsApp() {
    if (!config) return;
    const texto =
      `Hola! Soy ${sesion.nombre}. Quiero actualizar mi invitación (${urlPublicaInvitacion(sesion.slug)}).\n\n` +
      `Campos a cambiar:\n` +
      `- Fecha y hora: ${config.evento.fechaEvento}\n` +
      `- Lugar: ${[config.evento.lugar, config.evento.ubicacion, config.evento.direccion].filter(Boolean).join(', ')}\n` +
      `- Música: ${config.musica.playlistUrl || '(sin cambios)'}\n` +
      `- Frase: “${config.dedicatoria.cita}”\n\n` +
      `¿Me lo publican? ¡Gracias!`;
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`, '_blank');
  }

  const embed = spotifyEmbedUrl(config.musica.playlistUrl);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#f0e8da]">Mi invitación</h1>
        <p className="mt-1 text-xs text-[#b3a68f]">
          Los datos que ves acá son los de tu invitación publicada. Cambialos y guardá: el diseño no se toca.
        </p>
      </div>

      {borrador && (
        <Aviso tono="alerta">
          Hay un borrador local guardado el {fechaCorta(borrador.guardadoEn)} con datos que todavía no están publicados.{' '}
          <button onClick={usarBorrador} className="underline underline-offset-2">Cargarlo</button> ·{' '}
          <button onClick={descartarBorrador} className="underline underline-offset-2">Descartarlo</button>
        </Aviso>
      )}

      {mensaje && <Aviso tono={mensaje.tono}>{mensaje.texto}</Aviso>}

      {/* Datos del evento */}
      <Tarjeta>
        <TituloSeccion>
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={17} className="text-[#d4b465]" /> Fecha, hora y lugar
          </span>
        </TituloSeccion>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <CampoTexto
            id="nombre"
            etiqueta="Nombre del agasajado"
            valor={config.evento.nombre}
            alCambiar={(v) => editarEvento({ nombre: v })}
            error={errores.nombre}
          />
          <div>
            <label htmlFor="fecha" className="block text-xs font-medium text-[#b3a68f]">
              Fecha y hora del evento
            </label>
            <input
              id="fecha"
              type="datetime-local"
              value={valorInputDesdeFecha(config.evento.fechaEvento)}
              onChange={(e) => alCambiarFecha(e.target.value)}
              aria-invalid={errores.fecha ? true : undefined}
              className={`mt-1.5 w-full rounded-xl border bg-[#262017] px-3 py-2.5 text-sm text-[#f0e8da] outline-none transition focus:border-[#d4b465] ${
                errores.fecha ? 'border-[#7a4034]' : 'border-[#3a3226]'
              }`}
            />
            {errores.fecha ? (
              <p className="mt-1 text-[11px] text-[#f2b8ad]">{errores.fecha}</p>
            ) : (
              <p className="mt-1 text-[11px] text-[#8a7d67]">Hora de Uruguay: la cuenta regresiva y el calendario se actualizan solos.</p>
            )}
          </div>
          <CampoTexto
            id="lugar"
            etiqueta="Lugar (salón, quinta…)"
            valor={config.evento.lugar}
            alCambiar={(v) => editarEvento({ lugar: v })}
            error={errores.lugar}
          />
          <CampoTexto
            id="ubicacion"
            etiqueta="Ciudad / departamento"
            valor={config.evento.ubicacion}
            alCambiar={(v) => editarEvento({ ubicacion: v })}
          />
          <CampoTexto
            id="direccion"
            etiqueta="Dirección (opcional)"
            valor={config.evento.direccion}
            alCambiar={(v) => editarEvento({ direccion: v })}
          />
          <CampoTexto
            id="mapsUrl"
            etiqueta="Enlace de Google Maps"
            valor={config.evento.mapsUrl}
            alCambiar={(v) => editarEvento({ mapsUrl: v })}
            error={errores.mapsUrl}
            placeholder="https://maps.google.com/…"
            ayuda="Lo usan los botones «Cómo llegar» y el mapa."
          />
        </div>
      </Tarjeta>

      {/* Música */}
      <Tarjeta>
        <TituloSeccion>
          <span className="inline-flex items-center gap-2">
            <Music2 size={17} className="text-[#d4b465]" /> Música
          </span>
        </TituloSeccion>
        <div className="mt-4">
          <CampoTexto
            id="playlistUrl"
            etiqueta="Enlace de Spotify (playlist, álbum o tema)"
            valor={config.musica.playlistUrl}
            alCambiar={alCambiarPlaylist}
            error={errores.playlistUrl}
            placeholder="https://open.spotify.com/playlist/…"
            ayuda="Se convierte en reproductor dentro de la invitación."
          />
          {embed && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#bfe3bf]">
              <ListMusic size={13} /> Reproductor listo: {embed}
            </p>
          )}
        </div>
      </Tarjeta>

      {/* Frase de bienvenida */}
      <Tarjeta>
        <TituloSeccion>
          <span className="inline-flex items-center gap-2">
            <ScrollText size={17} className="text-[#d4b465]" /> Frase de bienvenida
          </span>
        </TituloSeccion>
        <div className="mt-4 grid gap-4">
          <CampoTexto
            id="cita"
            etiqueta="Frase principal (cita)"
            valor={config.dedicatoria.cita}
            alCambiar={(v) => editarDedicatoria({ cita: v })}
            error={errores.cita}
            multilinea
            filas={2}
            maxLength={200}
          />
          <CampoTexto
            id="cuerpo"
            etiqueta="Texto de bienvenida (opcional)"
            valor={config.dedicatoria.cuerpo}
            alCambiar={(v) => editarDedicatoria({ cuerpo: v })}
            multilinea
            filas={3}
            maxLength={600}
          />
          <CampoTexto
            id="firma"
            etiqueta="Firma (opcional)"
            valor={config.dedicatoria.firma}
            alCambiar={(v) => editarDedicatoria({ firma: v })}
            maxLength={80}
          />
        </div>
      </Tarjeta>

      {/* Cronograma */}
      <Tarjeta>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TituloSeccion>
            <span className="inline-flex items-center gap-2">
              <PenLine size={17} className="text-[#d4b465]" /> Cronograma de la noche
            </span>
          </TituloSeccion>
          <BotonSecundario onClick={agregarMomento} icono={Plus}>
            Agregar momento
          </BotonSecundario>
        </div>
        <div className="mt-4 space-y-3">
          {config.timeline.eventos.map((momento, i) => (
            <div key={i} className="rounded-xl border border-[#3a3226] bg-[#262017] p-3">
              <div className="grid gap-2 sm:grid-cols-[5.5rem_1fr_auto]">
                <input
                  type="time"
                  value={momento.hora}
                  onChange={(e) => editarMomento(i, { hora: e.target.value })}
                  aria-label={`Hora del momento ${i + 1}`}
                  className="rounded-lg border border-[#3a3226] bg-[#1d1810] px-2 py-2 text-sm text-[#f0e8da] outline-none focus:border-[#d4b465]"
                />
                <input
                  value={momento.titulo}
                  onChange={(e) => editarMomento(i, { titulo: e.target.value })}
                  placeholder={`Momento ${i + 1} (ej.: Recepción)`}
                  aria-label={`Título del momento ${i + 1}`}
                  maxLength={60}
                  className="rounded-lg border border-[#3a3226] bg-[#1d1810] px-3 py-2 text-sm text-[#f0e8da] placeholder-[#6f6552] outline-none focus:border-[#d4b465]"
                />
                <button
                  type="button"
                  onClick={() => quitarMomento(i)}
                  aria-label={`Quitar momento ${i + 1}`}
                  className="inline-flex items-center justify-center rounded-lg border border-[#7a4034] px-2.5 py-2 text-[#f2b8ad] transition hover:bg-[#3a201a]"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <input
                value={momento.desc}
                onChange={(e) => editarMomento(i, { desc: e.target.value })}
                placeholder="Detalle (opcional)"
                aria-label={`Detalle del momento ${i + 1}`}
                maxLength={140}
                className="mt-2 w-full rounded-lg border border-[#3a3226] bg-[#1d1810] px-3 py-2 text-xs text-[#f0e8da] placeholder-[#6f6552] outline-none focus:border-[#d4b465]"
              />
            </div>
          ))}
          {config.timeline.eventos.length === 0 && (
            <p className="text-xs text-[#8a7d67]">Sin momentos: la sección de cronograma queda oculta en la invitación.</p>
          )}
        </div>
      </Tarjeta>

      {/* Guardado */}
      <PanelConexion tokenActivo={token} onCambiarToken={setToken} />

      <Tarjeta>
        <div className="flex flex-wrap items-center gap-3">
          <BotonPrincipal onClick={() => void publicar()} ocupado={guardado === 'publicando'} icono={Upload}>
            Publicar cambios
          </BotonPrincipal>
          <BotonSecundario onClick={guardarBorrador} ocupado={guardado === 'borrador'} icono={Save}>
            Guardar borrador
          </BotonSecundario>
          <BotonSecundario onClick={descargarJson} icono={Download}>
            Descargar JSON
          </BotonSecundario>
          <BotonSecundario onClick={enviarPorWhatsApp} icono={MessageCircle}>
            Enviar por WhatsApp
          </BotonSecundario>
          <BotonSecundario onClick={() => void cargar()} icono={RotateCcw}>
            Restaurar publicada
          </BotonSecundario>
        </div>
        {!token && (
          <p className="mt-3 text-[11px] leading-relaxed text-[#8a7d67]">
            Sin conexión de GitHub podés guardar el borrador y enviarnos los cambios por WhatsApp o descargar el JSON:
            lo publicamos por vos. Con la conexión activa, «Publicar cambios» hace el commit solo.
          </p>
        )}
      </Tarjeta>
    </div>
  );
}
