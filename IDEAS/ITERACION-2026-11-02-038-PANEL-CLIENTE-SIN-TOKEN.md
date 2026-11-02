# Iteración 038 — Panel de cliente sin token de GitHub (02-11-2026)

## Pedido

La tarjeta «Conexión con GitHub» (que pide un token PAT) estaba visible para los usuarios finales del panel de clientes (`/dashboard/`, `/dashboard/editar/` y `/dashboard/confirmaciones/`). El estudio pidió eliminar por completo ese bloque de autenticación técnica de desarrollo de todo el layout del panel, para que los clientes nunca vean campos de tokens ni ajustes de desarrollo.

## Decisión

- **Fuera el bloque de conexión en todas las pestañas.** El componente `components/dashboard/panel-conexion.tsx` (tarjeta + helpers de token en `sessionStorage` `lgs_token_github`) se **elimina del repo**: era su único uso.
- **El panel de cliente pasa a ser de SOLO LECTURA** respecto del repositorio: sin token no hay escrituras directas desde el navegador del cliente, y no se dejan rutas muertas ni botones que pidan «conectar» algo invisible.
  - `/dashboard/editar/`: se quita «Publicar cambios» (hacía un commit directo con el token). Quedan **Guardar borrador** (pasa a botón principal), **Descargar JSON**, **Enviar por WhatsApp** y **Restaurar publicada**. El texto de guardado explica que el estudio publica los cambios (≈2-3 min).
  - `/dashboard/confirmaciones/`: se quitan el alta manual y las acciones de alternar asistencia / eliminar (requerían token). Quedan la lista con autoactualización de 25 s, filtros, búsqueda, **Exportar CSV** y **Avisar por WhatsApp** para altas y correcciones.
  - `/dashboard/` (Resumen): el texto de «Sin publicar» ya no menciona conexiones: pide enviar los cambios por WhatsApp o JSON.
- **El flujo del estudio no cambia:** `/editar/` (editor del estudio) y `/admin/` conservan sus propias conexiones con token; las confirmaciones de invitados siguen entrando por el formulario de la invitación vía backend (registro automático, 037) y el espejo a `content/rsvps/`.
- Los helpers de escritura (`escribirJSON`, `agregarEntradaRsvp` en `lib/github-db.ts`) quedan intactos en la librería: los usa el estudio; ya no son alcanzables desde el panel de cliente.

## Cambios

- ELIMINADO `src/components/dashboard/panel-conexion.tsx`.
- `src/app/dashboard/editar/page.tsx` — sin token, sin `publicar()`, sin `publicarInvitacionEnGitHub`; guardado reordenado (borrador principal + WhatsApp/JSON).
- `src/app/dashboard/confirmaciones/page.tsx` — solo lectura (lectura anónima + CSV + WhatsApp); sin estado ni funciones de escritura.
- `src/app/dashboard/page.tsx` — copy de «Sin publicar» actualizado.
- `src/app/dashboard/layout.tsx` + `guardia.tsx` — comentarios actualizados a la nueva doctrina.

## Por qué es más seguro

El token fine-grained del repositorio dejaba de ser un secreto del estudio cada vez que un cliente publicaba desde su navegador (viva en `sessionStorage` de la pestaña del cliente). Con esta iteración el token solo se usa en las herramientas del estudio, y la superficie visible del panel queda 100 % operativa (datos del evento, confirmaciones, CSV).
