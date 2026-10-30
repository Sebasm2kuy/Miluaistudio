# Iteración 024 — Música directa desde Spotify + sección de servicios extra

**Fecha:** 30-10-2026
**Rama:** `feat/spotify-directo-servicios`
**Estado:** completada (pendiente de revisión del propietario en teléfono físico)

## Pedido del propietario

> «analiza esta web y sin copiar todo textual haz que se vea lo mas funcional agregando mas
> opciones como las que se ven ahi, album digital, edicion de video, video de recopilacion
> para historia de vida, trailers, esta seccion me interesa desarrollarla en un futuro
> proximo https://invitio.events/es#planning, la musica quita los tonos que creaste para que
> sea una eleccion directa desde spotify»

Dos frentes: (1) música = elección directa desde Spotify, fuera los 10 tonos generados;
(2) presentar en el sitio los servicios que se van a desarrollar a futuro (álbum digital,
edición de video, video de historia de vida, tráilers), tomando la referencia como guía de
categorías pero con textos 100% propios.

## Análisis de la referencia (invitio.events)

Hechos útiles observados (sin copiar textos):
- Presenta «complementos» pagos aparte (álbum digital, mesa de regalos) con lista de
  features por tarjeta y CTA propia.
- Su FAQ reconoce que Spotify/Apple Music no pueden sonar en automático (solo archivos
  MP3): coincide con la decisión técnica que ya teníamos (embed con toque del invitado).
- Ofrece organización (planning) como producto distinto de la invitación.

Lo que hicimos con eso: una sección «próximamente» honesta de servicios extra en la
portada (no se cobra nada todavía) + FAQ + enlace en el pie. Nada se copió textualmente;
los cuatro servicios y sus features se redactaron desde cero.

## Cambios — música (los tonos fuera)

- **Eliminado el sistema de tonos completo:** `src/lib/musica.ts` (TONOS_FONDO,
  tonoPorId, nombreTono), `src/components/musica-fondo.tsx` (botón flotante con loop),
  `config.musicaFondo` del schema, campo del editor móvil (Ajustes → Sobre y apertura
  pasa a llamarse «Sobre y apertura»), detección de tonos en el importador de WhatsApp y
  los 10 MP3 de `public/audio/` (−5,4 MB del repo y del bundle publicado). El mensaje de
  WhatsApp del cliente ya no incluye la línea «Música de fondo».
- **Nuevo panel «Tu música, directo desde Spotify»** en el personalizador: campo único
  de enlace + feedback en vivo (✓ Reconocido / «no parece de Spotify» con instrucción de
  copiar desde Compartir) + **reproductor embebido de previsualización** (iframe 152px)
  que es exactamente el que verán los invitados. El campo salió de la grilla de datos y
  es un panel propio, al mismo nivel que Apertura y Cronograma.
- **Invitación:** la sección de música (SpotifyPlayer) es ahora la única forma de música.
  Spotify exige toque del invitado para reproducir (sin autoplay) — se comunica en el
  panel con una nota honesta.
- `spotifyEmbedUrl` (ya existente) es la función de conversión; ahora con tests propios.

## Cambios — servicios extra (próximamente)

- **`src/data/servicios.ts` (nuevo):** 4 servicios con id, nombre, tagline, descripción
  y 3 puntos cada uno: álbum digital, edición de video, video de tu historia, tráiler
  del evento. Textos propios; badge «Próximamente» en la UI.
- **`src/app/page.tsx`:** sección `#servicios` entre «Cómo funciona» y «Reseñas», con
  tarjetas 2×2, badge dorado por tarjeta, CTA de WhatsApp con mensaje específico
  (`MENSAJE_SERVICIOS_EXTRA`) y nota honesta «nada de esto se cobra todavía». Nueva
  entrada en las preguntas frecuentes («¿También hacen álbum de fotos o videos…?») y
  enlace «Próximamente» en el pie.
- `contacto.ts` sigue siendo la única fuente de verdad del número; el mensaje nuevo vive
  en `servicios.ts` junto a los datos que lo usan.

## Opciones descartadas

- **Mantener los tonos como alternativa a Spotify:** el pedido fue directo («quita los
  tonos»); dos sistemas de música paralelos confundían al cliente y sumaban 5,4 MB.
- **Autoplay con MP3 del cliente:** requeriría hosting de audio y gestión de derechos;
  Spotify embed es la elección «directa» pedida y respeta las políticas de reproducción.
- **Copiar la redacción de Invitio:** los textos son propios (verificado por test: la
  palabra «invitio» no aparece en los datos de servicios).

## Tests

- **`tests/servicios-spotify.test.ts` (nuevo, 5):** conversión a embed de playlist/
  álbum/tema/show/episodio (con y sin `?si=`, con y sin protocolo), enlaces ajenos →
  null sin lanzar, integridad de los 4 servicios (ids únicos, textos completos, 3
  puntos, sin menciones a la referencia), CTA con mensaje concreto, y la config demo
  sin restos de `musicaFondo` ni `/audio/fondo-`.
- **`tests/importar-whatsapp.test.ts`:** fixtures sin `musicaFondo`; nuevo test de
  mensaje ANTIGUO con línea «Música de fondo: Vals Dorado» → importa en silencio (la
  línea se ignora, sin avisos).
- **`tests/editor-campos.test.ts`:** fixture base sin `musicaFondo`.

## Pruebas realizadas

- **Automáticas:** 156/156 tests (6 nuevos), lint 0, typecheck 0, build + prune +
  verify-export §7 (enlaces del editor móvil) + verify-privacy OK.
- **Emulador 390×844:** personalizador sin panel de tonos y con panel Spotify: enlace
  válido → «✓ Reconocido» + iframe de preview montado; enlace de YouTube → aviso rojo
  «no parece de Spotify» + iframe removido. Demo rosa-romantica: sin botón flotante de
  tonos, sección #musica con iframe de Spotify intacta.
- **Emulador 1280×800:** portada con la sección #servicios (4 tarjetas con badge
  «Próximamente», CTA «Consultar por los extras»), FAQ nueva y enlace del pie.
- **Pendiente (honestidad):** revisión del propietario en teléfono físico.

## Próximos pasos (cuando se desarrolle la sección en serio)

- Álbum digital: subir fotos desde la invitación (ya existe el esqueleto de subida de
  galería con moderación) + QR + descarga ZIP.
- Video/historia/tráiler: son servicios de producción manual al inicio (no de la web);
  la CTA de WhatsApp basta como primer paso comercial.
- Cuando uno se active: quitar el badge «Próximamente» de ese servicio y sumar precio.
