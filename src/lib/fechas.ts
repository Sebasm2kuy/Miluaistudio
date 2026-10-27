/**
 * Fechas del evento — estrategia única para todo el sitio.
 *
 * Uruguay (America/Montevideo) usa GMT-3 todo el año (sin horario de verano
 * desde 2015), así que fijar el offset explícito `-03:00` es equivalente a
 * resolver la zona America/Montevideo y funciona en todos los navegadores,
 * sin depender de la zona horaria del dispositivo del invitado.
 *
 * Formato de entrada: "YYYY-MM-DD HH:mm" (el que usan config.evento.fechaEvento
 * y el personalizador).
 */

export const OFFSET_MONTEVIDEO = '-03:00';

/** Convierte "YYYY-MM-DD HH:mm" en un Date absoluto en hora de Montevideo. */
export function fechaEventoEnMontevideo(fechaEvento: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec((fechaEvento || '').trim());
  if (!m) return null;
  const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00${OFFSET_MONTEVIDEO}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

/** Etiqueta legible del instante en hora de Montevideo (para mensajes). */
export function fechaLegibleMontevideo(d: Date): string {
  // Formateo manual con el offset fijo: 3 horas menos que UTC.
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const local = new Date(utc - 3 * 3600000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${local.getDate()}/${local.getMonth() + 1}/${local.getFullYear()} ${pad(local.getHours())}:${pad(local.getMinutes())} hs (Uruguay)`;
}
