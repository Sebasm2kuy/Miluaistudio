/**
 * Reseñas de clientes mostradas en la portada y en el catálogo.
 * Editá o agregá entradas acá y se reflejan en ambas páginas.
 */
export interface Testimonio {
  nombre: string;
  evento: string;
  comentario: string;
}

export const TESTIMONIOS: Testimonio[] = [
  {
    nombre: 'Valentina R.',
    evento: 'Fiesta de 15',
    comentario:
      'La invitación quedó hermosa. La compartí por WhatsApp y todos confirmaron con el formulario. Súper recomendable.',
  },
  {
    nombre: 'Martín & Camila',
    evento: 'Casamiento',
    comentario:
      'Nos encantó el resultado. La atención fue rápida y el enlace con música fue el detalle que más les gustó a los invitados.',
  },
  {
    nombre: 'Lucía M.',
    evento: 'Fiesta de 15',
    comentario:
      'Elegí el diseño de rosas y quedó igualito a la demo. Me la entregaron lista para mandar en pocos días.',
  },
  {
    nombre: 'Diego F.',
    evento: 'Boda',
    comentario:
      'Muy buena onda y rapidez para todo. La cuenta regresiva y el mapa al salón fueron lo más útil. Excelente precio.',
  },
  {
    nombre: 'Sofía B.',
    evento: 'Fiesta de 15',
    comentario:
      'Se ve elegante y funciona perfecto en el celular. Varios invitados me preguntaron quién había hecho la invitación.',
  },
  {
    nombre: 'Rodrigo & Ana',
    evento: 'Casamiento',
    comentario:
      'Todo el proceso fue sencillo: elegimos el diseño, pasamos los datos y en días teníamos el enlace. Lo recomendamos.',
  },
];
