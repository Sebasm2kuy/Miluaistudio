/**
 * Catálogo de aperturas animadas de la invitación.
 * El cliente elige una en el personalizador; `Apertura` (componente) la dibuja
 * sobre los colores del diseño elegido. `sobre` es la apertura clásica original.
 */
export interface AperturaMeta {
  id: string;
  nombre: string;
  desc: string;
  /** Glifo decorativo para el selector (solo UI del personalizador) */
  glifo: string;
}

export const APERTURAS_META: AperturaMeta[] = [
  { id: 'sobre', nombre: 'Sobre clásico', desc: 'La portada de tu invitación con un brillo suave y “tocá para abrir”', glifo: '✉' },
  { id: 'cortina', nombre: 'Cortinas de gala', desc: 'Cortinas que se corren a los lados como en un teatro', glifo: '🎭' },
  { id: 'regalo', nombre: 'Caja de regalo', desc: 'Una caja con moño que se abre con destellos dorados', glifo: '🎁' },
  { id: 'corazon', nombre: 'Corazón que late', desc: 'Un corazón brillante que late y crece al abrir', glifo: '❤' },
  { id: 'estrellas', nombre: 'Cielo estrellado', desc: 'Estrellas titilando y un destello que anuncia la noche', glifo: '✦' },
  { id: 'puerta', nombre: 'Gran puerta', desc: 'Dos puertas doradas que se abren hacia la celebración', glifo: '🚪' },
  { id: 'pergamino', nombre: 'Pergamino real', desc: 'Un pergamino antiguo que se despliega con tu nombre', glifo: '📜' },
  { id: 'ticket', nombre: 'Ticket dorado', desc: 'Una entrada VIP con tu nombre que se desliza al abrir', glifo: '🎫' },
  { id: 'flores', nombre: 'Flor que florece', desc: 'Pétalos que se abren uno a uno alrededor de tu nombre', glifo: '❀' },
  { id: 'confeti', nombre: 'Lluvia de confeti', desc: 'Confeti cayendo sin parar hasta que abrís la fiesta', glifo: '🎉' },
];

export const APERTURA_DEFAULT = 'sobre';

export function nombreApertura(id: string | undefined): string {
  return APERTURAS_META.find((a) => a.id === id)?.nombre ?? 'Sobre clásico';
}
