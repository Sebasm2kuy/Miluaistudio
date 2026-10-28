# Iteración 020 — Importar el pedido por WhatsApp: los datos del cliente cargan solos

**Fecha:** 29-10-2026 · **Rama:** `feat/importar-pedido-whatsapp`

## Necesidad del propietario

> «cuando terminan de editarla y me la mandan ¿cómo llega ese mensaje para que no
> tenga que re hacerla yo, ya que se tomaron el trabajo de completar los datos?»

Hoy el cliente completa todo en `/personalizar/` y toca «Enviar mi configuración»
(paso 3): le llega al estudio un mensaje de WhatsApp con TODOS los datos
(`mensajeWhatsAppPersonal`: diseño, evento, nombre, fecha, lugar, dirección,
dress code, Instagram, frase, historia, Spotify, apertura, música de fondo,
cronograma, tipografía, acento y secciones prendidas/apagadas). El problema: ese
mensaje llegaba como TEXTO y el propietario tenía que re-copiar los datos a mano
en la invitación final.

## Decisión

Importador del mensaje dentro del editor: **pegar el mensaje → leer → cargar**.

- Nueva unidad `src/lib/importar-whatsapp.ts`: convierte el texto del mensaje de
  vuelta a `DatosPersonales` + diseño + secciones. El contrato de etiquetas es el
  propio `mensajeWhatsAppPersonal` (fuente única). Tolerante a viñetas •/-/*,
  negritas de WhatsApp, valores «—», comillas, @ de Instagram y fecha
  dd/mm/aaaa. Nunca lanza: `ok:false` con mensaje entendible.
- Honesto por diseño: la historia llega RECORTADA (~90 caracteres, así es el
  mensaje) → aviso explícito; sin fecha legible → aviso; cronograma pendiente →
  aviso; tono/apertura/tipografía/acento no reconocidos → aviso + valor por
  defecto seguro.
- UI: grupo **«Importar pedido por WhatsApp»** primero en Ajustes del editor
  (`/editar/`), con textarea + «Leer el mensaje» (vista previa de lo entendido,
  con ✓ por campo y ⚠ por aviso) + «Cargar en la invitación».
- Aplicar reemplaza el borrador del editor por la MISMA vía del puente
  personalizador→editor (`createPersonalConfig` + `saveConfig`): comportamiento
  idéntico al flujo ya probado. Publicar sigue exigiendo el token del
  propietario — la importación no cambia nada de los permisos.

## Cambios

- `src/lib/importar-whatsapp.ts` (nuevo): parser + `ResultadoImportacion`
  (ok/error/datos/designId/secciones/leidos/avisos).
- `src/components/editor/PanelImportarWhatsApp.tsx` (nuevo): UI de pegar → leer
  → cargar.
- `src/lib/editor-campos.ts`: panel `importar-wa` primero en `PANELES_AJUSTES`.
- `src/components/editor/PanelAjustes.tsx`: props `onImportarLeer` /
  `onImportarAplicar` + rama `renderCustom`.
- `src/app/editar/page.tsx`: callbacks de importación (leer puro; aplicar =
  createPersonalConfig + saveConfig + cerrar Ajustes + modo edición).
- Imports relativos en `src/lib/personalizador.ts`, `src/data/demo-config.ts` e
  `importar-whatsapp.ts`: los módulos incluidos en la suite de Node usan esa
  forma (convención de editor-campos/editor-config). Sin cambios de resolución
  en la app (el alias `@/` sigue siendo válido; aquí se alinea con el estándar
  del suite).
- `tests/privacidad-config.test.ts`: el guardia de la demo acepta alias O
  relativo para tiparse desde el esquema (la intención era de privacidad, no de
  estilo de import).
- `tsconfig.tests.json`: incluye los módulos del cierre del importador.

## Alternativas descartadas

- **Config en la URL de WhatsApp**: el SiteConfig completo serializado supera
  largamente los límites prácticos de un enlace compartible.
- **Archivo JSON descargable**: más fricción para el cliente (descargar +
  adjuntar) y no aporta sobre el mensaje que YA se manda.
- **Endpoint de borradores (Apps Script)**: backend nuevo para un problema que
  el mensaje de WhatsApp ya resuelve.

## Pruebas

- `npm test`: **138/138** (11 nuevos: round-trip completo, mínimos, historia
  recortada, sin fecha, texto ajeno, diseño desconocido, sin diseño, tolerancia
  a negritas/«—», cronograma con guión simple, límite de 10 momentos).
- lint OK · typecheck OK · build OK (verify-export §7 y verify-privacy intactos).
- Emulador 390×844 sobre el export: Ajustes → grupo «Importar pedido…» → pegar
  mensaje real → «Leer» muestra los 15 campos y 0 avisos → «Cargar» cierra
  Ajustes y el editor muestra la invitación con Martina / Salón Imperial /
  fecha 2027-05-15 21:30 / 2 momentos / secciones correctas; borrador persistido
  en localStorage. Sin overflow horizontal.
- **Pendiente del propietario:** probar con un mensaje REAL recibido por
  WhatsApp (pasos nuevos del guion manual).
