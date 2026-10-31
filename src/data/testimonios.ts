/**
 * Reseñas mostradas en la portada y en el catálogo.
 *
 * ⚠️ HONESTIDAD COMERCIAL: ninguna entrada de esta lista está verificada
 * todavía. Mientras `estado: 'muestra'`, la interfaz las presenta como
 * EJEMPLOS (no como reseñas de clientes reales).
 * Cuando el negocio valide una reseña real y autorizada por el cliente,
 * marcala como `estado: 'verificado'` y la UI la mostrará como reseña.
 */
export interface Testimonio {
  nombre: string;
  evento: string;
  comentario: string;
  /** 'verificado' = reseña real autorizada; 'muestra' = ejemplo de referencia */
  estado?: 'verificado' | 'muestra';
}

export const TESTIMONIOS: Testimonio[] = [
  {
    nombre: 'Valentina R.',
    evento: 'Fiesta de 15',
    comentario:
      'La invitación quedó hermosa. La compartí por WhatsApp y todos confirmaron con el formulario. Súper recomendable.',
    estado: 'muestra',
  },
  {
    nombre: 'Martín & Camila',
    evento: 'Casamiento',
    comentario:
      'Nos encantó el resultado. La atención fue rápida y el enlace con música fue el detalle que más les gustó a los invitados.',
    estado: 'muestra',
  },
  {
    nombre: 'Lucía M.',
    evento: 'Fiesta de 15',
    comentario:
      'Elegí el diseño de rosas y quedó igualito a la demo. Me la entregaron lista para mandar en pocos días.',
    estado: 'muestra',
  },
  {
    nombre: 'Diego F.',
    evento: 'Boda',
    comentario:
      'Muy buena onda y rapidez para todo. La cuenta regresiva y el mapa al salón fueron lo más útil. Excelente atención.',
    estado: 'muestra',
  },
  {
    nombre: 'Sofía B.',
    evento: 'Fiesta de 15',
    comentario:
      'Se ve elegante y funciona perfecto en el celular. Varios invitados me preguntaron quién había hecho la invitación.',
    estado: 'muestra',
  },
  {
    nombre: 'Rodrigo & Ana',
    evento: 'Casamiento',
    comentario:
      'Todo el proceso fue sencillo: elegimos el diseño, pasamos los datos y en días teníamos el enlace. Lo recomendamos.',
    estado: 'muestra',
  },
];
