'use client';

// ============================================================
// /dashboard — RESUMEN DEL ESTADO DE LA INVITACIÓN
// ------------------------------------------------------------
// Vista general para el cliente: estado (Publicada vs. Sin publicar,
// leído del repo), previsualización del enlace con copia, fecha del
// evento con días restantes y resumen de confirmaciones. Datos vía
// lectura anónima de la API de GitHub (sin token).
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, CalendarDays, Check, Copy, ExternalLink, Eye, MessageCircle, PenLine, RefreshCw, Users } from 'lucide-react';
import { rutaArchivoInvitacion, urlPublicaInvitacion, validarInvitacionPublicada, type InvitacionPublicada } from '@/data/invitacion-publicada';
import { rutaArchivoRsvps, resumenRsvps, validarColeccionRsvps, type ColeccionRsvps, type EntradaRsvp } from '@/data/rsvps-esquema';
import { fechaEventoEnMontevideo } from '@/lib/fechas';
import { leerJSON } from '@/lib/github-db';
import { useSesionCliente } from './guardia';
import { Aviso, BotonPrincipal, BotonSecundario, Esqueleto, Insignia, Tarjeta, TituloSeccion, fechaCorta } from '@/components/dashboard/ui';
import { whatsappLink } from '@/data/contacto';

type EstadoCarga = 'cargando' | 'ok' | 'error';

export default function PanelResumen() {
  const sesion = useSesionCliente();
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [invitacion, setInvitacion] = useState<InvitacionPublicada | null>(null);
  const [rsvps, setRsvps] = useState<EntradaRsvp[]>([]);
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    setError('');

    const lecturaInvitacion = await leerJSON<unknown>(rutaArchivoInvitacion(sesion.slug));
    if (lecturaInvitacion.ok) {
      setInvitacion(validarInvitacionPublicada(lecturaInvitacion.data));
    } else if (lecturaInvitacion.motivo === 'no-existe') {
      setInvitacion(null); // borrador: todavía no se publicó
    } else {
      setEstado('error');
      setError(lecturaInvitacion.mensaje);
      return;
    }

    const lecturaRsvps = await leerJSON<ColeccionRsvps>(rutaArchivoRsvps(sesion.slug));
    if (lecturaRsvps.ok) {
      const coleccion = validarColeccionRsvps(lecturaRsvps.data);
      setRsvps(coleccion ? coleccion.rsvps : []);
    } else {
      setRsvps([]); // sin archivo = sin confirmaciones aún (estado normal)
    }

    setEstado('ok');
  }, [sesion.slug]);

  useEffect(() => {
    // Carga inicial desde la API de GitHub (sistema externo, solo cliente).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  const publicada = Boolean(invitacion);
  const enlace = urlPublicaInvitacion(sesion.slug);
  const resumen = resumenRsvps(rsvps);
  const fechaEvento = invitacion ? fechaEventoEnMontevideo(invitacion.config.evento.fechaEvento) : null;
  const diasRestantes = fechaEvento
    ? Math.ceil((fechaEvento.getTime() - Date.now()) / (24 * 3600 * 1000))
    : null;

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sin permisos del portapapeles: el enlace sigue visible para copiar a mano
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-[#f0e8da]">Hola, {sesion.nombre}</h1>
          <p className="mt-1 text-xs text-[#b3a68f]">Así está tu invitación hoy.</p>
        </div>
        <BotonSecundario onClick={() => void cargar()} ocupado={estado === 'cargando'} icono={RefreshCw}>
          Actualizar
        </BotonSecundario>
      </div>

      {estado === 'error' && <Aviso tono="error">{error} <button onClick={() => void cargar()} className="underline underline-offset-2">Reintentar</button></Aviso>}

      {estado === 'cargando' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Esqueleto className="h-36" />
          <Esqueleto className="h-36" />
          <Esqueleto className="h-36" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Estado de la invitación */}
            <Tarjeta>
              <TituloSeccion>Estado</TituloSeccion>
              <div className="mt-3">
                {publicada ? (
                  <Insignia tono="ok">
                    <BadgeCheck size={13} /> Publicada
                  </Insignia>
                ) : (
                  <Insignia tono="alerta">Sin publicar</Insignia>
                )}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#b3a68f]">
                {publicada
                  ? `Última actualización: ${fechaCorta(invitacion?.actualizadoEn || '')}. Cada cambio publicado se refleja en el enlace en ≈2-3 minutos.`
                  : 'Tu invitación todavía no fue publicada. Cargá los datos desde «Mi invitación» y publicala (necesitás la conexión del estudio), o escribinos y lo hacemos por vos.'}
              </p>
            </Tarjeta>

            {/* Enlace para compartir */}
            <Tarjeta>
              <TituloSeccion>Tu enlace</TituloSeccion>
              <p className="mt-3 break-all rounded-xl border border-[#3a3226] bg-[#262017] px-3 py-2 font-mono text-[11px] text-[#d4b465]">
                {enlace.replace('https://', '')}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <BotonSecundario onClick={() => void copiarEnlace()} icono={copiado ? Check : Copy}>
                  {copiado ? '¡Copiado!' : 'Copiar'}
                </BotonSecundario>
                {publicada ? (
                  <a
                    href={enlace}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3a3226] px-4 py-2.5 text-sm font-medium text-[#d8cbb2] transition hover:border-[#57503f] hover:bg-[#262017]"
                  >
                    <Eye size={15} /> Abrir
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-[#3a3226] px-4 py-2.5 text-sm text-[#6f6552]" title="Disponible al publicar">
                    <ExternalLink size={15} /> Abrir
                  </span>
                )}
              </div>
            </Tarjeta>

            {/* Fecha del evento */}
            <Tarjeta>
              <TituloSeccion>Tu evento</TituloSeccion>
              {fechaEvento ? (
                <>
                  <p className="mt-3 flex items-center gap-2 text-sm text-[#f0e8da]">
                    <CalendarDays size={16} className="text-[#d4b465]" />
                    {fechaEvento.toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="mt-1 text-xs text-[#b3a68f]">
                    {fechaEvento.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })} hs
                    {diasRestantes !== null && diasRestantes >= 0 && ` · faltan ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}`}
                  </p>
                  <p className="mt-2 text-xs text-[#8a7d67]">
                    {invitacion?.config.evento.lugar}
                    {invitacion?.config.evento.ubicacion ? `, ${invitacion.config.evento.ubicacion}` : ''}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-xs text-[#b3a68f]">La fecha se muestra cuando la invitación esté publicada.</p>
              )}
            </Tarjeta>
          </div>

          {/* Confirmaciones — resumen */}
          <Tarjeta>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TituloSeccion>Confirmaciones de asistencia</TituloSeccion>
              <Link
                href="/dashboard/confirmaciones/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#d4b465] underline decoration-[#d4b465]/30 underline-offset-4 transition hover:text-[#e2c67c]"
              >
                <Users size={14} /> Ver la lista completa
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { etiqueta: 'Grupos', valor: resumen.grupos },
                { etiqueta: 'Personas', valor: resumen.personas },
                { etiqueta: 'Asisten', valor: resumen.asisten },
                { etiqueta: 'No asisten', valor: resumen.noAsisten },
              ].map(({ etiqueta, valor }) => (
                <div key={etiqueta} className="rounded-xl border border-[#3a3226] bg-[#262017] px-3 py-3 text-center">
                  <p className="font-serif text-2xl text-[#d4b465]">{valor}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[#8a7d67]">{etiqueta}</p>
                </div>
              ))}
            </div>
          </Tarjeta>

          {/* Acciones rápidas */}
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/editar/">
              <BotonPrincipal icono={PenLine}>Editar mi invitación</BotonPrincipal>
            </Link>
            <a href={whatsappLink(`Hola! Soy ${sesion.nombre} (invitación "${sesion.slug}") y tengo una consulta desde mi panel.`)} target="_blank" rel="noreferrer">
              <BotonSecundario icono={MessageCircle}>Escribir al estudio</BotonSecundario>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
