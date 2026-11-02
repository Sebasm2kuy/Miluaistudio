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
   - Verificación anti-falso-éxito: tras un envío que termina en `error` (o
     repetir el paso 4 desde la UI si aplica), comprobar que la interfaz
     NUNCA muestra “confirmado/guardado” y que NO aparece fila nueva en la
     hoja. Si la UI afirmara éxito sin `success:true` verificable, registrar
     el desvío acá: sería un bug del cliente, no del servicio externo.

## Resultados registrados

| Fecha | Paso | Resultado | Ejecutado por |
|-------|------|-----------|---------------|
| 2026-11-02 | 2. POST válido | DESVÍO: HTTP 404 de Google (página «el archivo solicitado no existe» de Drive), sin JSON de contrato. La URL reportada como activa no corresponde a ninguna implementación vigente. | Z.AI (agente) |
| 2026-11-02 | 3. Fila en la hoja | No verificable: el POST nunca alcanzó el contrato (404). | Z.AI (agente) |
| 2026-11-02 | 4. POST inválido | DESVÍO: el mismo 404. Control adicional: un ID inventado devuelve la MISMA página de error → la URL está inactiva; no es un problema del contrato ni del envío. | Z.AI (agente) |
| — | 5. UI con datos ficticios | PENDIENTE | — |

> **2026-11-02 — decisión:** mientras el Web App no responda JSON del contrato,
> NO se configura `rsvp.googleSheetUrl` en ninguna invitación publicada ni se
> activa `ENDPOINT_REGISTRO` (src/data/registro-auto.ts, iteración 036 — el
> mismo backend de Apps Script sirve ambas acciones): el frontend mostraría
> «pendiente» siempre y cada registro esperaría el timeout (correctamente:
> nunca se afirma un guardado sin respuesta verificable). Reactivar el flujo
> exige crear la implementación (Implementar → **Nueva implementación**,
> acceso **«Cualquier persona»**, con el `.gs` actual y las Propiedades del
> script), copiar la URL `/exec` VIGENTE de esa implementación, probarla en el
> navegador (no debe abrir el 404 de Drive) y re-ejecutar los pasos 2-4 de
> esta tabla; recién entonces configurar `rsvp.googleSheetUrl` +
> `rsvp.slugInvitacion` en los JSON de `content/invitaciones/` y/o pegar la
> URL en `ENDPOINT_REGISTRO`. Verificación segura sin crear datos: POST
> `registro_cliente` con credencial inválida → `{"success":false,...}`.

Criterio de cierre: los 4 pasos completados con los resultados esperados y
anotados acá. Cualquier desvío (respuesta HTML sin JSON, `ok:true` en vez de
`success:true`, fila en otra pestaña) se registra tal cual: el frontend ya
trata esas respuestas como `pendiente` y NO como éxito verificable.
