# Prueba manual controlada del Web App de RSVP (Apps Script desplegado)

> **Estado: PENDIENTE DE EJECUCIÓN HUMANA.** El entorno de esta iteración no
> permite ejecutar el Web App real de Google (requiere una implementación
> activa en la cuenta de Google del propietario). Lo que sigue es el guion
> exacto para ejecutar la prueba con datos 100% ficticios y registrar el
> resultado. No se afirma ninguna verificación del servicio externo hasta
> completarla.

## Objetivo

Confirmar que la URL **realmente desplegada** del Web App (la pegada en
`rsvp.googleSheetUrl`) responde al contrato POST que usa el frontend
(`src/lib/rsvp-client.ts`) y que una fila de prueba aparece en la hoja
correcta.

## Recordatorios

- Editar `google-apps-script/gallery-server.gs` en el repo **NO** actualiza
  el Web App ya desplegado: hay que crear una nueva implementación
  (Implementar → Nueva implementación, o "Probar implementaciones") y usar
  la URL de la implementación vigente.
- Usar SOLO datos ficticios: nombre "Invitado Prueba", teléfono con ceros.
- Nunca pegar la URL real del Web App ni tokens en este documento, en PRs ni
  en capturas.

## Pasos

1. **Identificar la implementación vigente**: script.google.com → proyecto
   "Miluaistudio - RSVP" → Implementar → la URL `…/macros/s/<id>/exec` de la
   implementación activa. Copiarla temporalmente.

2. **Probar el contrato POST con curl** (solicitud "simple" igual que el
   frontend, sin preflight CORS):
   ```bash
   curl -sS -X POST "URL_REAL_DEL_WEB_APP" \
     -H "Content-Type: text/plain;charset=utf-8" \
     --data '{"tipo":"rsvp_grupo","codigo":"MIL-0000","cantidad":1,
              "invitados":["Invitado Prueba"],"telefono":"099000000",
              "fecha":"2026-10-28T12:00:00.000Z"}'
   ```
   Resultado esperado según el contrato (`google-apps-script/gallery-server.gs`):
   `{"success":true,...}`.

3. **Verificar en la hoja**: abrir el spreadsheet
   "MilagrosXV_Galeria_DB" → pestaña **RSVP** → comprobar que existe una fila
   nueva con código `MIL-0000`, 1 invitado ("Invitado Prueba") y teléfono
   `59899000000` (normalizado) o `099000000` según la versión del script.

4. **Probar la respuesta de error** (la UI debe mostrar "error", no éxito):
   ```bash
   curl -sS -X POST "URL_REAL_DEL_WEB_APP" \
     -H "Content-Type: text/plain;charset=utf-8" \
     --data '{"tipo":"rsvp_grupo","codigo":"MIL-0000","cantidad":0,
              "invitados":[],"telefono":"x","fecha":"2026-10-28T12:00:00.000Z"}'
   ```
   Esperado: `{"success":false,"error":"…"}`.

5. **Probar el flujo de la UI** (opcional, con la invitación de ejemplo):
   - En una invitación publicada con `rsvp.googleSheetUrl` configurado,
     completar el formulario con datos ficticios y enviar.
   - Estados esperados: `guardado` si la respuesta es `success:true`;
     `pendiente` si el navegador no puede leer la respuesta (CORS/red) con el
     fallback de WhatsApp VISIBLE; `error` si el backend responde error.

## Resultados registrados

| Fecha | Paso | Resultado | Ejecutado por |
|-------|------|-----------|---------------|
| — | 2. POST válido | PENDIENTE | — |
| — | 3. Fila en la hoja | PENDIENTE | — |
| — | 4. POST inválido | PENDIENTE | — |
| — | 5. UI con datos ficticios | PENDIENTE | — |

Criterio de cierre: los 4 pasos completados con los resultados esperados y
anotados acá. Cualquier desvío (respuesta HTML sin JSON, `ok:true` en vez de
`success:true`, fila en otra pestaña) se registra tal cual: el frontend ya
trata esas respuestas como `pendiente` y NO como éxito verificable.
