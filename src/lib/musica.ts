/**
 * Tonos de música de fondo para la invitación (10 pistas propias, libres de
 * derechos, generadas para Miluaistudio). Se reproducen en loop mientras el
 * invitado navega; el personalizador elige el tono o deja la invitación sin
 * música de fondo (la sección de playlist de Spotify es independiente).
 */
export interface TonoFondo {
  id: string;
  nombre: string;
  desc: string;
  src: string;
}

const BASE = '/Miluaistudio/audio';

export const TONOS_FONDO: TonoFondo[] = [
  { id: 'vals-dorado', nombre: 'Vals Dorado', desc: 'Vals elegante con piano · para XV y bodas', src: `${BASE}/fondo-01.mp3` },
  { id: 'caja-musica', nombre: 'Caja de Música', desc: 'Melodía cristalina, dulce y nostálgica', src: `${BASE}/fondo-02.mp3` },
  { id: 'piano-sereno', nombre: 'Piano Sereno', desc: 'Acordes lentos, calmos y elegantes', src: `${BASE}/fondo-03.mp3` },
  { id: 'amanecer', nombre: 'Amanecer', desc: 'Cálido y esperanzador, con campanas suaves', src: `${BASE}/fondo-04.mp3` },
  { id: 'noche-estrellas', nombre: 'Noche de Estrellas', desc: 'Ambiente mágico y nocturno', src: `${BASE}/fondo-05.mp3` },
  { id: 'fiesta-dorada', nombre: 'Fiesta Dorada', desc: 'Alegre y saltarín, con ritmo ligero', src: `${BASE}/fondo-06.mp3` },
  { id: 'jardin-flor', nombre: 'Jardín en Flor', desc: 'Arpa delicada, fresca y natural', src: `${BASE}/fondo-07.mp3` },
  { id: 'primer-baile', nombre: 'Primer Baile', desc: 'Vals romántico con melodía principal', src: `${BASE}/fondo-08.mp3` },
  { id: 'campanitas', nombre: 'Campanitas', desc: 'Carillón suave, ideal para bautismos', src: `${BASE}/fondo-09.mp3` },
  { id: 'recuerdos', nombre: 'Recuerdos', desc: 'Piano nostálgico para emocionar', src: `${BASE}/fondo-10.mp3` },
];

export const TONO_DEFAULT = 'vals-dorado';

export function tonoPorId(id: string | undefined): TonoFondo | null {
  return TONOS_FONDO.find((t) => t.id === id) ?? null;
}

export function nombreTono(id: string | undefined): string {
  return tonoPorId(id)?.nombre ?? '—';
}
